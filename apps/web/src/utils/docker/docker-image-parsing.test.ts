/**
 * @jest-environment node
 */

import {
  getDockerImageInfo,
  getPathFriendlyStringForDockerImageInfo,
} from "./docker-image-parsing.ts";

describe("docker image parser", () => {
  it("can get the docker image info from a string with a digest", () => {
    const imageInfo = getDockerImageInfo("ubuntu:18.04@sha256:12345");
    expect(imageInfo).toEqual({
      imageName: "library/ubuntu",
      tag: "18.04",
      digest: "sha256:12345",
    });
  });

  it("handles image with digest but no tag", () => {
    const imageInfo = getDockerImageInfo("nginx@sha256:67890");
    expect(imageInfo).toEqual({
      imageName: "library/nginx",
      tag: "latest",
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
