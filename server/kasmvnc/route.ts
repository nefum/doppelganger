import { IncomingMessage, ServerResponse } from "node:http";
import { getDeviceInfoForId } from "../device-info/device-info.ts";
import {
  createVncWebSocketProxy,
  createAudioWsProxy,
  isWebSocketRequest,
} from "./wsproxy.ts";
import { WebSocket as WsWebSocket } from "ws";

const wss = new WsWebSocket.Server({ noServer: true });

enum EndpointType {
  KASMVNC,
  AUDIO,
}

async function handleDeviceEndpoint(
  type: EndpointType,
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
