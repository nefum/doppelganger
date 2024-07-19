import { getIsDeviceRunning } from "%/docker/device-state.ts";
import {
  CPU_LIMIT_CPUS,
  MEMORY_LIMIT_BYTES,
  VOLUME_SIZE_LIMIT_BYTES,
} from "@/app/constants.ts";
import {
  getConnectionStatus,
  getCpuUsage,
  getMemoryUsedBytes,
  getRunningStatus,
  getStorageUsedBytes,
} from "@/utils/redroid/stats";
import { Device } from "@prisma/client";

jest.mock("%/docker/device-paths.ts", () => ({
  getDataDirOfDevice: jest.fn().mockReturnValue("/data/device"),
}));

jest.mock("%/docker/device-state.ts", () => ({
  getIsDeviceRunning: jest.fn(),
  getRedroidContainerName: jest.fn().mockReturnValue("redroid_container"),
}));

jest.mock("%/adb/scrcpy.ts", () => ({
  AdbDevice: jest.fn().mockImplementation(() => ({
    getIsConnected: jest.fn(),
  })),
}));

jest.mock("@/utils/docker/resource-utils.ts", () => ({
  getCpuUsageOfDockerContainerCpus: jest.fn(),
  getMemoryUsageOfDockerContainerBytes: jest.fn(),
  getTotalDiskUsageOfDirectoryBytes: jest.fn(),
}));

describe("Device Stats Functions", () => {
  const mockDevice: Device = {
    id: "device1",
    name: "Test Device",
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Device;

  describe("getRunningStatus", () => {
    it("should return true when device is running", async () => {
      (getIsDeviceRunning as unknown as jest.Mock).mockResolvedValue(true);
      await expect(getRunningStatus(mockDevice)).resolves.toBe(true);
    });

    it("should return false when device is not running", async () => {
      (getIsDeviceRunning as unknown as jest.Mock).mockResolvedValue(false);
      await expect(getRunningStatus(mockDevice)).resolves.toBe(false);
    });
  });

  describe("getConnectionStatus", () => {
    it("should return true when device is connected", async () => {
      require("%/adb/scrcpy.ts").AdbDevice.mockImplementation(() => ({
        getIsConnected: jest.fn().mockResolvedValue(true),
      }));
      await expect(getConnectionStatus(mockDevice)).resolves.toBe(true);
    });

    it("should return false when device is not connected", async () => {
      require("%/adb/scrcpy.ts").AdbDevice.mockImplementation(() => ({
        getIsConnected: jest.fn().mockResolvedValue(false),
      }));
      await expect(getConnectionStatus(mockDevice)).resolves.toBe(false);
    });
  });

  describe("getStorageUsedBytes", () => {
    it("should return used and total storage bytes", async () => {
      require("@/utils/docker/resource-utils.ts").getTotalDiskUsageOfDirectoryBytes.mockResolvedValue(
        5000,
      );
      await expect(getStorageUsedBytes(mockDevice)).resolves.toEqual([
        5000,
        VOLUME_SIZE_LIMIT_BYTES,
      ]);
    });
  });

  describe("getMemoryUsedBytes", () => {
    it("should return used and total memory bytes", async () => {
      require("@/utils/docker/resource-utils.ts").getMemoryUsageOfDockerContainerBytes.mockResolvedValue(
        2000,
      );
      await expect(getMemoryUsedBytes(mockDevice)).resolves.toEqual([
        2000,
        MEMORY_LIMIT_BYTES,
      ]);
    });
  });

  describe("getCpuUsage", () => {
    it("should return used CPUs and total CPUs", async () => {
      require("@/utils/docker/resource-utils.ts").getCpuUsageOfDockerContainerCpus.mockResolvedValue(
        2,
      );
      await expect(getCpuUsage(mockDevice)).resolves.toEqual([
        2,
        CPU_LIMIT_CPUS,
      ]);
    });
  });
});
