import { Device } from "@prisma/client";
import { IncomingMessage } from "node:http";
import { WebSocket as WsWebSocket } from "ws";
import {
  getDeviceForId,
  getTargetAudioWebsocketUrlForDevice,
  getTargetVncWebsocketUrlForDevice,
} from "../device-info/device-info";
import { audioWsEndpoint, kasmVncWsEndpoint } from "../endpoint-regex";
import { createClient } from "../supabase/ro-server";
import { attachUpdateListener } from "./attach-update-listener";
import { getWsWebSocketOptionForKasmVNC } from "./kasmvnc-connect";
import { createWebSocketProxy } from "./wsproxy";

enum EndpointType {
  KASMVNC,
  AUDIO,
}

export function createVncWebSocketProxy(
  req: IncomingMessage,
  userWs: WsWebSocket,
  deviceInfo: Device,
): Promise<WsWebSocket> {
  const kasmUrl = getTargetVncWebsocketUrlForDevice(deviceInfo);
  const parsedTargetUrl = new URL(kasmUrl);
  const options = getWsWebSocketOptionForKasmVNC(parsedTargetUrl, req.headers);
  return createWebSocketProxy(parsedTargetUrl, req, userWs, options, true);
}

export function createAudioWsProxy(
  req: IncomingMessage,
  userWs: WsWebSocket,
  deviceInfo: Device,
): Promise<WsWebSocket> {
  const kasmUrl = getTargetAudioWebsocketUrlForDevice(deviceInfo);
  const parsedTargetUrl = new URL(kasmUrl);
  const options = getWsWebSocketOptionForKasmVNC(parsedTargetUrl, req.headers);
  return createWebSocketProxy(parsedTargetUrl, req, userWs, options, true);
}

async function handleKasmVncDeviceEndpoint(
  endpointType: EndpointType,
  req: IncomingMessage,
  ws: WsWebSocket,
): Promise<void> {
  const pathname = req.url!;

  let regex: RegExp;
  switch (endpointType) {
    case EndpointType.KASMVNC:
      regex = kasmVncWsEndpoint;
      break;
    case EndpointType.AUDIO:
      regex = audioWsEndpoint;
      break;
  }

  const deviceId = pathname.match(regex)![1];

  console.debug("ws connection received", req.url, deviceId);

  // check to see if this is a websocket connection

  const deviceInfo = await getDeviceForId(deviceId);

  const supabaseClient = createClient(req);
  const {
    data: { user },
  } = await supabaseClient.auth.getUser();

  // https://github.com/Luka967/websocket-close-codes#websocket-close-codes
  if (!user) {
    ws.close(3000);
    return;
  }

  if (!deviceInfo || deviceInfo.ownerId !== user.id) {
    ws.close(4404); // app: equiv to http 404
    return;
  }

  let targetWs: WsWebSocket;

  try {
    switch (endpointType) {
      case EndpointType.KASMVNC:
        targetWs = await createVncWebSocketProxy(req, ws, deviceInfo);
        break;
      case EndpointType.AUDIO:
        targetWs = await createAudioWsProxy(req, ws, deviceInfo);
        break;
    }
  } catch (e) {
    console.error("error creating websocket proxy", e);
    ws.close(1014);
    return;
  }

  console.debug("ws proxy established", ws.readyState, targetWs.readyState);

  if (endpointType === EndpointType.KASMVNC) {
    attachUpdateListener(ws, targetWs, deviceId);
  }
}

export const handleAudio = handleKasmVncDeviceEndpoint.bind(
  null,
  EndpointType.AUDIO,
);
export const handleKasmVNC = handleKasmVncDeviceEndpoint.bind(
  null,
  EndpointType.KASMVNC,
);
