import { IncomingMessage } from "node:http";
import { WebSocket as WsWebSocket } from "ws";
import { isFatalWebSocketError } from "./wsutils.ts";

/**
 * Creates a websocket proxy and returns the backend ws
 * @param url
 * @param req
 * @param userWs
 */
export function createWebSocketProxy(
  url: URL,
  req: IncomingMessage,
  userWs: WsWebSocket,
): Promise<WsWebSocket> {
  console.debug("creating a websocket proxy to", url.toString());

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
      userWs.once("close", (code, reason) => {
        console.debug("userWs closed", code, reason.toString());
        if (targetWs.readyState === WsWebSocket.OPEN) {
          targetWs.close(code);
        }
      });
      targetWs.once("close", (code, reason) => {
        console.debug("targetWs closed", code, reason.toString());
        if (userWs.readyState === WsWebSocket.OPEN) {
          userWs.close(code);
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

      resolve(targetWs);
    });
  });
}
