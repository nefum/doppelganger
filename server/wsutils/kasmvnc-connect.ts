import { IncomingHttpHeaders } from "node:http";
import { BasicAuth } from "../device-info/device-info.ts";

export function getWsWebSocketOptionForKasmVNC(
  targetUrl: URL,
  targetIsUnsecure: boolean,
  basicAuth: BasicAuth,
  incomingHeaders?: IncomingHttpHeaders,
): {
  [key: string]: any;
} {
  const usingTls =
    targetUrl.protocol === "https:" || targetUrl.protocol === "wss:";
  let encodings = incomingHeaders?.["accept-encoding"] || "gzip, deflate";
  if (typeof encodings !== "string") {
    encodings = encodings.join(", ");
  }
  const wsHeaders: { [key: string]: string } = {
    pragma: "no-cache",
    "cache-control": "no-cache",
    Host: `${targetUrl.hostname}:${targetUrl.port}`,
    Origin: `${usingTls ? "https" : "http"}//${targetUrl.hostname}:${targetUrl.port}`,
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": encodings,
  };
  if (basicAuth) {
    const maybeHeader = generateBasicAuthHeader(basicAuth);
    if (maybeHeader) {
      wsHeaders.Authorization = maybeHeader;
    }
  }
  return {
    rejectUnauthorized: !targetIsUnsecure,
    headers: wsHeaders,
  };
}

function generateBasicAuthHeader(basicAuth: BasicAuth): string | null {
  const { basicAuthUsername: username, basicAuthPassword: password } =
    basicAuth;
  if (!username || !password) {
    return null;
  }
  const basicAuthString = `${username}:${password}`;
  return `Basic ${Buffer.from(basicAuthString).toString("base64")}`;
}
