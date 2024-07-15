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

export type DeviceSpecs = Pick<
  Device,
  | "redroidFps"
  | "redroidDpi"
  | "redroidWidth" // MUST be divisible by 2
  | "redroidHeight" // MUST be divisible by 2
>;

export async function getDeviceForId(id: string): Promise<Device | null> {
  if (id.endsWith("staging") && process.env.NODE_ENV === "production") {
    console.warn("Tried to access staging/debug device in production");
    return null;
  }

  return prisma.device.findUnique({
    where: {
      id,
    },
  });
}

export function getDefaultRedroidHostname(id: string): string {
  return `${id}-redroid`;
}

export function getDefaultScrcpyHostname(id: string): string {
  return `${id}-scrcpy`;
}

/**
 * Gets the ADB udid for a device. This can be used to open a connection.
 * @param device
 */
export function getUdidForDevice(device: Device): string {
  return `${device.adbHostname ?? getDefaultRedroidHostname(device.id)}:${device.adbPort}`;
}

export function getTargetVncWebsocketUrlForDevice(device: Device): string {
  // never runs without TLS (self-signed)
  // always runs on port 6901, path /websockify
  return `wss://${device.adbHostname ?? getDefaultScrcpyHostname(device.id)}:6901/websockify`;
}

export function getTargetAudioWebsocketUrlForDevice(device: Device): string {
  // never runs without TLS
  // always runs on port 4901
  return `wss://${device.adbHostname ?? getDefaultScrcpyHostname(device.id)}:4901`;
}
