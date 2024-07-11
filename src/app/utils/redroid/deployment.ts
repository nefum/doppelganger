import { upgradeDockerImageInfo } from "@/app/utils/docker/docker-api-utils.ts";
import dockerApiClient from "@/app/utils/docker/docker-api.ts";
import {
  createDockerTemplateFromView,
  DockerComposeMoustacheView,
  getInsertableDeviceForView,
  InsertableDevice,
} from "@/app/utils/docker/docker-compose-moustache-formatting.ts";
import {
  completeImageName,
  getDockerImageInfo,
  getPathFriendlyStringForDockerImageInfo,
} from "@/app/utils/docker/docker-image-parsing.ts";
import { SampleDeviceSpecs } from "@/app/utils/redroid/device-specs.ts";
import { RedroidImage } from "@/app/utils/redroid/redroid-images.ts";
import { createId } from "@paralleldrive/cuid2";
import DockerodeCompose from "dockerode-compose";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
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

export const DEFAULT_FPS = 30; // may need to change this as server load increases

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
    redroidImage: fullImageName,
    baseDir: getBaseDir(),
    externalNetworkName: getExternalNetworkName(),
    redroidImageDataBasePath: getPathFriendlyStringForDockerImageInfo(
      completeDockerImageInfo,
    ),
    basicAuthPassword: id.slice(0, 8), // 8 characters of the id should be enough
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
 * @param ownerEmail The email of the owner of the device
 * @param deviceName The name of the device (user side)
 * @param selectedImage The image to use for the device
 * @param fps The FPS of the device
 * @param specs The specs of the device
 */
export async function initializeDevice(
  ownerEmail: string,
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
  await writeFile(dockerComposeFilePath, minifyYaml(dockerCompose)); // write the created docker compose file to the stack folder

  return getInsertableDeviceForView(
    view,
    dockerImageInfo,
    ownerEmail,
    deviceName,
  );
}

async function getDockerodeComposeForFilePath(
  dockerComposeFilePath: string,
): Promise<DockerodeCompose> {
  const parentDirName = dockerComposeFilePath.split("/").slice(0, -1).join("/");

  const composeFile = await readFile(dockerComposeFilePath, "utf-8");
  const parsedComposeFile = yamlParse(composeFile);
  const stackName = parsedComposeFile.name ?? parentDirName;

  return new DockerodeCompose(
    dockerApiClient,
    dockerComposeFilePath,
    stackName,
  );
}

/**
 * Deploys a stack to the docker engine from a docker-compose definition
 * @param dockerComposeFilePath
 */
async function deployStack(dockerComposeFilePath: string) {
  // read the name from the file
  const dockerodeCompose = await getDockerodeComposeForFilePath(
    dockerComposeFilePath,
  );
  await dockerodeCompose.pull();
  return await dockerodeCompose.up();
}

/**
 * Brings up a device. Does *not* update the DB.
 * @param deviceId
 */
export async function bringUpDevice(deviceId: string): Promise<boolean> {
  const dockerComposeFilePath = getDockerComposeFilePath(deviceId);
  const returnValue = await deployStack(dockerComposeFilePath);
  return returnValue.services.length > 0;
}

/**
 * Brings down a device. Does *not* update the DB.
 * @param deviceId
 */
export async function bringDownDevice(deviceId: string): Promise<void> {
  const dockerComposeFilePath = getDockerComposeFilePath(deviceId);
  const dockerodeCompose = await getDockerodeComposeForFilePath(
    dockerComposeFilePath,
  );
  await dockerodeCompose.down({ volumes: true });
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
  await bringDownDevice(deviceId);
  const folders = getFoldersOfDevice(deviceId);
  for (const folder of folders) {
    await rm(folder, { recursive: true, force: true });
  }
}
