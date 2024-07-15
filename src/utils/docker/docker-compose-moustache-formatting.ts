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
} from "@/utils/docker/docker-image-parsing.ts";
import { Device } from "@prisma/client";
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
export interface DockerComposeMoustacheView extends Partial<Device> {
  id: CUID;

  redroidImage: string; // includes image name, tag, & digest

  // this is where all of the files live
  baseDir: string; // ex: /mnt/doppelganger (no trailing slash!)
  redroidImageDataBasePath: PathFriendlyString; // includes the sha256 hash for pinning

  redroidFps: number;
  redroidDpi: number;
  redroidWidth: number;
  redroidHeight: number;

  externalNetworkName: string;
}

export async function createDockerTemplateFromView(
  view: DockerComposeMoustacheView,
): Promise<string> {
  const template = await loadDockerComposeTemplate();
  // https://github.com/janl/mustache.js?tab=readme-ov-file#usage
  return Mustache.render(template, view);
}

export type InsertableDevice = Omit<
  Device,
  | "createdAt"
  | "updatedAt"
  | "lastState"
  | "adbHostname"
  | "adbPort"
  | "scrcpyHostname"
>;

export function getInsertableDeviceForView(
  view: DockerComposeMoustacheView,
  dockerImageInfo: DockerImageInfo,
  ownerId: string,
  deviceName: string,
): InsertableDevice {
  const { id } = view;
  return {
    id,
    name: deviceName,
    ownerId,

    redroidImage: `${dockerImageInfo.imageName}:${dockerImageInfo.tag}`,
    redroidImageDigest: dockerImageInfo.digest,

    redroidFps: view.redroidFps,
    redroidDpi: view.redroidDpi,
    redroidWidth: view.redroidWidth,
    redroidHeight: view.redroidHeight,
  };
}
