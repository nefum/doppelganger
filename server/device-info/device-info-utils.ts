import type { Device } from "@prisma/client";

export type DeviceSpecs = Pick<
  Device,
  | "redroidFps"
  | "redroidDpi"
  | "redroidWidth" // MUST be divisible by 2
  | "redroidHeight" // MUST be divisible by 2
>;

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
export function getAdbUdidForDevice(device: Device): string {
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
