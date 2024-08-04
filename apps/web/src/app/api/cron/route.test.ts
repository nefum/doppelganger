// route.test.ts
import prisma from "%/database/prisma.ts";
import { bringDownDevice, getIsDeviceRunning } from "%/docker/device-state.ts";
import { getSubscriptionStatus } from "@/utils/stripe/utils.ts";
import { SubscriptionStatus } from "@/utils/subscriptions.ts";
import { GET } from "./route";

jest.mock("%/database/prisma.ts", () => ({
  device: {
    findMany: jest.fn(),
  },
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn(),
  },
}));

jest.mock("@/utils/stripe/utils.ts", () => ({
  getSubscriptionStatus: jest.fn(),
}));

jest.mock("%/docker/device-state.ts", () => ({
  bringDownDevice: jest.fn(),
  getIsDeviceRunning: jest.fn(),
}));

describe("GET function in route.ts", () => {
  it("should handle devices correctly based on subscription status", async () => {
    // Mock responses
    // @ts-expect-error -- testing purposes
    prisma.device.findMany.mockResolvedValue([
      { id: "device1", ownerId: "owner1", lastConnectedAt: new Date() },
    ]);
    // @ts-expect-error -- testing purposes
    getSubscriptionStatus.mockResolvedValue(SubscriptionStatus.PRO);
    // @ts-expect-error -- testing purposes
    getIsDeviceRunning.mockResolvedValue(true);
    // @ts-expect-error -- testing purposes
    bringDownDevice.mockResolvedValue(undefined);
    ``;
    // Call the function

    // @ts-expect-error -- testing purposes
    await GET(null);

    // Assertions
    expect(prisma.device.findMany).toHaveBeenCalled();
    expect(getSubscriptionStatus).toHaveBeenCalledWith("owner1");
    expect(getIsDeviceRunning).not.toHaveBeenCalled();
    expect(bringDownDevice).not.toHaveBeenCalled();
  });

  it("should call bringDownDevice for devices with inactive subscription past the idle time", async () => {
    // Mock the current time to ensure consistent test behavior
    jest.useFakeTimers().setSystemTime(new Date("2023-01-01T12:00:00Z"));

    // Mock responses
    const pastTime = new Date("2023-01-01T11:00:00Z"); // 1 hour in the past
    // @ts-expect-error -- testing purposes
    prisma.device.findMany.mockResolvedValue([
      { id: "device2", ownerId: "owner2", lastConnectedAt: pastTime },
    ]);
    // @ts-expect-error -- testing purposes
    getSubscriptionStatus.mockResolvedValue(SubscriptionStatus.FREE);
    // @ts-expect-error -- testing purposes
    getIsDeviceRunning.mockResolvedValue(true);

    // Call the function
    // @ts-expect-error -- testing purposes
    await GET(null);

    // Assertions
    expect(prisma.device.findMany).toHaveBeenCalled();
    expect(getSubscriptionStatus).toHaveBeenCalledWith("owner2");
    expect(getIsDeviceRunning).toHaveBeenCalled();
    expect(bringDownDevice).toHaveBeenCalledWith("device2"); // Check if bringDownDevice was called with any argument

    jest.useRealTimers(); // Reset timers after the test
  });
});
