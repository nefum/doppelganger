import { IncomingMessage, ServerResponse } from "node:http";

import { createServer } from "http";
import next from "next";
import { parse } from "url";
// our KasmVNC connections will go to the path /devices/[id]/kasmvnc
import { WebSocket as WsWebSocket } from "ws";
import {
  audioWsEndpoint,
  eventsWsEndpoint,
  kasmVncWsEndpoint,
} from "./endpoint-regex.ts";
import { handleAudio, handleKasmVNC } from "./wsutils/route.ts";

// load environment variables
import handleEventStream from "./events/route.ts";
import { loadEnvironment } from "./load-environment.ts";
// like during development the IDEA runner and during production the docker container
loadEnvironment();

// for prod, see this file for reference: https://gist.github.com/regulad/9c5529137ebac136288f9627815d8933
const dev = process.env.NODE_ENV !== "production";
const port = parseInt(process.env.PORT || "", 10) || 3000;
const hostname = process.env.HOSTNAME || "0.0.0.0";
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// note for future me, so I don't even try it: next-ws (https://github.com/apteryxxyz/next-ws) is TERRIBLE
// it doesn't even support dynamic URLs, which is not only a fundamental feature of Next.js, but also required for
// this project. i am implementing any WS communication manually

const wss = new WsWebSocket.Server({
  noServer: true,
  perMessageDeflate: false, // https://www.npmjs.com/package/ws/v/8.0.0#websocket-compression
});

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
        const eventsMatch = pathname.match(eventsWsEndpoint);

        if (kasmVncMatch) {
          await handleKasmVNC(wss, req, res, kasmVncMatch);
        } else if (audioMatch) {
          await handleAudio(wss, req, res, audioMatch);
        } else if (eventsMatch) {
          await handleEventStream(wss, req, res, eventsMatch);
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
