import { IncomingMessage, ServerResponse } from "node:http";
import { WebSocketServer } from "ws";
import {
  getWsUrlStringForDevice,
  runScrcpyServerOnDevice,
} from "../adb/scrcpy.ts";
import { getDeviceForId } from "../device-info/device-info.ts";
import { createClient } from "../supabase/ro-server.ts";
import { createWebSocketProxy } from "./wsproxy.ts";
import { isWebSocketRequest } from "./wsutils.ts";

export async function handleDeviceStream(
  wss: WebSocketServer,
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

  const deviceInfo = await getDeviceForId(deviceId);

  const supabaseClient = createClient(req);
  const {
    data: { user },
  } = await supabaseClient.auth.getUser();

  if (!user) {
    res.statusCode = 401;
    res.setHeader("Content-Type", "text/plain");
    res.end("unauthorized");
    return;
  }

  if (!deviceInfo) {
    res.statusCode = 404;
    res.setHeader("Content-Type", "text/plain");
    res.end("not found");
    return;
  }

  if (deviceInfo.ownerId !== user.id) {
    // 404, we don't even want the user to know this device exists
    res.statusCode = 404;
    res.setHeader("Content-Type", "text/plain");
    res.end("not found");
    return;
  }

  // now create a WebSocket proxy to the audio server at url
  await runScrcpyServerOnDevice(deviceInfo);
  const wsUrlString = getWsUrlStringForDevice(deviceInfo);
  const wsUrl = new URL(wsUrlString);
  const userWs = await createWebSocketProxy(wsUrl, res, req, wss);

  console.debug("ws connection established", userWs.readyState);
}
