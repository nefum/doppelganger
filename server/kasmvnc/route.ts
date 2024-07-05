import { IncomingMessage, ServerResponse } from "node:http";
import { getDeviceInfoForId } from "../device-info/device-info.ts";
import createWebSocketProxy, { isWebSocketRequest } from "./wsproxy.ts";
import { WebSocket as WsWebSocket } from "ws";

const wss = new WsWebSocket.Server({ noServer: true });

export async function handleKasmVNC(
  req: IncomingMessage,
  res: ServerResponse,
  match: RegExpMatchArray,
): Promise<void> {
  const deviceId: string = match[1];

  console.log("ws connection received", req.url, deviceId);

  // check to see if this is a websocket connection
  if (isWebSocketRequest(req)) {
    // invalid method; upgrade required
    res.statusCode = 426;
    res.setHeader("Content-Type", "text/plain");
    res.end("upgrade required");
    return;
  }

  // TODO: check to see if the user is authorized

  const deviceInfo = getDeviceInfoForId(deviceId);

  if (!deviceInfo) {
    res.statusCode = 404;
    res.setHeader("Content-Type", "text/plain");
    res.end("not found");
    return;
  }

  // now create a WebSocket proxy to the KasmVNC server at url
  const userWs = await createWebSocketProxy(wss, req, res, deviceInfo);

  setTimeout(() => {
    userWs.close();
  }, 10_000);

  console.debug("ws connection established", userWs.readyState);
}
