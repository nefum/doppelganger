const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

// for prod, see this file for reference: https://gist.github.com/regulad/9c5529137ebac136288f9627815d8933
const dev = process.env.NODE_ENV !== 'production'
const port = parseInt(process.env.PORT, 10) || 3000
const hostname = process.env.HOSTNAME || '0.0.0.0'
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

// our KasmVNC connections will go to the path /devices/[id]/kasmvnc
const kasmVncRegex = /^\/devices\/([a-zA-Z0-9]+)\/kasmvnc/
const MockResponse = require('./mockResponse')
const createMockRequest = require('./mockRequest')
const createWebSocketProxy = require('./createWebSocketProxy')
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
        const mockReq = createMockRequest(req);

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

        // now create a WebSocket proxy to the KasmVNC server at url
        const ws = await createWebSocketProxy(wss, req, res, url, insecure, basicAuth);


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
