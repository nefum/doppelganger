import * as childProcess from "child_process";
import {
  getCpuUsageOfDockerContainerCpus,
  getMemoryUsageOfDockerContainerBytes,
  getTotalDiskUsageOfDirectoryBytes,
} from "./resource-utils";

jest.mock("child_process", () => ({
  exec: jest.fn(),
}));

describe("Docker Resource Utils", () => {
  describe("getTotalDiskUsageOfDirectoryBytes", () => {
    it("returns total disk usage in bytes for valid directory", async () => {
      (childProcess.exec as unknown as jest.Mock).mockImplementationOnce(
        (cmd, callback) => {
          callback(null, { stdout: "1024\t/some/path" });
        },
      );
      const size = await getTotalDiskUsageOfDirectoryBytes("/some/path");
      expect(size).toEqual(1024);
    });

    it("throws error on exec failure", async () => {
      (childProcess.exec as unknown as jest.Mock).mockImplementationOnce(
        (cmd, callback) => {
          callback(new Error("Failed to execute command"), null);
        },
      );
      await expect(
        getTotalDiskUsageOfDirectoryBytes("/invalid/path"),
      ).rejects.toThrow("Failed to execute command");
    });
  });

  describe("getMemoryUsageOfDockerContainerBytes", () => {
    it("returns memory usage in bytes for valid container ID", async () => {
      (childProcess.exec as unknown as jest.Mock).mockImplementationOnce(
        (cmd, callback) => {
          callback(null, { stdout: "163.9MiB / 23.42GiB" });
        },
      );
      const usage = await getMemoryUsageOfDockerContainerBytes("container123");
      expect(usage).toBeCloseTo(163.9 * 1024 * 1024);
    });

    it("throws error on exec failure", async () => {
      (childProcess.exec as unknown as jest.Mock).mockImplementationOnce(
        (cmd, callback) => {
          callback(new Error("Failed to execute command"), null);
        },
      );
      await expect(
        getMemoryUsageOfDockerContainerBytes("invalidContainer"),
      ).rejects.toThrow("Failed to execute command");
    });
  });

  describe("getCpuUsageOfDockerContainerCpus", () => {
    it("returns CPU usage as a fraction of a CPU for valid container ID", async () => {
      (childProcess.exec as unknown as jest.Mock).mockImplementationOnce(
        (cmd, callback) => {
          callback(null, { stdout: "25.00%" });
        },
      );
      const usage = await getCpuUsageOfDockerContainerCpus("container123");
      expect(usage).toEqual(0.25);
    });

    it("throws error on exec failure", async () => {
      (childProcess.exec as unknown as jest.Mock).mockImplementationOnce(
        (cmd, callback) => {
          callback(new Error("Failed to execute command"), null);
        },
      );
      await expect(
        getCpuUsageOfDockerContainerCpus("invalidContainer"),
      ).rejects.toThrow("Failed to execute command");
    });
  });
});
