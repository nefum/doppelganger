import {JSDOM} from 'jsdom';
import AsyncLock from "async-lock";
import {NextRequest, NextResponse} from "next/server";
import createRfb from "@/app/devices/[id]/snapshot/rfb-shim";
import {depolyfillNode, polyfillNode} from "@/app/devices/[id]/snapshot/node-shim";
import {getDeviceIdFromUrl, getDeviceInfoForId} from "../../../../../server/device-info/device-info";

// this lock will ensure that only one window is created per nodejs process
const globalWindowLock = new AsyncLock();

type CanvasOutput = `data:image/png;base64,${string}`;

export async function GET(request: NextRequest) {
  // we need to connect to /devices/[id]/kasmvnc with RFB and then take a screenshot using node-canvas (jsdom has a node-canvas integ.)

  const id = getDeviceIdFromUrl(request.nextUrl);
  if (!id) {
    return NextResponse.json(
      {
        error: "Bad Request"
      },
      {
        status: 400
      }
    )
  }

  const deviceInfo = getDeviceInfoForId(id);
  if (!deviceInfo) {
    return NextResponse.json(
      {
        error: "Device not found"
      },
      {
        status: 404
      }
    )
  }

  // TODO: check authorization for device

  const referrerUrl = new URL(deviceInfo.url);
  referrerUrl.protocol = referrerUrl.protocol.replace("ws", "http");
  referrerUrl.pathname = "/";
  const referrerString = referrerUrl.toString();

  const dom = new JSDOM(``, {
    url: referrerString
  }); // let it build the default DOM

  // we need to polyfill the window object (jsdom doesn't provide this) (this is a stub, we will rewrite it later)
  dom.window.requestAnimationFrame = (callback: FrameRequestCallback) => {
    // we don't need to actually animate anything
    setTimeout(callback, 0);
    return 0;
  }

  // set the sizes from our device info
  // @ts-expect-error -- not read only
  dom.window.innerWidth = deviceInfo.specs.width;
  // @ts-expect-error -- not read only
  dom.window.innerHeight = deviceInfo.specs.height;

  // we need to create a fake window object to pass to the RFB constructor

  // you are about to see some of the craziest code nesting you've ever seen
  try {
    const outerCanvasOutput = await new Promise<CanvasOutput>((resolve, reject) => {
      globalWindowLock.acquire("globalWindow", async (done) => {
        await polyfillNode(dom);

        // create a canvas element for our screen
        const screen = dom.window.document.createElement("div");
        // create a keyboard input textArea that is a child of the screen
        const keyboardInput = dom.window.document.createElement("textarea");
        screen.appendChild(keyboardInput);

        // now add the screen to the dom
        dom.window.document.body.appendChild(screen);

        // create the RFB (this will init a connection to the VNC server)
        const rfb = await createRfb(screen, keyboardInput, deviceInfo.url, request, deviceInfo);
        const canvas = (rfb as any)._canvas as HTMLCanvasElement;

        // now wait for the first frame to be rendered from the VNC server
        try {
          const canvasOutput = await new Promise<CanvasOutput>((resolve2, reject2) => {
            function completeWithFrame() {
              // save the canvas (screen)'s contents to a buffer
              const innermostCanvasOutput = canvas.toDataURL() as CanvasOutput;
              resolve2(innermostCanvasOutput);
              rfb.disconnect(); // we are done
            }

            dom.window.requestAnimationFrame = (callback: FrameRequestCallback) => {
              // we don't need to actually animate anything
              setTimeout(() => {
                // this will be called when our frame is done
                // @ts-expect-error -- the only call to this is made through the RFB's display, which doesn't pass an argyment
                callback();
                completeWithFrame();
              }, 0);
              return 0;
            }

            rfb.addEventListener("connect", () => {
              // wait for the first frame to be rendered
              console.log("RFB connected");

              // wait for the frame
              setTimeout(() => {
                completeWithFrame();
              }, 4_000);
            });
            rfb.addEventListener("disconnect", () => {
              reject2(new Error("RFB disconnected"));
            });
            rfb.addEventListener("credentialsrequired", () => {
              rfb.disconnect();
              reject2(new Error("RFB error"));
            });
            rfb.addEventListener("securityfailure", () => {
              rfb.disconnect();
              reject2(new Error("RFB error"));
            });
          });
          done(null, canvasOutput);
        } catch (e: any) {
          done(e);
          return;
        }
      }, (err, ret) => {
        depolyfillNode();

        if (err) {
          reject(err);
        }

        resolve(ret as CanvasOutput);
      });
    });

    // now that we have the outer canvas output, we need to turn it into bytes and send a response with the content type png
    const base64 = outerCanvasOutput.split(",")[1];
    const buffer = Buffer.from(base64, "base64");
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "image/png"
      }
    });
  } catch (e: any) {
    return NextResponse.json(
      {
        error: "Internal Server Error"
      },
      {
        status: 500
      }
    )
  }
}
