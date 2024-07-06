import { IncomingMessage, ServerResponse } from "node:http";

import { createServer } from "http";
import { parse } from "url";
import next from "next";
// our KasmVNC connections will go to the path /devices/[id]/kasmvnc
import {
  audioWsEndpoint,
  kasmVncWsEndpoint,
} from "./device-info/device-regex.ts";
import { WebSocket as WsWebSocket } from "ws";
import { handleAudio, handleKasmVNC } from "./kasmvnc/route.ts";

// for prod, see this file for reference: https://gist.github.com/regulad/9c5529137ebac136288f9627815d8933
const dev = process.env.NODE_ENV !== "production";
const port = parseInt(process.env.PORT || "", 10) || 3000;
const hostname = process.env.HOSTNAME || "0.0.0.0";
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

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

        const kasmVncMatch = pathname.match(kasmVncWsEndpoint);
        const audioMatch = pathname.match(audioWsEndpoint);

        if (kasmVncMatch) {
          await handleKasmVNC(req, res, kasmVncMatch);
        } else if (audioMatch) {
          await handleAudio(req, res, audioMatch);
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
