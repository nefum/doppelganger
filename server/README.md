The WebSocket proxies required for this proxy necessitate a substantially custom server.

The `babel.config.json` transpiler config file is required for the server to run, but it isn't in the root directory so that it doesn't interfere with the client's transpilation.

Note: do NOT use "%" or "@" here in imports, Babel doesn't respect them.
