import { WebSocket as WsWebSocket } from "ws";

const NodeWebSocket = WebSocket;
type BrowserCompatibleType = typeof NodeWebSocket;

// this is API compatible with the Node.js WebSocket but it's actually a wrapper around the "ws" WebSocket implementation
export default class NodeWebSocketAdapter extends WsWebSocket implements BrowserCompatibleType {
}
