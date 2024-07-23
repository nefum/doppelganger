import { SampleDeviceSpecs } from "%/device-info/device-specs.ts";
import { RedroidImage } from "%/device-info/redroid-images.ts";
import {
  getBaseDir,
  getDataDirOfDevice,
  getDockerComposeFileDirectory,
  getDockerComposePathInFolder,
} from "%/docker/device-paths.ts";
import { BASE_ORIGIN } from "@/constants.ts";
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
import { createId } from "@paralleldrive/cuid2";
import { randomBytes } from "crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { parse as yamlParse, stringify as yamlStringify } from "yaml";

function minifyYaml(yaml: string): string {
  return yamlStringify(yamlParse(yaml));
}

function getExternalNetworkName(): string {
  return process.env.EXTERNAL_NETWORK_NAME ?? "doppelganger";
}

type FunctionalDeviceSpecs = Pick<
  SampleDeviceSpecs,
  "dpi" | "height" | "width"
>;

function generateDoppelgangerSecret(): string {
  // Generate a 32-byte random value
  const secret = randomBytes(32);
  // Convert the secret to a base64 string for easy storage and transmission
  return secret.toString("base64");
}

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
    doppelgangerOrigin: BASE_ORIGIN,
    doppelgangerSecret: generateDoppelgangerSecret(),
  };
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
  await mkdir(getDataDirOfDevice(view.id), { recursive: true }); // required for the bind that limits storage

  const dockerComposeFilePath = getDockerComposePathInFolder(stackFolder);
  const minifiedYaml = minifyYaml(dockerCompose);
  await writeFile(dockerComposeFilePath, minifiedYaml); // write the created docker compose file to the stack folder

  return getInsertableDeviceForView(view, dockerImageInfo, ownerId, deviceName);
}
