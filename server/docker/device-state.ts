import { AdbDevice } from "%/adb/adb-device";
import { Device } from "@prisma/client";
import { spawn } from "node:child_process";
import { rm } from "node:fs/promises";
import { stderr as processStderr, stdout as processStdout } from "process";
import { getDockerComposeFilePath, getFoldersOfDevice } from "./device-paths";

export function runDockerCommand(
  command: string,
  args: string[],
): Promise<string> {
  return new Promise((resolve, reject) => {
    const dockerProcess = spawn("docker", [command, ...args], {
      env: process.env,
      stdio: ["inherit", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    dockerProcess.stdout.on("data", function (data) {
      stdout += data.toString();
      if (process.env.NODE_ENV !== "production") {
        processStdout.write(data); // Real-time output
      }
    });

    dockerProcess.stderr.on("data", function (data) {
      stderr += data.toString();
      if (process.env.NODE_ENV !== "production") {
        processStderr.write(data); // Real-time output
      }
    });

    dockerProcess.on("close", function (code) {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(
          new Error(
            `Docker command failed with code ${code}\nStderr: ${stderr}`,
          ),
        );
      }
    });
  });
}

/**
 * Brings up a device. Does *not* update the DB.
 * @param device
 */
export async function bringUpDevice(device: Device): Promise<void> {
  // https://gist.github.com/regulad/0cc0b5d92b35dcd2b679723b5701aacb
  // https://gist.github.com/regulad/6024b520cc1b118088f21cd311133c38
  await runDockerCommand("compose", [
    "-f",
    getDockerComposeFilePath(device.id),
    "up",
    "-d",
  ]);
  const adbDevice = new AdbDevice(device);
  await adbDevice.waitForAdbServerToBeReady();
}

/**
 * Brings down a device. Does *not* update the DB.
 * @param deviceId
 */
export async function bringDownDevice(deviceId: string): Promise<void> {
  // https://gist.github.com/regulad/0cc0b5d92b35dcd2b679723b5701aacb
  // https://gist.github.com/regulad/c88eb3c8bb9d8943bd6893438931a99a
  await runDockerCommand("compose", [
    "-f",
    getDockerComposeFilePath(deviceId),
    "down",
    "-v",
  ]);
}

export async function getIsContainerRunning(
  containerName: string,
): Promise<boolean> {
  try {
    const result = await runDockerCommand("ps", ["--format", "{{.Names}}"]);
    const runningContainers = result.trim().split("\n");
    return runningContainers.includes(containerName);
  } catch (error: any) {
    console.error("Error checking container status:", error.message);
    throw error;
  }
}

export function getRedroidContainerName(
  deviceId: string,
): `${string}-redroid-1` {
  return `${deviceId}-redroid-1`;
}

export function getScrcpyContainerName(deviceId: string): `${string}-scrcpy-1` {
  return `${deviceId}-scrcpy-1`;
}

export async function getIsDeviceRunning(device: Device): Promise<boolean> {
  const { id: deviceId } = device;

  const androidRunningPromise = getIsContainerRunning(
    getRedroidContainerName(deviceId),
  );
  const scrcpyRunningPromise = getIsContainerRunning(
    getScrcpyContainerName(deviceId),
  );

  const allPromises = await Promise.all([
    androidRunningPromise,
    scrcpyRunningPromise,
  ]);

  return allPromises.every(Boolean);
}

/**
 * Destroys all relevant files of the Device. This does *not* set the state nor remove it from the DB.
 * @param deviceId
 */
export async function destroyDevice(deviceId: string): Promise<void> {
  try {
    await bringDownDevice(deviceId);
  } catch (e: any) {
    console.error(e);
  }
  const folders = getFoldersOfDevice(deviceId);
  for (const folder of folders) {
    await rm(folder, { recursive: true, force: true });
  }
}
