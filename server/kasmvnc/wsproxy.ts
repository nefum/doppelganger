import {WebSocket} from "ws";
import {IncomingMessage, ServerResponse} from "node:http";
import {BasicAuth} from "../device-info/device-info";
import {getWsWebSocketOptionForKasmVNC} from "./wsconnect";

// @ts-expect-error -- it is not a namespace but can be used as one
type WebSocketServer = WebSocket.Server;

export default function createWebSocketProxy(wss: WebSocketServer, req: IncomingMessage, res: ServerResponse, url: string, insecure: boolean, basicAuth: BasicAuth): Promise<WebSocket> {
  // parse the target url
  const parsedTargetUrl = new URL(url)

  // get the underlying socket
  const {socket} = res;

  // head will be an empty buffer
  const head = Buffer.alloc(0)

  // now create a WebSocket proxy to the KasmVNC server at url
  return new Promise<WebSocket>((resolve, reject) => {
    wss.handleUpgrade(req, socket, head, (userWs: WebSocket) => {
      // get the protocols from the req['sec-websocket-protocol']
      const protocols = req.headers['sec-websocket-protocol']?.split(',').map((p) => p.trim())
      const options: {
        [key: string]: any
      } = getWsWebSocketOptionForKasmVNC(req.headers, parsedTargetUrl, insecure, basicAuth);

      const targetWs = new WebSocket(url, protocols, options);
      // error
      userWs.on('error', (err) => {
        console.error('Error occurred on userWs', err)
        // targetWs.emit('error', err);
        targetWs.close();
        userWs.close();
      });
      targetWs.on('error', (err) => {
        console.error('Error occurred on targetWs', err)
        // userWs.emit('error', err);
        userWs.close();
        targetWs.close();
      });
      targetWs.on('open', () => {
        // message
        userWs.on('message', (data) => {
          targetWs.send(data);
        });
        targetWs.on('message', (data) => {
          userWs.send(data);
        });
        // ping
        userWs.on('ping', (data) => {
          targetWs.ping(data);
        });
        targetWs.on('ping', (data) => {
          userWs.ping(data);
        });
        // pong
        userWs.on('pong', (data) => {
          targetWs.pong(data);
        });
        targetWs.on('pong', (data) => {
          userWs.pong(data);
        });
        // close
        userWs.on('close', () => {
          targetWs.close();
        });
        targetWs.on('close', () => {
          userWs.close();
        });
      });

      resolve(userWs);
    });
  })
}
