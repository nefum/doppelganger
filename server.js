const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = 3000
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

// our KasmVNC connections will go to the path /devices/[id]/kasmvnc
const kasmVncRegex = /^\/devices\/([a-zA-Z0-9]+)\/kasmvnc/
const MockResponse = require('./server/mockResponse')
const WebSocket = require('ws')
const wss = new WebSocket.Server({ noServer: true });

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      // Be sure to pass `true` as the second argument to `url.parse`.
      // This tells it to parse the query portion of the URL.
      const parsedUrl = parse(req.url, true)
      const { pathname, query } = parsedUrl

      if (kasmVncRegex.test(pathname)) {
        // check to see if this is a websocket connection
        if (!req.headers.upgrade || req.headers.upgrade.toLowerCase() !== 'websocket') {
          // invalid method; upgrade required
          res.statusCode = 426
          res.setHeader('Content-Type', 'text/plain')
          res.end('upgrade required')
          return
        }

        // a request to the KasmVNC websocket server is being made over websocket.
        // at the pathname, there is a GET route that provides us with the information of the WebSocket server we need to proxy

        // prepare a request to the kasmvnc route (we can use the same pathname)
        // we will pass this custom request into the handle function as to not interfere with the normal Next.js routing
        const mockReq = {
          method: 'GET',
          on(event, callback) {
            // no-op
          },
          headers: {
            ...req.headers
          }
        }
        // drop the websocket headers
        delete mockReq.headers.upgrade
        delete mockReq.headers.connection
        delete mockReq.headers['sec-websocket-key']
        delete mockReq.headers['sec-websocket-version']
        delete mockReq.headers['sec-websocket-extensions']
        delete mockReq.headers['sec-websocket-protocol']

        // make a mockRes object to capture the response
        const mockRes = new MockResponse()

        await handle(mockReq, mockRes, parsedUrl)
        const bodyString = mockRes.read()

        if (mockRes.statusCode !== 200) {
          // return the error
          res.statusCode = mockRes.statusCode
          for (const key in mockRes.headers) {
            res.setHeader(key, mockRes.headers[key])
          }
          res.setHeader('Content-Type', 'text/plain')
          res.end(bodyString)
          return
        }

        // parse the response body as JSON
        if (mockRes.getHeader("content-type")[0] !== 'application/json') {
          res.statusCode = 500
          res.setHeader('Content-Type', 'text/plain')
          res.end('internal server error')
          return
        }

        // parse the response body as JSON
        const body = JSON.parse(bodyString)
        const { url, insecure, basicAuth } = body;

        // parse the url
        const parsedTargetUrl = new URL(url)
        const usingTls = parsedTargetUrl.protocol === 'https:' || parsedTargetUrl.protocol === 'wss:'

        // head will be an empty buffer
        const head = Buffer.alloc(0)

        // get the underlying socket
        const { socket } = res;

        // now create a WebSocket proxy to the KasmVNC server at url
        wss.handleUpgrade(req, socket, head, (ws) => {
          // get the protocols from the req['sec-websocket-protocol']
          const protocols = req.headers['sec-websocket-protocol']?.split(',').map((p) => p.trim())
          const options = {
            rejectUnauthorized: !insecure,
            headers: {
              pragma: "no-cache",
              "cache-control": "no-cache",
              "user-agent": req.headers["user-agent"],
              "accept-language": req.headers["accept-language"],
              "accept-encoding": req.headers["accept-encoding"],
              "Host": `${parsedTargetUrl.hostname}:${parsedTargetUrl.port}`,
              "Origin": `${usingTls ? 'https' : 'http'}//${parsedTargetUrl.hostname}:${parsedTargetUrl.port}`
            }
          }

          if (basicAuth) {
            const {username, password} = basicAuth;
            const basicAuthString = `${username}:${password}`
            const basicAuthEncoded = Buffer.from(basicAuthString).toString('base64')
            options.headers["Authorization"] = `Basic ${basicAuthEncoded}`;
          }

          const targetWs = new WebSocket(url, protocols, options);

          // error
          ws.on('error', (err) => {
            console.error('Error occurred on ws', err)
            // targetWs.emit('error', err);
          });
          targetWs.on('error', (err) => {
            console.error('Error occurred on targetWs', err)
            // ws.emit('error', err);
          });
          targetWs.on('open', () => {
            // message
            ws.on('message', (data) => {
              targetWs.send(data);
            });
            targetWs.on('message', (data) => {
              ws.send(data);
            });
            // ping
            ws.on('ping', (data) => {
              targetWs.ping(data);
            });
            targetWs.on('ping', (data) => {
              ws.ping(data);
            });
            // pong
            ws.on('pong', (data) => {
              targetWs.pong(data);
            });
            targetWs.on('pong', (data) => {
              ws.pong(data);
            });
            // close
            ws.on('close', () => {
              targetWs.close();
            });
            targetWs.on('close', () => {
              ws.close();
            });
          });
        });
      } else {
        await handle(req, res, parsedUrl)
      }
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.setHeader('Content-Type', 'text/plain')
      res.end('internal server error')
    }
  })
  .once('error', (err) => {
    console.error(err)
    process.exit(1)
  })
  .listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`)
  })
})
