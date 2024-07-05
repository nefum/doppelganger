import { anyDeviceEndpoint } from "./device-regex";

export function getDeviceIdFromUrl(url: URL | string): string | null {
  let match;
  if (typeof url === "string") {
    match = url.match(anyDeviceEndpoint);
  } else {
    // might be "/devices/1/snapshot"
    match = url.pathname.match(anyDeviceEndpoint);
  }
  return match ? match[1] : null;
}

export interface BasicAuth {
  username: string;
  password: string;
}

export interface DeviceInfo {
  url: string;
  insecure: boolean;
  specs: {
    width: number;
    height: number;
  };
  basicAuth: BasicAuth;
}

export function getDeviceInfoForId(id: string): DeviceInfo | null {
  return {
    // always provide port
    url: "wss://doppelganger.tail11540.ts.net:6901/websockify/", // trailing / is important
    insecure: true, // self-signed certificate
    specs: {
      width: 590,
      height: 1140,
    },
    basicAuth: {
      username: "kasm_user",
      password: "ihopethisworks",
    },
  };
}
