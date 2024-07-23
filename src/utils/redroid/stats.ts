import { AdbDevice } from "%/adb/adb-device.ts";
import { getDataDirOfDevice } from "%/docker/device-paths.ts";
import {
  getIsDeviceRunning,
  getRedroidContainerName,
} from "%/docker/device-state.ts";
import {
  CPU_LIMIT_CPUS,
  MEMORY_LIMIT_BYTES,
  VOLUME_SIZE_LIMIT_BYTES,
} from "@/constants.ts";
import {
  getCpuUsageOfDockerContainerCpus,
  getMemoryUsageOfDockerContainerBytes,
  getTotalDiskUsageOfDirectoryBytes,
} from "@/utils/docker/resource-utils.ts";
import { Device } from "@prisma/client";

/**
 * Ignores rejection and returns -1 for any number promise that rejects.
 * @param {Promise<number>} promise The promise to process.
 * @returns {Promise<number>} The resolved value or -1 if rejected.
 */
async function ignoreNumberRejection(
  promise: Promise<number>,
): Promise<number> {
  try {
    return await promise;
  } catch (e) {
    return -1;
  }
}

/**
 * Retrieves the running status of the device.
 * @param {Device} device The device to check.
 * @returns {Promise<boolean>} The running status.
 */
export async function getRunningStatus(device: Device): Promise<boolean> {
  return getIsDeviceRunning(device);
}

/**
 * Retrieves the connection status of the device.
 * @param {Device} device The device to check.
 * @returns {Promise<boolean>} The connection status.
 */
export async function getConnectionStatus(device: Device): Promise<boolean> {
  const adbDevice = new AdbDevice(device);
  return adbDevice.getIsConnected();
}

/**
 * Retrieves the storage used bytes and total bytes.
 * @param {Device} device The device to check.
 * @returns {Promise<[number, number]>} The used and total storage bytes.
 */
export async function getStorageUsedBytes(
  device: Device,
): Promise<[number, number]> {
  const usedBytes = await ignoreNumberRejection(
    getTotalDiskUsageOfDirectoryBytes(getDataDirOfDevice(device.id)),
  );
  return [usedBytes, VOLUME_SIZE_LIMIT_BYTES];
}

/**
 * Retrieves the memory used bytes and total bytes.
 * @param {Device} device The device to check.
 * @returns {Promise<[number, number]>} The used and total memory bytes.
 */
export async function getMemoryUsedBytes(
  device: Device,
): Promise<[number, number]> {
  const usedBytes = await ignoreNumberRejection(
    getMemoryUsageOfDockerContainerBytes(getRedroidContainerName(device.id)),
  );
  return [usedBytes, MEMORY_LIMIT_BYTES];
}

/**
 * Retrieves the CPU usage and total CPUs.
 * @param {Device} device The device to check.
 * @returns {Promise<[number, number]>} The used CPUs and total CPUs.
 */
export async function getCpuUsage(device: Device): Promise<[number, number]> {
  const usedCpus = await ignoreNumberRejection(
    getCpuUsageOfDockerContainerCpus(getRedroidContainerName(device.id)),
  );
  return [usedCpus, CPU_LIMIT_CPUS];
}
