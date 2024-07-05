import { WebSocket as WsWebSocket } from "ws";
import { IncomingMessage, ServerResponse } from "node:http";
import { DeviceInfo } from "../device-info/device-info.ts";
import { getWsWebSocketOptionForKasmVNC } from "./wsconnect.ts";

// @ts-expect-error -- it is not a namespace but can be used as one
type WebSocketServer = WsWebSocket.Server;

function isFatalWebSocketError(err: Error & { code?: string }): boolean {
  // Define a list of fatal error codes or messages
  const fatalErrors = ["ECONNREFUSED", "EHOSTUNREACH", "ENOTFOUND"];
  const errorMessage = err.message.toLowerCase();

  // Check if the error code is in the list of fatal errors
  if (err.code && fatalErrors.includes(err.code)) {
    return true;
  }

  // Example of checking the error message for specific keywords
  if (
    errorMessage.includes("refused") ||
    errorMessage.includes("not reachable")
  ) {
    return true;
  }

  return true; // Default to fatal
}

export default function createWebSocketProxy(
  wss: WebSocketServer,
  req: IncomingMessage,
  res: ServerResponse,
  deviceInfo: DeviceInfo,
): Promise<WsWebSocket> {
  const { url, insecure, basicAuth } = deviceInfo;
  console.debug("creating a websocket proxy to", url);

  // parse the target url
  const parsedTargetUrl = new URL(url);

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
    const options = getWsWebSocketOptionForKasmVNC(
      parsedTargetUrl,
      insecure,
      basicAuth,
      req.headers,
    );
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
        resolve(userWs);
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
            targetWs.terminate();
          }
          // if the res is still open, end it
          if (!res.writableEnded) {
            res.end();
          }
        });
        targetWs.once("close", () => {
          if (userWs.readyState === WsWebSocket.OPEN) {
            userWs.terminate();
          }
        });
        // message
        userWs.on("message", (data) => {
          targetWs.send(data);
        });
        targetWs.on("message", (data) => {
          userWs.send(data);
        });
        // ping
        userWs.on("ping", (data) => {
          targetWs.ping(data);
        });
        targetWs.on("ping", (data) => {
          userWs.ping(data);
        });
        // pong
        userWs.on("pong", (data) => {
          targetWs.pong(data);
        });
        targetWs.on("pong", (data) => {
          userWs.pong(data);
        });
      });
    });
  });
}
