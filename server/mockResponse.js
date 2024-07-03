const EventEmitter = require('events');

class MockResponse extends EventEmitter {
  constructor() {
    super();
    this._data = '';
    this._statusCode = 200;
    this._headers = {};
  }

  status(code) {
    this._statusCode = code;
    return this;
  }

  send(content) {
    this._data = content;
    this.emit('finish');
    return this;
  }

  setHeader(name, value) {
    this._headers[name] = value;
    return this;
  }

  getHeader(name) {
    return this._headers[name];
  }

  removeHeader(name) {
    delete this._headers[name];
    return this;
  }

  flushHeaders() {
    // This is a no-op in the context of a mock response
  }

  writeHead(statusCode, headers) {
    this._statusCode = statusCode;
    Object.keys(headers).forEach((key) => {
      this._headers[key] = headers[key];
    });
  }

  end(content) {
    if (content) this.send(content);
    else this.emit('finish');
    return this;
  }

  _implicitHeader() {
    // This is a no-op in the context of a mock response
  }

  write(chunk) {
    // chunk is a u8 array buffer
    if (typeof chunk === 'string') {
      chunk = Buffer.from(chunk);
    }
    if (this._data) {
      this._data = Buffer.concat([this._data, chunk]);
    } else {
      this._data = chunk;
    }
    return true;
  }

  // node_modules/.pnpm/next@14.2.4_@babel+core@7.24.7_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/server/pipe-readable.js

  read() {
    // this data might be a uint8array, if it is then we need to convert it to bytes and then to a string
    if (this._data instanceof Uint8Array) {
      return Buffer.from(this._data).toString();
    }
    return this._data;
  }
}

module.exports = MockResponse;
