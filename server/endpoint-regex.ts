// REMEMBER: any custom WS path must be made exempt from the middleware in src/middleware.ts
export const scrcpyWsEndpoint = /^\/devices\/([a-zA-Z0-9]+)\/scrcpy/;
export const kasmVncWsEndpoint = /^\/devices\/([a-zA-Z0-9]+)\/kasmvnc/;
export const audioWsEndpoint = /^\/devices\/([a-zA-Z0-9]+)\/jsmpeg/;
export const eventsWsEndpoint = /^\/devices\/([a-zA-Z0-9]+)\/events/;

// params are not available in route.ts, so we process them manually
export const deviceEndpoint = /^\/devices\/([a-zA-Z0-9]+)/;
export const deviceApiEndpoint = /^\/api\/devices\/([a-zA-Z0-9]+)/;
