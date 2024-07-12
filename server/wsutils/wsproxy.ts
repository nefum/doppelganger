import { IncomingMessage, ServerResponse } from "node:http";
import { WebSocket as WsWebSocket } from "ws";
import { isFatalWebSocketError, WsWebSocketServer } from "./wsutils.ts";

export function createWebSocketProxy(
  url: URL,
  res: ServerResponse,
  req: IncomingMessage,
  wss: WsWebSocketServer,
): Promise<WsWebSocket> {
  console.debug("creating a websocket proxy to", url.toString());

  // get the underlying socket
  const { socket } = res;

  // head will be an empty buffer
  const head = Buffer.alloc(0);

  // now create a WebSocket proxy to the KasmVNC server at url

  return new Promise<WsWebSocket>((resolve, reject) => {
    const targetWs = new WsWebSocket(url);
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
