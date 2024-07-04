import {JSDOM} from "jsdom";
import type MutationObserver from "mutation-observer";
import {NextRequest} from "next/server";
import {DeviceInfo} from "../../../../../server/device-info/device-info";
import NodeWebSocketAdapter from "@/app/utils/ws-websocket-node-adapter";

const NodeWebsocket = WebSocket;

export async function polyfillNode(dom: JSDOM, req: NextRequest, deviceInfo: DeviceInfo) {
  // @ts-expect-error -- clash with what it expects, it's ok since we're just mocking
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;

  // @ts-expect-error -- clash with what it expects, it's ok since we're just mocking
  globalThis.MutationObserver = (await import ("mutation-observer")).default as unknown as typeof MutationObserver;

  // we also need to monkeypatch the websocket to pass the headers that next.js expects (ones that the browser automatically would add)
  const parsedTargetUrl = new URL(deviceInfo.url);
  const usingTls = parsedTargetUrl.protocol === "wss:";
  Object.defineProperty(globalThis, "WebSocket", class extends NodeWebSocketAdapter  {
    constructor(url: string, protocols?: string | string[], options?: { headers: Record<string, string> }) {
      // @ts-expect-error -- IntelliSense has no idea if this is a browser or node
      super(url, protocols, options || {
        rejectUnauthorized: !deviceInfo.insecure,
        headers: {
          pragma: "no-cache",
          "cache-control": "no-cache",
          "user-agent": req.headers.get("user-agent"),
          "accept-language": req.headers.get("accept-language"),
          "accept-encoding": req.headers.get("accept-encoding"),
          "Host": `${parsedTargetUrl.hostname}:${parsedTargetUrl.port}`,
          "Origin": `${usingTls ? 'https' : 'http'}//${parsedTargetUrl.hostname}:${parsedTargetUrl.port}`,
          "Authorization": `Basic ${Buffer.from(`${deviceInfo.basicAuth.username}:${deviceInfo.basicAuth.password}`).toString("base64")}`
        }
      });
    }
    readonly CONNECTING = NodeWebsocket.CONNECTING;
    readonly OPEN = NodeWebsocket.OPEN;
    readonly CLOSING = NodeWebsocket.CLOSING;
    readonly CLOSED = NodeWebsocket.CLOSED;
  })
}

export function depolyfillNode() {
  // @ts-expect-error -- clash with what it expects, it's ok since we're just mocking
  delete globalThis.window;
  // @ts-expect-error -- we set it earlier
  delete globalThis.document;
  // @ts-expect-error -- we set it earlier
  delete globalThis.MutationObserver;

  Object.defineProperty(globalThis, "WebSocket", NodeWebsocket);
}
