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
  scrcpyWsEndpoint,
} from "./endpoint-regex.ts";

// load environment variables
import handleEventStream from "./events/route.ts";
import { loadEnvironment } from "./load-environment.ts";
import { handleAudio, handleKasmVNC } from "./wsutils/kasmvnc-route.ts";
import { handleDeviceStream } from "./wsutils/scrcpy-route.ts";
import { isWebSocketRequest } from "./wsutils/wsutils.ts";
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
  createServer((req: IncomingMessage, res: ServerResponse) => {
    try {
      // Be sure to pass `true` as the second argument to `url.parse`.
      // This tells it to parse the query portion of the URL.
      const parsedUrl = parse(req.url!, true);

      if (isWebSocketRequest(req) && wss.shouldHandle(req)) {
        return;
      }

      handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.setHeader("Content-Type", "text/plain");
      res.end("internal server error");
    }
  })
    // i was a bonehead and handled upgrades in the regular request handler for the longest time,
    // i was stuck wondering why half of the routes bounced and never figured it out!
    .on("upgrade", (request, socket, head) => {
      const pathname = request.url!;

      const hitsScrcpy = !!pathname.match(scrcpyWsEndpoint);
      const hitsEvents = !!pathname.match(eventsWsEndpoint);
      const hitsKasmVnc = !!pathname.match(kasmVncWsEndpoint);
      const hitsAudio = !!pathname.match(audioWsEndpoint);

      const hits = [hitsScrcpy, hitsEvents, hitsKasmVnc, hitsAudio].filter(
        (hit) => hit,
      ).length;

      if (hits) {
        wss.handleUpgrade(request, socket, head, (ws) => {
          // open the websocket asap, do our processing lazily
          if (hitsScrcpy) {
            handleDeviceStream(request, ws);
          } else if (hitsEvents) {
            handleEventStream(request, ws);
          } else if (hitsKasmVnc) {
            handleKasmVNC(request, ws);
          } else if (hitsAudio) {
            handleAudio(request, ws);
          }
        });
      }
      // don't destroy the socket, something else may be listening for it
    })
    .once("error", (err: Error) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
