/**
 * @jest-environment node
 */

import { type Client } from "@devicefarmer/adbkit";
import RobustClient from "./robust-client.ts";

const mockClient = {
  connect: jest.fn(),
  getState: jest.fn(),
  waitForDevice: jest.fn(),
  waitBootComplete: jest.fn(),
} as unknown as Client;

const serial = "127.0.0.1:5555";
const timeout = 1000;
const reconnectingClient = new RobustClient(mockClient, serial, timeout);

describe("ReconnectingAdbDeviceClient", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("throws error on install when timeout is reached", async () => {
    jest.spyOn(reconnectingClient, "getIsConnected").mockResolvedValue(false);

    const apk = "path/to/apk";
    await expect(reconnectingClient.install(apk)).rejects.toThrow(
      "Timeout waiting for device to connect",
    );
  });

  it("throws error on reboot when timeout is reached", async () => {
    jest.spyOn(reconnectingClient, "getIsConnected").mockResolvedValue(false);

    await expect(reconnectingClient.reboot()).rejects.toThrow(
      "Timeout waiting for device to connect",
    );
  });
});
