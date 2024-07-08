import { IncomingMessage, ServerResponse } from "node:http";
import { WebSocketServer, WebSocket as WsWebSocket } from "ws";
import { getDeviceForId } from "../device-info/device-info.ts";
import { createClient } from "../supabase/ro-server.ts";
import { createAudioWsProxy, createVncWebSocketProxy } from "./wsproxy.ts";
import { isWebSocketRequest } from "./wsutils.ts";

enum EndpointType {
  KASMVNC,
  AUDIO,
}

async function handleDeviceEndpoint(
  type: EndpointType,
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
  const supabaseUser = await supabaseClient.auth.getUser();
  const userEmail = supabaseUser.data.user!.email!;

  if (!deviceInfo) {
    res.statusCode = 404;
    res.setHeader("Content-Type", "text/plain");
    res.end("not found");
    return;
  }

  if (deviceInfo.ownerEmail !== userEmail) {
    // 404, we don't even want the user to know this device exists
    res.statusCode = 404;
    res.setHeader("Content-Type", "text/plain");
    res.end("not found");
    return;
  }

  // now create a WebSocket proxy to the audio server at url
  let userWs: WsWebSocket;
  switch (type) {
    case EndpointType.KASMVNC:
      userWs = await createVncWebSocketProxy(wss, req, res, deviceInfo);
      break;
    case EndpointType.AUDIO:
      userWs = await createAudioWsProxy(wss, req, res, deviceInfo);
      break;
  }

  console.debug("ws connection established", userWs.readyState);
}

export const handleAudio = handleDeviceEndpoint.bind(null, EndpointType.AUDIO);
export const handleKasmVNC = handleDeviceEndpoint.bind(
  null,
  EndpointType.KASMVNC,
);
