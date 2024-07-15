import { getDefaultRedroidHostname } from "%/device-info/device-info.ts";
import { upgradeDockerImageInfo } from "@/utils/docker/docker-api-utils.ts";
import {
  createDockerTemplateFromView,
  DockerComposeMoustacheView,
  getInsertableDeviceForView,
  InsertableDevice,
} from "@/utils/docker/docker-compose-moustache-formatting.ts";
import {
  completeImageName,
  createDockerPinnedString,
  getDockerImageInfo,
  getPathFriendlyStringForDockerImageInfo,
} from "@/utils/docker/docker-image-parsing.ts";
import { SampleDeviceSpecs } from "@/utils/redroid/device-specs.ts";
import { RedroidImage } from "@/utils/redroid/redroid-images.ts";
import { createId } from "@paralleldrive/cuid2";
import { spawn } from "node:child_process";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { stderr as processStderr, stdout as processStdout } from "node:process";
import { parse as yamlParse, stringify as yamlStringify } from "yaml";

function minifyYaml(yaml: string): string {
  return yamlStringify(yamlParse(yaml));
}

function getBaseDir(): string {
  return process.env.ANDROID_RUNTIME_BASEDIR ?? "./";
}

function getExternalNetworkName(): string {
  return process.env.EXTERNAL_NETWORK_NAME ?? "doppelganger";
}

type FunctionalDeviceSpecs = Pick<
  SampleDeviceSpecs,
  "dpi" | "height" | "width"
>;

export async function createView(
  selectedImage: RedroidImage,
  fps: number,
  specs: FunctionalDeviceSpecs,
): Promise<DockerComposeMoustacheView> {
  if (!selectedImage.usable) {
    throw new Error("Selected image is not usable");
  }

  const fullImageName = completeImageName(selectedImage.imageName, true);
  const dockerImageInfo = getDockerImageInfo(fullImageName);
  const completeDockerImageInfo = await upgradeDockerImageInfo(dockerImageInfo);

  const id = createId();

  return {
    id,
    redroidImage: createDockerPinnedString(completeDockerImageInfo),
    baseDir: getBaseDir(),
    externalNetworkName: getExternalNetworkName(),
    redroidImageDataBasePath: getPathFriendlyStringForDockerImageInfo(
      completeDockerImageInfo,
    ),
    redroidFps: fps,
    redroidDpi: specs.dpi,
    redroidWidth: specs.width,
    redroidHeight: specs.height,
  };
}

function getDockerComposeFileDirectory(id: string): string {
  return `${getBaseDir()}/${id}`;
}

function getDockerComposePathInFolder(stackFolder: string): string {
  return `${stackFolder}/docker-compose.yml`;
}

function getDockerComposeFilePath(id: string): string {
  return getDockerComposePathInFolder(getDockerComposeFileDirectory(id));
}

/**
 * Initializes a device with the given parameters. The returned Device's ID can then be passed into bringUpDevice to start the device.
 * @param ownerId The id of the owner of the device
 * @param deviceName The name of the device (user side)
 * @param selectedImage The image to use for the device
 * @param fps The FPS of the device
 * @param specs The specs of the device
 */
export async function initializeDevice(
  ownerId: string,
  deviceName: string,
  selectedImage: RedroidImage,
  fps: number,
  specs: FunctionalDeviceSpecs,
): Promise<InsertableDevice> {
  const fullImageName = completeImageName(selectedImage.imageName, true);
  const dockerImageInfo = getDockerImageInfo(fullImageName);

  const view = await createView(selectedImage, fps, specs);

  const dockerCompose = await createDockerTemplateFromView(view);
  const stackFolder = getDockerComposeFileDirectory(view.id); // we need to make this if it doesn't exist.
  await mkdir(stackFolder, { recursive: true });

  const dockerComposeFilePath = getDockerComposePathInFolder(stackFolder);
  const minifiedYaml = minifyYaml(dockerCompose);
  await writeFile(dockerComposeFilePath, minifiedYaml); // write the created docker compose file to the stack folder

  return getInsertableDeviceForView(view, dockerImageInfo, ownerId, deviceName);
}

function runDockerCommand(command: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const dockerProcess = spawn("docker", [command, ...args], {
      env: process.env,
      stdio: ["inherit", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    dockerProcess.stdout.on("data", function (data) {
      stdout += data.toString();
      processStdout.write(data); // Real-time output
    });

    dockerProcess.stderr.on("data", function (data) {
      stderr += data.toString();
      processStderr.write(data); // Real-time error output
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
 * @param deviceId
 */
export async function bringUpDevice(deviceId: string): Promise<void> {
  // https://gist.github.com/regulad/0cc0b5d92b35dcd2b679723b5701aacb
  // https://gist.github.com/regulad/6024b520cc1b118088f21cd311133c38
  await runDockerCommand("compose", [
    "-f",
    getDockerComposeFilePath(deviceId),
    "up",
    "-d",
  ]);
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

function getFoldersOfDevice(deviceId: string): string[] {
  return [
    getDockerComposeFileDirectory(deviceId),
    `${getBaseDir()}/${deviceId}-diff`, // from ./template/docker-compose.yml
  ];
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

async function getIsContainerRunning(containerName: string): Promise<boolean> {
  try {
    const result = await runDockerCommand("ps", ["--format", "{{.Names}}"]);
    const runningContainers = result.trim().split("\n");
    return runningContainers.includes(containerName);
  } catch (error: any) {
    console.error("Error checking container status:", error.message);
    throw error;
  }
}

export async function getIsDeviceRunning(deviceId: string): Promise<boolean> {
  return getIsContainerRunning(getDefaultRedroidHostname(deviceId));
}
