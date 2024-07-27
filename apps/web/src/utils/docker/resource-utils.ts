import { exec as execCallback } from "child_process";
import { promisify } from "util";
const exec = promisify(execCallback);

export async function getTotalDiskUsageOfDirectoryBytes(
  directoryPath: string,
): Promise<number> {
  try {
    const { stdout } = await exec(`du -sb ${directoryPath}`);
    const sizeInBytes = stdout.split("\t")[0]; // Assuming the output format is "size[TAB]path"
    return parseInt(sizeInBytes, 10);
  } catch (error) {
    console.error("Error getting total disk usage:", error);
    throw error; // Rethrow the error to be handled by the caller
  }
}

const ibiUnitToBytes = {
  B: 1,
  KiB: 1024,
  MiB: 1024 ** 2,
  GiB: 1024 ** 3,
  TiB: 1024 ** 4,
  PiB: 1024 ** 5,
  EiB: 1024 ** 6,
  ZiB: 1024 ** 7,
};

export async function getMemoryUsageOfDockerContainerBytes(
  containerId: string,
): Promise<number> {
  try {
    const { stdout } = await exec(
      `docker stats --no-stream --format "{{.MemUsage}}" ${containerId}`,
    );
    // this returns a value like 163.9MiB / 23.42GiB
    // We only want the first value in bytes
    const memoryUsage = stdout.split(" ")[0];
    // Convert the value to bytes
    const memoryUsageFloatString = memoryUsage.slice(0, -3); // Remove the unit
    const memoryUnit = memoryUsage.slice(-3); // Get the unit
    const memoryUsageFloat = parseFloat(memoryUsageFloatString);
    // if the unit isn't in the map, it's already in bytes (don't cause a type error)
    // @ts-expect-error -- exhaustive, any value will map
    return memoryUsageFloat * ibiUnitToBytes[memoryUnit];
  } catch (error) {
    console.error("Error getting memory usage:", error);
    throw error; // Rethrow the error to be handled by the caller
  }
}

export async function getCpuUsageOfDockerContainerCpus(
  containerId: string,
): Promise<number> {
  try {
    const { stdout } = await exec(
      `docker stats --no-stream --format "{{.CPUPerc}}" ${containerId}`,
    );
    // this returns a value like 0.00%
    // We only want the first value, divided by 100 to get it in CPUs
    const cpuUsagePercentage = parseFloat(stdout.split(" ")[0]);
    return cpuUsagePercentage / 100;
  } catch (error) {
    console.error("Error getting CPU usage:", error);
    throw error; // Rethrow the error to be handled by the caller
  }
}
