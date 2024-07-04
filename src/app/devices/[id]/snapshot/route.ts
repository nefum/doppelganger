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

  // first, get the id
  const id = getDeviceIdFromUrl(request.nextUrl);
  // 404 if the id is not found
  if (!id) {
    return NextResponse.error(); // can't even customize the status code
  }

  const deviceInfo = getDeviceInfoForId(id);
  if (!deviceInfo) {
    return NextResponse.error();
  }

  const referrerUrl = new URL(deviceInfo.url);
  referrerUrl.protocol = referrerUrl.protocol.replace("ws", "http");
  referrerUrl.pathname = "/";
  const referrerString = referrerUrl.toString();


  const dom = new JSDOM(``, {
    url: referrerString
  }); // let it build the default DOM

  // set the sizes from our device info
  // @ts-expect-error -- not read only
  dom.window.innerWidth = deviceInfo.specs.width;
  // @ts-expect-error -- not read only
  dom.window.innerHeight = deviceInfo.specs.height;

  // we need to create a fake window object to pass to the RFB constructor

  // you are about to see some of the craziest code nesting you've ever seen
  const outerCanvasOutput = await new Promise<CanvasOutput>((resolve, reject) => {
    globalWindowLock.acquire("globalWindow", async (done) => {
      await polyfillNode(dom, request, deviceInfo);

      // create a canvas element for our screen
      const screen = dom.window.document.createElement("canvas");
      // create a keyboard input textArea that is a child of the screen
      const keyboardInput = dom.window.document.createElement("textarea");
      screen.appendChild(keyboardInput);

      // now add the screen to the dom
      dom.window.document.body.appendChild(screen);

      // create the RFB (this will init a connection to the VNC server)
      const rfb = await createRfb(screen, keyboardInput, deviceInfo.url);

      // now wait for the first frame to be rendered from the VNC server
      try {
        const canvasOutput = await new Promise<CanvasOutput>((resolve2, reject2) => {
          rfb.addEventListener("connect", () => {
            // wait for the first frame to be rendered
            console.log("RFB connected");
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
          rfb.addEventListener("desktopname", () => {
            // kasmvnc sets the desktop name after it is ready & connected... a frame will probably be drawn now
            console.log("RFB frame");
            // save the canvas (screen)'s contents to a buffer
            const frameUrl = screen.toDataURL("image/png", 1) as CanvasOutput;
            resolve2(frameUrl);
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

  return NextResponse.json(outerCanvasOutput);
}
