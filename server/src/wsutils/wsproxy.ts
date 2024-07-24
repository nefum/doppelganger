import { IncomingMessage } from "node:http";
import { WebSocket as WsWebSocket } from "ws";
import { isFatalWebSocketError, WsWebSocketOptions } from "./wsutils";

// from ws
function isValidStatusCode(code: number): boolean {
  return (
    (code >= 1000 &&
      code <= 1014 &&
      code !== 1004 &&
      code !== 1005 &&
      code !== 1006) ||
    (code >= 3000 && code <= 4999)
  );
}

/**
 * Creates a websocket proxy and returns the backend ws
 * @param url
 * @param req
 * @param userWs
 * @param options - options for the websocket
 * @param findProtocols - whether to find protocols
 */
export function createWebSocketProxy(
  url: URL,
  req: IncomingMessage,
  userWs: WsWebSocket,
  options?: WsWebSocketOptions,
  findProtocols: boolean = false,
): Promise<WsWebSocket> {
  console.debug("creating a websocket proxy to", url.toString());

  return new Promise<WsWebSocket>((resolve, reject) => {
    let protocols: string[] | null = null;
    if (findProtocols) {
      const foundProtocols = req.headers["sec-websocket-protocol"]
        ?.split(",")
        .map((p) => p.trim());
      if (foundProtocols) {
        protocols = foundProtocols;
      }
    }

    let targetWs: WsWebSocket;
    if (protocols) {
      targetWs = new WsWebSocket(url, protocols, options ?? {});
    } else if (options) {
      targetWs = new WsWebSocket(url, options);
    } else {
      targetWs = new WsWebSocket(url);
    }

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
          console.warn("Non-fatal error occurred on targetWs", err);
          // Handle non-fatal error as appropriate
        }
      });
      // close
      userWs.once("close", (code, reason) => {
        console.debug("userWs closed", code, reason.toString());
        if (targetWs.readyState === WsWebSocket.OPEN) {
          if (isValidStatusCode(code)) {
            targetWs.close(code, reason);
          } else {
            targetWs.close(1000);
          }
        }
      });
      targetWs.once("close", (code, reason) => {
        console.debug("targetWs closed", code, reason.toString());
        if (userWs.readyState === WsWebSocket.OPEN) {
          if (isValidStatusCode(code)) {
            userWs.close(code, reason);
          } else {
            userWs.close(1000);
          }
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
