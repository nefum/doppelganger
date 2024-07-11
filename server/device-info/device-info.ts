import { Device } from "@prisma/client";
import prisma from "../database/prisma.ts";
import { deviceEndpoint } from "../endpoint-regex.ts";

export function getDeviceIdFromUrl(url: URL | string): string | null {
  let match;
  if (typeof url === "string") {
    match = url.match(deviceEndpoint);
  } else {
    // might be "/devices/1/snapshot"
    match = url.pathname.match(deviceEndpoint);
  }
  return match ? match[1] : null;
}

export type BasicAuth = Pick<Device, "basicAuthPassword" | "basicAuthUsername">;
export type DeviceSpecs = Pick<
  Device,
  | "redroidFps"
  | "redroidDpi"
  | "redroidWidth" // MUST be divisible by 2
  | "redroidHeight" // MUST be divisible by 2
>;

export async function getDeviceForId(id: string): Promise<Device | null> {
  if (id === "staging" && process.env.NODE_ENV === "production") {
    console.error("Tried to access staging/debug device in production");
    return null;
  }

  return prisma.device.findUnique({
    where: {
      id,
    },
  });
}

export function getAdbConnectionUrlForDevice(device: Device): string {
  return `${device.adbHostname}:${device.adbPort}`;
}

export function getTargetVncWebsocketUrlForDevice(device: Device): string {
  return `${device.scrcpyTls ? "wss" : "ws"}://${device.scrcpyHostname}:${device.vncWssPort}${device.vncWssPath}`;
}

export function getTargetAudioWebsocketUrlForDevice(device: Device): string {
  // never runs without TLS
  return `wss://${device.scrcpyHostname}:${device.audioWssPort}`;
}
