The WebSocket proxies required for this proxy necessitate a substantially custom server.

I hate Babel so much.

Although the `instrument.ts` here is fully functional, it is currently not enabled. It can be enabled with the addition of `--import ./dist/instrument.mjs` to the start command in `package.json`. If it is enabled, it clobbers the nextjs server's instrumentation.
