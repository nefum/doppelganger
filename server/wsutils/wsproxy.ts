import { Device } from "@prisma/client";
import { IncomingMessage, ServerResponse } from "node:http";
import { WebSocket as WsWebSocket } from "ws";
import {
  getTargetAudioWebsocketUrlForDevice,
  getTargetVncWebsocketUrlForDevice,
} from "../device-info/device-info.ts";
import { getWsWebSocketOptionForKasmVNC } from "./kasmvnc-connect.ts";
import {
  isFatalWebSocketError,
  WsWebSocketOptions,
  WsWebSocketServer,
} from "./wsutils.ts";

export function createWebSocketProxy(
  url: URL,
  res: ServerResponse<IncomingMessage>,
  req: IncomingMessage,
  wss: WsWebSocketServer,
  options: WsWebSocketOptions,
): Promise<WsWebSocket> {
  console.debug("creating a websocket proxy to", url.toString());

  // get the underlying socket
  const { socket } = res;

  // head will be an empty buffer
  const head = Buffer.alloc(0);

  // now create a WebSocket proxy to the KasmVNC server at url

  return new Promise<WsWebSocket>((resolve, reject) => {
    // get the protocols from the req['sec-websocket-protocol']
    const protocols = req.headers["sec-websocket-protocol"]
      ?.split(",")
      .map((p) => p.trim());
    const targetWs = new WsWebSocket(url, protocols, options);
    // error
    targetWs.on("error", (err) => {
      if (targetWs.readyState === WsWebSocket.CONNECTING) {
        reject(err);
        targetWs.close();
      }
    });
    // open
    targetWs.once("open", () => {
      wss.handleUpgrade(req, socket, head, (userWs: WsWebSocket) => {
        // error
        userWs.on("error", (err) => {
          if (isFatalWebSocketError(err)) {
            console.error("Fatal error occurred on userWs", err);
            // Handle fatal error, e.g., close connections, cleanup resources
            userWs.close();
            targetWs.close();
          } else {
            console.error("Non-fatal error occurred on userWs", err);
            // Handle non-fatal error as appropriate
          }
        });
        targetWs.on("error", (err) => {
          if (isFatalWebSocketError(err)) {
            console.error("Fatal error occurred on targetWs", err);
            // Handle fatal error, e.g., close connections, cleanup resources
            targetWs.close();
            userWs.close();
          } else {
            console.error("Non-fatal error occurred on targetWs", err);
            // Handle non-fatal error as appropriate
          }
        });
        // close
        userWs.once("close", () => {
          if (targetWs.readyState === WsWebSocket.OPEN) {
            targetWs.close();
          }
        });
        targetWs.once("close", () => {
          if (userWs.readyState === WsWebSocket.OPEN) {
            userWs.close();
          }
        });
        // message
        userWs.on("message", (data) => {
          targetWs.send(data);
        });
        targetWs.on("message", (data) => {
          userWs.send(data);
        });
        // setup heartbeat (they never work😢)
        // setupHeartbeat(userWs);
        // setupHeartbeat(targetWs);

        resolve(userWs);
      });
    });
  });
}

export function createVncWebSocketProxy(
  wss: WsWebSocketServer,
  req: IncomingMessage,
  res: ServerResponse,
  deviceInfo: Device,
): Promise<WsWebSocket> {
  const { certificateIsSelfSigned: insecure, ...basicAuth } = deviceInfo;
  const kasmUrl = getTargetVncWebsocketUrlForDevice(deviceInfo);
  const parsedTargetUrl = new URL(kasmUrl);
  const options = getWsWebSocketOptionForKasmVNC(
    parsedTargetUrl,
    insecure,
    basicAuth,
    req.headers,
  );
  return createWebSocketProxy(parsedTargetUrl, res, req, wss, options);
}

export function createAudioWsProxy(
  wss: WsWebSocketServer,
  req: IncomingMessage,
  res: ServerResponse,
  deviceInfo: Device,
): Promise<WsWebSocket> {
  const { certificateIsSelfSigned: insecure, ...basicAuth } = deviceInfo;
  const audioUrl = getTargetAudioWebsocketUrlForDevice(deviceInfo);
  const parsedTargetUrl = new URL(audioUrl);
  const options = getWsWebSocketOptionForKasmVNC(
    parsedTargetUrl,
    insecure,
    basicAuth,
    req.headers,
  );
  return createWebSocketProxy(parsedTargetUrl, res, req, wss, options);
}
