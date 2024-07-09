/**
 * This file contains utilities that are used to automate the deployment of the backend redroid containers that clients connect to.
 * Principally, the workflow for this file includes:
 * - Generating the view for a docker-compose file
 * - Generating the docker-compose file from a view
 * - Deploying the docker-compose file
 */
import {
  CUID,
  DockerImageInfo,
  PathFriendlyString,
} from "@/app/utils/docker/docker-image-parsing.ts";
import { Device, DeviceState } from "@prisma/client";
import Mustache from "mustache";
import { readFile } from "node:fs/promises";

interface GlobalThisExtension {
  ______dockerComposeTemplate: string | undefined;
}

declare const globalThis: GlobalThisExtension & { [p: string]: any };

async function loadDockerComposeTemplate(): Promise<string> {
  if (globalThis.______dockerComposeTemplate) {
    return globalThis.______dockerComposeTemplate;
  }

  const loadedFile = await readFile("./template/docker-compose.yml", "utf-8");
  globalThis.______dockerComposeTemplate = loadedFile;
  return loadedFile;
}

/**
 * For the docker-compose.yml file at ./template/docker-compose.yml
 */
interface DockerComposeMoustacheView extends Partial<Device> {
  id: CUID;

  redroidImage: string; // includes both the image name and the tag

  // this is where all of the files live
  baseDir: string; // ex: /mnt/doppelganger (no trailing slash!)
  redroidImageDataBasePath: PathFriendlyString; // includes the sha256 hash for pinning

  redroidFps: number;
  redroidDpi: number;
  redroidWidth: number;
  redroidHeight: number;

  basicAuthPassword: string;

  externalNetworkName: string;
}

function getRedroidHostnameForDevice(id: CUID): string {
  return `${id}-redroid`;
}

function getScrcpyHostnameForDevice(id: CUID): string {
  return `${id}-scrcpy`;
}

export async function createDockerTemplateFromView(
  view: DockerComposeMoustacheView,
): Promise<string> {
  const template = await loadDockerComposeTemplate();
  // https://github.com/janl/mustache.js?tab=readme-ov-file#usage
  return Mustache.render(template, view);
}

export function getInsertableDeviceForView(
  view: DockerComposeMoustacheView,
  dockerImageInfo: DockerImageInfo,
  ownerEmail: string,
  deviceName: string,
): Partial<Device> {
  const { id } = view;
  return {
    id,
    name: deviceName,
    ownerEmail,

    redroidImage: view.redroidImage,
    redroidImageDigest: dockerImageInfo.digest,

    redroidFps: view.redroidFps,
    redroidDpi: view.redroidDpi,
    redroidWidth: view.redroidWidth,
    redroidHeight: view.redroidHeight,

    adbHostname: getRedroidHostnameForDevice(id),
    adbPort: 5555,

    scrcpyHostname: getScrcpyHostnameForDevice(id),
    scrcpyTls: true,
    vncWssPath: "/websockify",
    vncWssPort: 6901,
    audioWssPort: 4901,

    basicAuthUsername: "kasm_user",
    basicAuthPassword: view.basicAuthPassword,
    certificateIsSelfSigned: true,

    lastState: DeviceState.ON,
  };
}
