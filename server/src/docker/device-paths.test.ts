import {
  getBaseDir,
  getDataDirOfDevice,
  getDockerComposeFileDirectory,
  getDockerComposeFilePath,
  getDockerComposePathInFolder,
  getFoldersOfDevice,
} from "./device-paths.ts";

describe("Device Paths", () => {
  describe("getBaseDir", () => {
    it("returns default base directory when ANDROID_RUNTIME_BASEDIR is not set", () => {
      delete process.env.ANDROID_RUNTIME_BASEDIR;
      expect(getBaseDir()).toEqual("./");
    });

    it("returns ANDROID_RUNTIME_BASEDIR when set", () => {
      process.env.ANDROID_RUNTIME_BASEDIR = "/custom/dir";
      expect(getBaseDir()).toEqual("/custom/dir");
    });
  });

  describe("getDockerComposeFileDirectory", () => {
    it("constructs directory path with provided id", () => {
      const id = "test123";
      expect(getDockerComposeFileDirectory(id)).toEqual(
        `${getBaseDir()}/${id}`,
      );
    });
  });

  describe("getDockerComposePathInFolder", () => {
    it("constructs docker-compose.yml path within given folder", () => {
      const folder = "/path/to/folder";
      expect(getDockerComposePathInFolder(folder)).toEqual(
        `${folder}/docker-compose.yml`,
      );
    });
  });

  describe("getDockerComposeFilePath", () => {
    it("constructs docker-compose.yml path for given id", () => {
      const id = "device1";
      expect(getDockerComposeFilePath(id)).toEqual(
        `${getDockerComposeFileDirectory(id)}/docker-compose.yml`,
      );
    });
  });

  describe("getDataDirOfDevice", () => {
    it("constructs data directory path for given device id", () => {
      const deviceId = "device1";
      expect(getDataDirOfDevice(deviceId)).toEqual(
        `${getBaseDir()}/${deviceId}-diff`,
      );
    });
  });

  describe("getFoldersOfDevice", () => {
    it("returns array of directories related to the device", () => {
      const deviceId = "device1";
      const expectedFolders = [
        getDockerComposeFileDirectory(deviceId),
        getDataDirOfDevice(deviceId),
      ];
      expect(getFoldersOfDevice(deviceId)).toEqual(expectedFolders);
    });
  });
});
