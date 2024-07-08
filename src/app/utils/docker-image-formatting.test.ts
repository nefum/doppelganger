import {
  getDockerImageInfoFromStringWithDigest,
  getDockerImageInfoFromStringWithoutDigest,
  getPathFriendlyStringForDockerImageInfo,
} from "./docker-image-formatting";

describe("docker image parser", () => {
  it("can get the docker image info from a string without a digest", () => {
    const imageInfo =
      getDockerImageInfoFromStringWithoutDigest("ubuntu:latest");
    expect(imageInfo).toEqual({
      imageName: "ubuntu",
      tag: "latest",
      digest: null,
    });
  });

  it("returns only the image name if no tag is provided", () => {
    const imageInfo = getDockerImageInfoFromStringWithoutDigest("nginx");
    expect(imageInfo).toEqual({
      imageName: "nginx",
      tag: null,
      digest: null,
    });
  });

  it("can get the docker image info from a string with a digest", () => {
    const imageInfo = getDockerImageInfoFromStringWithDigest(
      "ubuntu:18.04@sha256:12345",
    );
    expect(imageInfo).toEqual({
      imageName: "ubuntu",
      tag: "18.04",
      digest: "sha256:12345",
    });
  });

  it("handles image with digest but no tag", () => {
    const imageInfo =
      getDockerImageInfoFromStringWithDigest("nginx@sha256:67890");
    expect(imageInfo).toEqual({
      imageName: "nginx",
      tag: null,
      digest: "sha256:67890",
    });
  });

  it("generates a path-friendly string from complete docker image info", () => {
    const pathFriendlyString = getPathFriendlyStringForDockerImageInfo({
      imageName: "example/nginx",
      tag: "1.0",
      digest: "sha256:abcdef1234567890",
    });
    expect(pathFriendlyString).toBe(
      "example___nginx____1.0____sha256___abcdef1234567890",
    );
  });
});
