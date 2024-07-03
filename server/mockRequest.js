function makeMockRequest(req) {
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
  return mockReq;
}

module.exports = makeMockRequest;
