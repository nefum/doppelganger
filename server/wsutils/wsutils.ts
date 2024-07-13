import { IncomingMessage } from "node:http";
import { WebSocket as WsWebSocket } from "ws";

export function isFatalWebSocketError(err: Error & { code?: string }): boolean {
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

export function isWebSocketRequest(req: IncomingMessage): boolean {
  return (
    !!req.headers.upgrade && req.headers.upgrade.toLowerCase() === "websocket"
  );
}
