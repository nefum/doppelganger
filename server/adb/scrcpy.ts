import { DeviceClient } from "@devicefarmer/adbkit";
import Util from "@devicefarmer/adbkit/dist/src/adb/util";
import { Device } from "@prisma/client";
import { spawn } from "child_process";
import adb from "./adb.ts";

enum PID_DETECTION_METHOD {
  UNKNOWN,
  PIDOF,
  GREP_PS,
  GREP_PS_A,
  LS_PROC,
}

const LOCAL_SCRCPY_SERVER_PATH = "./scrcpy/scrcpy-server.jar";
const SCRCPY_WS_PORT = 8886;
// this is a temporary path in android, it can be used to store the scrcpy server binary
const TEMP_PATH = "/data/local/tmp/";
// filename IN ANDROID for the scrcpy server binary
const FILE_NAME = "scrcpy-server.jar";
// this is where the pid file is located on the android device running the scrcpy server
const PID_FILE_PATH = "/data/local/tmp/ws_scrcpy.pid";
// the process name of the scrcpy server
const APP_PROCESS = "app_process";
// the classpath of the scrcpy server
const SERVER_CLASS = "com.genymobile.scrcpy.Server";
// Scrcpy server version
const SERVER_VERSION = "1.19-ws5";
// the command that is issued to android to start the scrcpy server
const RUN_COMMAND = `CLASSPATH=${TEMP_PATH}${FILE_NAME} nohup ${APP_PROCESS} ${SERVER_CLASS} ${SERVER_VERSION} web ERROR ${SCRCPY_WS_PORT} true 2>&1 > /dev/null`;

export type WaitForPidParams = {
  tryCounter: number;
  processExited: boolean;
  lookPidFile: boolean;
};

// https://github.com/NetrisTV/ws-scrcpy/blob/29897e2cc5206631f79b7055f1385858572efe40/src/server/goog-device/Device.ts
// https://github.com/NetrisTV/ws-scrcpy/blob/29897e2cc5206631f79b7055f1385858572efe40/src/server/goog-device/ScrcpyServer.ts
export class AdbDevice {
  private deviceId: string | null = null;
  public adbClient: DeviceClient | null = null;
  private readonly tag: string;
  private pidDetectionMethod: PID_DETECTION_METHOD =
    PID_DETECTION_METHOD.UNKNOWN;

  constructor(public device: Device) {
    this.tag = `[${this.udid}]`;
  }

  /**
   * Connects to the device using adb. Silently fails if the device is already connected.
   */
  async connect(): Promise<void> {
    const isConnected = await this.getIsConnected();
    if (isConnected) {
      return;
    }
    this.deviceId = await adb.connect(
      this.device.adbHostname,
      this.device.adbPort,
    );
    this.adbClient = adb.getDevice(this.deviceId!);
  }

  async getIsConnected(): Promise<boolean> {
    if (!this.deviceId) {
      return false;
    }
    const allDevices = await adb.listDevices();
    return allDevices.some((device: string) => device === this.deviceId);
  }

  get udid(): string {
    return `${this.device.adbHostname}:${this.device.adbPort}`;
  }

  public async runShellCommandAdbKit(command: string): Promise<string> {
    if (!this.adbClient) {
      throw new Error("Device is not connected");
    }
    return this.adbClient
      .shell(command)
      .then(Util.readAll)
      .then((output: Buffer) => output.toString().trim());
  }

  private async executedWithoutError(command: string): Promise<boolean> {
    return this.runShellCommandAdbKit(command)
      .then((output) => {
        const err = parseInt(output, 10);
        return err === 0;
      })
      .catch(() => {
        return false;
      });
  }

  private async hasPidOf(): Promise<boolean> {
    const ok = await this.executedWithoutError(
      "which pidof 2>&1 >/dev/null && echo $?",
    );
    if (!ok) {
      return false;
    }
    return this.runShellCommandAdbKit("echo $PPID; pidof init")
      .then((output) => {
        const pids = output.split("\n").filter((a) => a.length);
        if (pids.length < 2) {
          return false;
        }
        const parentPid = pids[0].replace("\r", "");
        const list = pids[1].split(" ");
        if (list.includes(parentPid)) {
          return false;
        }
        return list.includes("1");
      })
      .catch(() => {
        return false;
      });
  }

  private async pidOf(processName: string): Promise<number[]> {
    return this.runShellCommandAdbKit(`pidof ${processName}`)
      .then((output) => {
        return output
          .split(" ")
          .map((pid) => parseInt(pid, 10))
          .filter((num) => !isNaN(num));
      })
      .catch(() => {
        return [];
      });
  }

  private async hasPs(): Promise<boolean> {
    return this.executedWithoutError("ps | grep init 2>&1 >/dev/null; echo $?");
  }

  private filterPsOutput(processName: string, output: string): number[] {
    const list: number[] = [];
    const processes = output.split("\n");
    processes.map((line) => {
      const cols = line
        .trim()
        .split(" ")
        .filter((item) => item.length);
      if (cols[cols.length - 1] === processName) {
        const pid = parseInt(cols[1], 10);
        if (!isNaN(pid)) {
          list.push(pid);
        }
      }
    });
    return list;
  }

  private async grepPs_A(processName: string): Promise<number[]> {
    return this.runShellCommandAdbKit(`ps -A | grep ${processName}`)
      .then((output) => {
        return this.filterPsOutput(processName, output);
      })
      .catch(() => {
        return [];
      });
  }

  private async grepPs(processName: string): Promise<number[]> {
    return this.runShellCommandAdbKit(`ps | grep ${processName}`)
      .then((output) => {
        return this.filterPsOutput(processName, output);
      })
      .catch(() => {
        return [];
      });
  }

  private async hasPs_A(): Promise<boolean> {
    return this.executedWithoutError(
      "ps -A | grep init 2>&1 >/dev/null; echo $?",
    );
  }

  private async findDetectionVariant(): Promise<PID_DETECTION_METHOD> {
    if (await this.hasPidOf()) {
      return PID_DETECTION_METHOD.PIDOF;
    }
    if (await this.hasPs_A()) {
      return PID_DETECTION_METHOD.GREP_PS_A;
    }
    if (await this.hasPs()) {
      return PID_DETECTION_METHOD.GREP_PS;
    }
    return PID_DETECTION_METHOD.LS_PROC;
  }

  private async getDetectionVariant(): Promise<PID_DETECTION_METHOD> {
    if (this.pidDetectionMethod === PID_DETECTION_METHOD.UNKNOWN) {
      this.pidDetectionMethod = await this.findDetectionVariant();
    }
    return this.pidDetectionMethod;
  }

  public async getPidOf(processName: string): Promise<number[]> {
    const isConnected = await this.getIsConnected();
    if (!isConnected) {
      throw new Error("Device is not connected");
    }
    const pidDetectionVariant = await this.getDetectionVariant();
    switch (pidDetectionVariant) {
      case PID_DETECTION_METHOD.PIDOF:
        return this.pidOf(processName);
      case PID_DETECTION_METHOD.GREP_PS:
        return this.grepPs(processName);
      case PID_DETECTION_METHOD.GREP_PS_A:
        return this.grepPs_A(processName);
      default:
        return this.listProc(processName);
    }
  }

  private async listProc(processName: string): Promise<number[]> {
    const find = `find /proc -maxdepth 2 -name cmdline  2>/dev/null`;
    const lines = await this.runShellCommandAdbKit(
      `for L in \`${find}\`; do grep -sae '^${processName}' $L 2>&1 >/dev/null && echo $L; done`,
    );
    const re = /\/proc\/([0-9]+)\/cmdline/;
    const list: number[] = [];
    lines.split("\n").map((line) => {
      const trim = line.trim();
      const m = trim.match(re);
      if (m) {
        list.push(parseInt(m[1], 10));
      }
    });
    return list;
  }

  public async runShellCommandAdb(command: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const cmd = "adb";
      const args = ["-s", `${this.udid}`, "shell", command];
      const adb = spawn(cmd, args, { stdio: ["ignore", "pipe", "pipe"] });
      let output = "";

      adb.stdout.on("data", (data) => {
        output += data.toString();
        console.log(this.tag, `stdout: ${data.toString().replace(/\n$/, "")}`);
      });

      adb.stderr.on("data", (data) => {
        console.error(this.tag, `stderr: ${data}`);
      });

      adb.on("error", (error: Error) => {
        console.error(this.tag, `failed to spawn adb process.\n${error.stack}`);
        reject(error);
      });

      adb.on("close", (code) => {
        console.log(
          this.tag,
          `adb process (${args.join(" ")}) exited with code ${code}`,
        );
        resolve(output);
      });
    });
  }

  public killProcess(pid: number): Promise<string> {
    const command = `kill ${pid}`;
    return this.runShellCommandAdbKit(command);
  }

  public async push(contents: string, path: string): Promise<void> {
    if (!this.adbClient) {
      throw new Error("Device is not connected");
    }
    this.adbClient.push(contents, path);
  }

  /* Scrcpy-specific methods */

  async getScrcpyServerPid(): Promise<number[]> {
    const runningServers = await this.getPidOf(APP_PROCESS);
    if (!Array.isArray(runningServers) || !runningServers.length) {
      return [];
    }

    // we need to thin out the list of running servers to only include the scrcpy server
    for (const pid of [...runningServers]) {
      const cmdline = await this.runShellCommandAdbKit(
        `cat /proc/${pid}/cmdline`,
      );
      const args = cmdline.split("\0");

      if (!args.length || args[0] !== APP_PROCESS) {
        delete runningServers[runningServers.indexOf(pid)];
        continue;
      }

      let first = args[0];
      while (args.length && first !== SERVER_CLASS) {
        args.shift();
        first = args[0];
      }

      if (args.length < 3) {
        delete runningServers[runningServers.indexOf(pid)];
        continue;
      }

      const versionString = args[1];

      if (versionString === SERVER_VERSION) {
        continue;
      }

      if (versionString.endsWith("-ws")) {
        // this is a compatible version; we can ignore it and just try to connect
        continue;
      }

      // this is an incompatible version; we need to kill it

      await this.killProcess(pid);
    }

    return runningServers;
  }

  async waitForServerPid(params: WaitForPidParams): Promise<number[]> {
    const { tryCounter, processExited, lookPidFile } = params;
    if (processExited) {
      throw new Error("Server process exited");
    }
    const timeout = 500 + 100 * tryCounter;
    if (lookPidFile) {
      const fileName = PID_FILE_PATH;
      const content = await this.runShellCommandAdbKit(
        `test -f ${fileName} && cat ${fileName}`,
      );
      if (content.trim()) {
        const pid = parseInt(content, 10);
        if (pid && !isNaN(pid)) {
          const realPid = await this.getScrcpyServerPid();
          if (realPid?.includes(pid)) {
            return realPid;
          } else {
            params.lookPidFile = false;
          }
        }
      }
    } else {
      const list = await this.getScrcpyServerPid();
      if (Array.isArray(list) && list.length) {
        return list;
      }
    }
    if (++params.tryCounter > 5) {
      throw new Error("Failed to start server");
    }
    return new Promise<number[]>((resolve) => {
      setTimeout(() => {
        resolve(this.waitForServerPid(params));
      }, timeout);
    });
  }
}

/**
 * Starts the scrcpy server on the device. Silently fails if the server is already running.
 * @param deviceInfo
 */
export async function runScrcpyServerOnDevice(
  deviceInfo: Device,
): Promise<void> {
  // this is from https://github.com/NetrisTV/ws-scrcpy/blob/29897e2cc5206631f79b7055f1385858572efe40/src/server/goog-device/ScrcpyServer.ts
  const adbDevice = new AdbDevice(deviceInfo);
  await adbDevice.connect(); // if we are already connected, this will be a no-op
  const runningServers = await adbDevice.getScrcpyServerPid();
  if (Array.isArray(runningServers) && runningServers.length) {
    return; // server is already running; we are done
  }

  await adbDevice.push(LOCAL_SCRCPY_SERVER_PATH, `${TEMP_PATH}${FILE_NAME}`);
  const waitForServerPidParams: WaitForPidParams = {
    tryCounter: 0,
    processExited: false,
    lookPidFile: true,
  };
  const scrcpyServerPromise = adbDevice.runShellCommandAdb(RUN_COMMAND);
  const waitForServerPidPromise = adbDevice.waitForServerPid(
    waitForServerPidParams,
  );

  const pids = await Promise.race([
    scrcpyServerPromise,
    waitForServerPidPromise,
  ]);

  if (!Array.isArray(pids) || !pids.length) {
    throw new Error(`Failed to start server ${pids}`);
  }

  const pid = pids[0];

  console.log(
    `scrcpy server started on device ${adbDevice.udid} with pid ${pid}`,
  );
}

/**
 * Gets the WebSocket URL string for the device.
 * Use of the returned URL requires the Scrcpy server to be running on the device, which can be started with `runScrcpyServerOnDevice`.
 * @param deviceInfo
 */
export function getWsUrlStringForDevice(deviceInfo: Device): string {
  return `ws://${deviceInfo.adbHostname}:${SCRCPY_WS_PORT}`;
}
