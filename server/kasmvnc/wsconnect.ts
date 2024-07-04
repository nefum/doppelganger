import {IncomingHttpHeaders} from "node:http";
import {BasicAuth} from "../device-info/device-info";

export function getWsWebSocketOptionForKasmVNC(rawRequestHeaders: IncomingHttpHeaders | Headers, targetUrl: URL, targetIsUnsecure: boolean, basicAuth: BasicAuth): {
  [key: string]: any
} {
  let requestHeaders: { [key: string]: string | string[] | undefined } = {};
  if (rawRequestHeaders instanceof Headers) {
    rawRequestHeaders.forEach((value, key) => {
      requestHeaders[key] = value;
    });
  } else {
    requestHeaders = rawRequestHeaders
  }

  const usingTls = targetUrl.protocol === 'https:' || targetUrl.protocol === 'wss:';
  const wsHeaders: { [key: string]: string } = {
    pragma: "no-cache",
    "cache-control": "no-cache",
    "Host": `${targetUrl.hostname}:${targetUrl.port}`,
    "Origin": `${usingTls ? 'https' : 'http'}//${targetUrl.hostname}:${targetUrl.port}`
  }
  if (basicAuth) {
    wsHeaders["Authorization"] = generateBasicAuthHeader(basicAuth);
  }
  if (requestHeaders["user-agent"]) {
    wsHeaders["user-agent"] = requestHeaders["user-agent"] as string;
  }
  if (requestHeaders["accept-language"]) {
    wsHeaders["accept-language"] = requestHeaders["accept-language"] as string;
  }
  if (requestHeaders["accept-encoding"]) {
    const acceptableForceEncodings = requestHeaders["accept-encoding"] as string | string[];
    if (Array.isArray(acceptableForceEncodings)) {
      wsHeaders["accept-encoding"] = acceptableForceEncodings.join(", ");
    } else {
      wsHeaders["accept-encoding"] = acceptableForceEncodings;
    }
  }
  return {
    rejectUnauthorized: !targetIsUnsecure,
    headers: wsHeaders,
  }
}

function generateBasicAuthHeader(basicAuth: BasicAuth): string {
  const {username, password} = basicAuth;
  const basicAuthString = `${username}:${password}`;
  return `Basic ${Buffer.from(basicAuthString).toString('base64')}`;
}
