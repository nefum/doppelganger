import { IncomingMessage, ServerResponse } from "node:http";

import { createServer } from "http";
import { parse } from "url";
import next from "next";
// our KasmVNC connections will go to the path /devices/[id]/kasmvnc
import { kasmVncWsEndpoint } from "./device-info/device-regex.ts";
import createWebSocketProxy from "./kasmvnc/wsproxy.ts";
import { WebSocket as WsWebSocket } from "ws";
import { getDeviceInfoForId } from "./device-info/device-info.ts";

// for prod, see this file for reference: https://gist.github.com/regulad/9c5529137ebac136288f9627815d8933
const dev = process.env.NODE_ENV !== "production";
const port = parseInt(process.env.PORT || "", 10) || 3000;
const hostname = process.env.HOSTNAME || "0.0.0.0";
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const wss = new WsWebSocket.Server({ noServer: true });

function isWebSocketRequest(req: IncomingMessage): boolean {
  return (
    !req.headers.upgrade || req.headers.upgrade.toLowerCase() !== "websocket"
  );
}

app.prepare().then(() => {
  createServer(
    async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
      try {
        // Be sure to pass `true` as the second argument to `url.parse`.
        // This tells it to parse the query portion of the URL.

        if (!req.url) {
          res.statusCode = 404;
          res.setHeader("Content-Type", "text/plain");
          res.end("not found");
          return;
        }

        const parsedUrl = parse(req.url, true);
        const { pathname, query } = parsedUrl;

        if (!pathname) {
          res.statusCode = 404;
          res.setHeader("Content-Type", "text/plain");
          res.end("not found");
          return;
        }

        const match = pathname.match(kasmVncWsEndpoint);

        if (match) {
          const deviceId: string = match[1];

          console.log("ws connection received", req.url, deviceId);

          // check to see if this is a websocket connection
          if (isWebSocketRequest(req)) {
            // invalid method; upgrade required
            res.statusCode = 426;
            res.setHeader("Content-Type", "text/plain");
            res.end("upgrade required");
            return;
          }

          // TODO: check to see if the user is authorized

          const deviceInfo = getDeviceInfoForId(deviceId);

          if (!deviceInfo) {
            res.statusCode = 404;
            res.setHeader("Content-Type", "text/plain");
            res.end("not found");
            return;
          }

          // now create a WebSocket proxy to the KasmVNC server at url
          const userWs = await createWebSocketProxy(wss, req, res, deviceInfo);

          console.debug("ws connection established", userWs.readyState);
        } else {
          await handle(req, res, parsedUrl);
        }
      } catch (err) {
        console.error("Error occurred handling", req.url, err);
        res.statusCode = 500;
        res.setHeader("Content-Type", "text/plain");
        res.end("internal server error");
      }
    },
  )
    .once("error", (err: Error) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
