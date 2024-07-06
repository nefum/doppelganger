import { WebSocket as WsWebSocket } from "ws";
import { IncomingMessage, ServerResponse } from "node:http";
import { BasicAuth, DeviceInfo } from "../device-info/device-info.ts";
import { getWsWebSocketOptionForKasmVNC } from "./wsconnect.ts";

// @ts-expect-error -- it is not a namespace but can be used as one
type WsWebSocketServer = WsWebSocket.Server;
// @ts-expect-error -- it is not a namespace but can be used as one
type WsWebSocketOptions = WsWebSocket.ClientOptions;

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

const HEARTBEAT_TIMEOUT = 30_000; // 30 seconds
const HEARTBEAT_INTERVAL = 25_000; // 25 seconds

// Add a heartbeat mechanism to the WebSocket proxy creation
function setupHeartbeat(ws: WsWebSocket) {
  let heartbeatTimeout: NodeJS.Timeout;

  // Function to terminate the connection if it's considered dead
  const terminateDeadConnection = () => {
    console.error("Connection is considered dead. Closing.");
    ws.terminate(); // Use terminate() to immediately close the connection
  };

  // Reset the heartbeat timeout to wait for the next pong
  const resetHeartbeatTimeout = () => {
    clearTimeout(heartbeatTimeout);
    heartbeatTimeout = setTimeout(terminateDeadConnection, HEARTBEAT_TIMEOUT); // 30 seconds timeout
  };

  // Listen for pong messages to reset the heartbeat timeout
  ws.on("pong", resetHeartbeatTimeout);

  // Send a ping message periodically
  const heartbeatInterval = setInterval(() => {
    console.debug("Sending ping to check connection");
    ws.ping(); // No payload is necessary
  }, HEARTBEAT_INTERVAL); // 25 seconds interval

  // Clear the interval and timeout when the WebSocket closes
  ws.once("close", () => {
    clearInterval(heartbeatInterval);
    clearTimeout(heartbeatTimeout);
  });

  // Initialize the heartbeat timeout
  resetHeartbeatTimeout();

  // also add some code to listen to the other side's heartbeat
  // and respond to it
  ws.on("ping", () => {
    console.debug("Received ping from the other side");
    ws.pong(); // Respond with a pong message
  });
}

function createWebSocketProxy(
  url: URL,
  res: ServerResponse<IncomingMessage>,
  req: IncomingMessage,
  insecure: boolean,
  basicAuth: BasicAuth,
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
  deviceInfo: DeviceInfo,
): Promise<WsWebSocket> {
  const { kasmUrl, insecure, basicAuth } = deviceInfo;
  const parsedTargetUrl = new URL(kasmUrl);
  const options = getWsWebSocketOptionForKasmVNC(
    parsedTargetUrl,
    insecure,
    basicAuth,
    req.headers,
  );
  return createWebSocketProxy(
    parsedTargetUrl,
    res,
    req,
    insecure,
    basicAuth,
    wss,
    options,
  );
}

export function createAudioWsProxy(
  wss: WsWebSocketServer,
  req: IncomingMessage,
  res: ServerResponse,
  deviceInfo: DeviceInfo,
): Promise<WsWebSocket> {
  const { audioUrl, insecure, basicAuth } = deviceInfo;
  const parsedTargetUrl = new URL(audioUrl);
  const options = getWsWebSocketOptionForKasmVNC(
    parsedTargetUrl,
    insecure,
    basicAuth,
    req.headers,
  );
  return createWebSocketProxy(
    parsedTargetUrl,
    res,
    req,
    insecure,
    basicAuth,
    wss,
    options,
  );
}

export function isWebSocketRequest(req: IncomingMessage): boolean {
  return (
    !req.headers.upgrade || req.headers.upgrade.toLowerCase() !== "websocket"
  );
}
