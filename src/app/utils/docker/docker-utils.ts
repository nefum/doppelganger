import dockerApiClient from "@/app/utils/docker/docker-api.ts";
import {
  DockerDigestType,
  getDockerImageInfoFromStringWithDigest,
} from "@/app/utils/docker/docker-image-parsing.ts";

/**
 * Polls the Docker API to get the digest of the tag at the current point in time.
 */
export async function getlatestDigest(
  fullImageString: string,
): Promise<DockerDigestType> {
  if (fullImageString.split("/").length === 1) {
    fullImageString = `library/${fullImageString}`;
  }

  if (!fullImageString.includes(":")) {
    fullImageString += ":latest";
  }

  await dockerApiClient.pull(fullImageString);
  const image = dockerApiClient.getImage(fullImageString);
  const imageInspect = await image.inspect();
  return getDockerImageInfoFromStringWithDigest(imageInspect.RepoDigests[0])
    .digest!;
}
