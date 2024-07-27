/**
 * @jest-environment node
 */

import dockerApiClient from "@/utils/docker/docker-api.ts";
import {
  getLatestDigestOfImage,
  upgradeDockerImageInfo,
} from "./docker-api-utils.ts";
jest.mock("@/utils/docker/docker-api.ts");

describe("Docker API Utils", () => {
  describe("getLatestDigestOfImage", () => {
    it("fetches digest for image with tag", async () => {
      (dockerApiClient.pull as unknown as jest.Mock).mockResolvedValue(
        "pullStreamMock",
      );
      (
        dockerApiClient.modem.followProgress as unknown as jest.Mock
      ).mockImplementation((_, cb) => cb(null, []));
      (dockerApiClient.getImage as unknown as jest.Mock).mockReturnValue({
        inspect: () =>
          Promise.resolve({ RepoDigests: ["image@sha256:digest"] }),
      });

      const digest = await getLatestDigestOfImage("node:14");
      expect(digest).toEqual("sha256:digest");
    });

    it("throws error when Docker API call fails", async () => {
      (dockerApiClient.pull as unknown as jest.Mock).mockRejectedValue(
        new Error("Docker pull failed"),
      );

      await expect(getLatestDigestOfImage("node:14")).rejects.toThrow(
        "Docker pull failed",
      );
    });

    it("returns undefined if no RepoDigests found", async () => {
      (dockerApiClient.pull as unknown as jest.Mock).mockResolvedValue(
        "pullStreamMock",
      );
      (
        dockerApiClient.modem.followProgress as unknown as jest.Mock
      ).mockImplementation((_, cb) => cb(null, []));
      (dockerApiClient.getImage as unknown as jest.Mock).mockReturnValue({
        inspect: () => Promise.resolve({ RepoDigests: [] }),
      });

      const digest = await getLatestDigestOfImage("node:14");
      expect(digest).toBeNull();
    });
  });

  describe("upgradeDockerImageInfo", () => {
    it("upgrades image info with digest", async () => {
      (dockerApiClient.pull as unknown as jest.Mock).mockResolvedValue(
        "pullStreamMock",
      );
      (
        dockerApiClient.modem.followProgress as unknown as jest.Mock
      ).mockImplementation((_, cb) => cb(null, []));
      (dockerApiClient.getImage as unknown as jest.Mock).mockReturnValue({
        inspect: () =>
          Promise.resolve({ RepoDigests: ["image@sha256:digest"] }),
      });

      const upgradedInfo = await upgradeDockerImageInfo({
        imageName: "node",
        tag: "14",
        digest: null,
      });
      expect(upgradedInfo).toEqual({
        imageName: "node",
        tag: "14",
        digest: "sha256:digest",
      });
    });

    it("rejects if digest cannot be fetched", async () => {
      (dockerApiClient.pull as unknown as jest.Mock).mockResolvedValue(
        "pullStreamMock",
      );
      (
        dockerApiClient.modem.followProgress as unknown as jest.Mock
      ).mockImplementation((_, cb) => cb(null, []));
      (dockerApiClient.getImage as unknown as jest.Mock).mockReturnValue({
        inspect: () => Promise.resolve({ RepoDigests: [] }),
      });

      const originalInfo = { imageName: "node", tag: "14", digest: null };
      await expect(upgradeDockerImageInfo(originalInfo)).rejects.toThrow();
    });
  });
});
