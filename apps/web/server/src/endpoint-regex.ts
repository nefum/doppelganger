// REMEMBER: any custom WS path must be made exempt from the middleware in src/middleware.ts
export const scrcpyWsEndpoint = /^\/api\/devices\/([a-zA-Z0-9]+)\/scrcpy/;
export const audioWsEndpoint = /^\/api\/devices\/([a-zA-Z0-9]+)\/jsmpeg/;

/**
 * @deprecated
 */
export const kasmVncWsEndpoint = /^\/api\/devices\/([a-zA-Z0-9]+)\/kasmvnc/;

// params are not available in route.ts, so we process them manually
export const deviceApiEndpoint = /^\/api\/devices\/([a-zA-Z0-9]+)/;
