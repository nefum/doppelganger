import dockerApiClient from "@/utils/docker/docker-api.ts";
import {
  CompleteDockerImageInfo,
  completeImageName,
  DockerDigestType,
  DockerImageInfo,
  getDockerImageInfo,
} from "@/utils/docker/docker-image-parsing.ts";

interface DockerStreamMessage {
  status: string;
  id?: string;
}

function promisifyDockerStream(
  pullStream: NodeJS.ReadableStream,
): Promise<DockerStreamMessage[]> {
  return new Promise((resolve, reject) => {
    dockerApiClient.modem.followProgress(pullStream, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
}

/**
 * Polls the Docker API to get the digest of the tag at the current point in time.
 */
export async function getLatestDigestOfImage(
  fullImageString: string,
): Promise<DockerDigestType | null> {
  fullImageString = completeImageName(fullImageString, true);

  const pullStream = await dockerApiClient.pull(fullImageString);
  const pullReturn = await promisifyDockerStream(pullStream);
  const image = dockerApiClient.getImage(fullImageString);
  const imageInspect = await image.inspect();
  const digestString = imageInspect.RepoDigests?.[0];
  return !!digestString ? getDockerImageInfo(digestString).digest! : null;
}

export async function upgradeDockerImageInfo(
  dockerImageInfo: DockerImageInfo,
): Promise<CompleteDockerImageInfo> {
  const digest =
    dockerImageInfo.digest ??
    (await getLatestDigestOfImage(
      `${dockerImageInfo.imageName}:${dockerImageInfo.tag}`,
    ));
  if (!digest) {
    throw new Error("Could not fetch digest for image");
  }
  return {
    imageName: dockerImageInfo.imageName,
    tag: dockerImageInfo.tag,
    digest: digest,
  };
}
