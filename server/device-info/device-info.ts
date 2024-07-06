import { anyDeviceEndpoint } from "./device-regex.ts";

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

export enum DeviceStates {
  ON = "On",
  OFF = "Off",
  SUSPENDED = "Suspended",
  UNAVAILABLE = "Unavailable",
}

export interface DeviceInfo {
  deviceName: string;
  id: string;
  kasmUrl: string;
  audioUrl: string;
  state: DeviceStates;
  insecure: boolean;
  specs: {
    width: number;
    height: number;
  };
  basicAuth: BasicAuth;
}

export function getDeviceInfoForId(id: string): DeviceInfo | null {
  if (id !== "staging") {
    return null;
  }

  return {
    // always provide port
    deviceName: "staging",
    id: id,
    state: DeviceStates.ON,
    kasmUrl: "wss://doppelganger.tail11540.ts.net:6901/websockify/", // trailing / is important
    audioUrl: "wss://doppelganger.tail11540.ts.net:4901",
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
