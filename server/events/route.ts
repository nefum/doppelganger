import { WebSocket as WsWebSocket, WebSocketServer } from "ws";
import { IncomingMessage, ServerResponse } from "node:http";

export default async function handleEventStream(
  wss: WebSocketServer,
  req: IncomingMessage,
  res: ServerResponse,
  match: RegExpMatchArray,
): Promise<WsWebSocket> {
  // both the client & the server will be sending messages to each other through this like a message bus

  // TODO: implement message server (ephemerality is more than ok)

  return await new Promise<WsWebSocket>((resolve, reject) => {
    wss.handleUpgrade(req, req.socket, Buffer.alloc(0), (ws) => {
      wss.emit("connection", ws, req);
      resolve(ws);
    });
  });
}
