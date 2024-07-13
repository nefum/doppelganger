import { IncomingMessage } from "node:http";
import { WebSocket as WsWebSocket } from "ws";

export default async function handleEventStream(
  req: IncomingMessage,
  ws: WsWebSocket,
) {
  // both the client & the server will be sending messages to each other through this like a message bus

  // TODO: implement message server (ephemerality is more than ok)

  ws.close();
}
