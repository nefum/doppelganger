import { WebSocket } from "ws";
import { IncomingMessage, ServerResponse } from "node:http";
import { BasicAuth } from "../device-info/device-info";
import { getWsWebSocketOptionForKasmVNC } from "./wsconnect";

// @ts-expect-error -- it is not a namespace but can be used as one
type WebSocketServer = WebSocket.Server;

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

  // Add more conditions as needed based on your application's requirements

  return false; // Default to non-fatal
}

export default function createWebSocketProxy(
  wss: WebSocketServer,
  req: IncomingMessage,
  res: ServerResponse,
  url: string,
  insecure: boolean,
  basicAuth: BasicAuth,
): Promise<WebSocket> {
  // parse the target url
  const parsedTargetUrl = new URL(url);

  // get the underlying socket
  const { socket } = res;

  // head will be an empty buffer
  const head = Buffer.alloc(0);

  // now create a WebSocket proxy to the KasmVNC server at url
  return new Promise<WebSocket>((resolve, reject) => {
    // get the protocols from the req['sec-websocket-protocol']
    const protocols = req.headers["sec-websocket-protocol"]
      ?.split(",")
      .map((p) => p.trim());
    const options = getWsWebSocketOptionForKasmVNC(
      req.headers,
      parsedTargetUrl,
      insecure,
      basicAuth,
    );
    const targetWs = new WebSocket(url, protocols, options);

    let wsOpened = false;

    // error
    targetWs.on("error", (err) => {
      if (!wsOpened) {
        reject(err);
      }
    });
    // open
    targetWs.on("open", () => {
      wsOpened = true;
      wss.handleUpgrade(req, socket, head, (userWs: WebSocket) => {
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
        userWs.on("close", () => {
          targetWs.close();
        });
        targetWs.on("close", () => {
          userWs.close();
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
