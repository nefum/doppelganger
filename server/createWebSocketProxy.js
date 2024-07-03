const ws = require('ws');

function createWebSocketProxy(wss, req, res, url, insecure, basicAuth) {
  // parse the target url
  const parsedTargetUrl = new URL(url)
  const usingTls = parsedTargetUrl.protocol === 'https:' || parsedTargetUrl.protocol === 'wss:'

  // get the underlying socket
  const {socket} = res;

  // head will be an empty buffer
  const head = Buffer.alloc(0)

  // now create a WebSocket proxy to the KasmVNC server at url
  return new Promise((resolve, reject) => {
    wss.handleUpgrade(req, socket, head, (userWs) => {
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

module.exports = createWebSocketProxy;
