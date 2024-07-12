/**
 * This file contains utilities that are used to automate the deployment of the backend redroid containers that clients connect to.
 * Principally, the workflow for this file includes:
 * - Generating the view for a docker-compose file
 * - Generating the docker-compose file from a view
 * - Deploying the docker-compose file
 */

export type CUID = string;
// A pathname that is friendly to the filesystem, can be created on any linux filesystem
export type PathFriendlyString = string;

export type DockerDigestType = `sha256:${string}`;

export interface DockerImageInfo {
  imageName: string;
  tag: string;
  digest: DockerDigestType | null;
}

export interface CompleteDockerImageInfo extends DockerImageInfo {
  digest: DockerDigestType;
}

function getDockerImageInfoFromStringWithoutDigest(
  imageAndTag: string,
): DockerImageInfo {
  // second step: split the image name and the tag if it exists
  let imageName = null; // can be like "ubuntu" or "thing/ubuntu"
  let tag = null;
  const imageAndTagArray = imageAndTag.split(":");
  if (imageAndTagArray.length === 2) {
    imageName = imageAndTagArray[0];
    tag = imageAndTagArray[1];
  } else {
    imageName = imageAndTagArray[0];
  }
  return {
    imageName: completeImageName(imageName, false),
    tag: tag ?? "latest",
    digest: null,
  };
}

export function getDockerImageInfo(fullImageName: string): DockerImageInfo {
  // example fullImageNameAndDigest: ubuntu:18.04@sha256:98706f0f213dbd440021993a82d2f70451a73698315370ae8615cc468ac06624
  // example fullImageNameAndDigest: thing/ubuntu:18.04@sha256:98706f0f213dbd440021993a82d2f70451a73698315370ae8615cc468ac06624

  // from docker documentation: https://docs.docker.com/engine/reference/commandline/tag/#extended-description

  // Name components may contain lowercase letters, digits and separators. A separator is defined as a period, one or two underscores, or one or more dashes. A name component may not start or end with a separator.
  // A tag name must be valid ASCII and may contain lowercase and uppercase letters, digits, underscores, periods and dashes. A tag name may not start with a period or a dash and may contain a maximum of 128 characters.

  let digest = null;

  // first step: split the image name and the digest if it exists
  const imageAndDigest = fullImageName.split("@");
  let imageAndTag;
  if (imageAndDigest.length === 2) {
    imageAndTag = imageAndDigest[0];
    digest = imageAndDigest[1] as DockerDigestType;
  } else {
    imageAndTag = imageAndDigest[0];
  }

  const { imageName, tag } =
    getDockerImageInfoFromStringWithoutDigest(imageAndTag);

  return {
    imageName,
    tag,
    digest,
  };
}

export function getPathFriendlyStringForDockerImageInfo(
  imageInfo: CompleteDockerImageInfo,
): PathFriendlyString {
  // EVERYTHING in the DockerImageInfo must be included in the path-friendly string; we also want to get rid of separators
  // the path-friendly string must be unique for every unique DockerImageInfo
  // the path-friendly string must be safe to use in a filesystem
  // the path-friendly string must be deterministic & human-readable

  const { imageName, tag, digest } = imageInfo;

  const imageNameComponent = imageName.replace("/", "___");
  const tagComponent = digest.replace(":", "___");
  return `${imageNameComponent}____${tag}____${tagComponent}`;
}

export function completeImageName(
  fullImageString: string,
  addTag: boolean,
): string {
  if (fullImageString.split("/").length === 1) {
    fullImageString = `library/${fullImageString}`;
  }

  if (!fullImageString.includes(":") && addTag) {
    fullImageString += ":latest";
  }

  return fullImageString;
}

export function createDockerPinnedString(
  completeDockerImageInfo: CompleteDockerImageInfo,
): string {
  return `${completeDockerImageInfo.imageName}:${completeDockerImageInfo.tag}@${completeDockerImageInfo.digest}`;
}
