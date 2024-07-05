// this lock will ensure that only one window is created per nodejs process
import AsyncLock from "async-lock";
import { DeviceInfo } from "../../../../../../server/device-info/device-info";
import {
  depolyfillNode,
  polyfillNode,
} from "@/app/(no-layout)/devices/[id]/snapshot/node-shim";
import createRfb from "@/app/(no-layout)/devices/[id]/snapshot/rfb-shim";
import { JSDOM } from "jsdom";

const globalWindowLock = new AsyncLock();
export type CanvasOutput = `data:image/png;base64,${string}`;

function createJSDOMForKasmVNC(deviceInfo: DeviceInfo) {
  const referrerUrl = new URL(deviceInfo.url);
  referrerUrl.protocol = referrerUrl.protocol.replace("ws", "http");
  referrerUrl.pathname = "/";
  const referrerString = referrerUrl.toString();

  const dom = new JSDOM(``, {
    url: referrerString,
  }); // let it build the default DOM

  // we need to polyfill the window object (jsdom doesn't provide this) (this is a stub, we will rewrite it later)
  dom.window.requestAnimationFrame = (callback: FrameRequestCallback) => {
    // we don't need to actually animate anything
    setTimeout(callback, 0);
    return 0;
  };

  // set the sizes from our device info
  // @ts-expect-error -- not read only
  dom.window.innerWidth = deviceInfo.specs.width;
  // @ts-expect-error -- not read only
  dom.window.innerHeight = deviceInfo.specs.height;

  return dom;
}

/**
 * no VNC frame is "complete" (covers up the whole screen),
 * instead we need to collect a number of frames to reasonably assume that the entire screen has been drawn;
 * HOWEVER, it only draws the part of the frame that has changed,
 * so there is a maximum number of frames before we only start receiving things that have already occurred
 */
const framesRequired: number = 1;

export default async function getSnapshotOfKasmVNCDevice(
  deviceInfo: DeviceInfo,
): Promise<CanvasOutput> {
  const dom = createJSDOMForKasmVNC(deviceInfo);

  return await new Promise<CanvasOutput>((resolve, reject) => {
    globalWindowLock.acquire(
      "globalWindow",
      async (done) => {
        await polyfillNode(dom);

        // create a canvas element for our screen
        const screen = dom.window.document.createElement("div");
        // create a keyboard input textArea that is a child of the screen
        const keyboardInput = dom.window.document.createElement("textarea");
        screen.appendChild(keyboardInput);

        // now add the screen to the dom
        dom.window.document.body.appendChild(screen);

        // create the RFB (this will init a connection to the VNC server)
        const rfb = await createRfb(
          screen,
          keyboardInput,
          deviceInfo.url,
          deviceInfo,
        );
        const canvas = (rfb as any)._canvas as HTMLCanvasElement;

        // now wait for the first frame to be rendered from the VNC server
        try {
          const canvasOutput = await new Promise<CanvasOutput>(
            (resolve2, reject2) => {
              let framesDrawn: number = 0;

              function completeWithFrame() {
                // save the canvas (screen)'s contents to a buffer
                const innermostCanvasOutput =
                  canvas.toDataURL() as CanvasOutput;
                resolve2(innermostCanvasOutput);
                rfb.disconnect(); // we are done
              }

              dom.window.requestAnimationFrame = (
                callback: FrameRequestCallback,
              ) => {
                // we don't need to actually animate anything
                setTimeout(() => {
                  // this will be called when our frame is done
                  // @ts-expect-error -- the only call to this is made through the RFB's display, which doesn't pass an argyment
                  callback();
                  if (++framesDrawn > framesRequired) {
                    completeWithFrame();
                  }
                }, 0);
                return 0;
              };

              // rfb.addEventListener("connect", () => {
              //   // wait for the first frame to be rendered
              //   console.log("RFB connected");
              // });
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
            },
          );
          done(null, canvasOutput);
        } catch (e: any) {
          done(e);
          return;
        }
      },
      (err, ret) => {
        depolyfillNode();

        if (err) {
          reject(err);
        }

        resolve(ret as CanvasOutput);
      },
    );
  });
}
