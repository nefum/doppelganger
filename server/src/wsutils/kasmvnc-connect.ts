import { IncomingHttpHeaders } from "node:http";
import { WsWebSocketOptions } from "./wsutils";

export function getWsWebSocketOptionForKasmVNC(
  targetUrl: URL,
  incomingHeaders?: IncomingHttpHeaders,
): WsWebSocketOptions {
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
  wsHeaders.Authorization = generateBasicAuthHeader();
  return {
    rejectUnauthorized: false, // allow self-signed certs
    headers: wsHeaders,
  };
}

function generateBasicAuthHeader(): string {
  const username = "kasm_user";
  const password = "password";
  const basicAuthString = `${username}:${password}`;
  return `Basic ${Buffer.from(basicAuthString).toString("base64")}`;
}
