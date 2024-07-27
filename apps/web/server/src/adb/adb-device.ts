import { createAdbClient } from "%/adb/adb.ts";
import ReconnectingAdbDeviceClient, {
  DEFAULT_ADB_TIMEOUT,
} from "%/adb/reconnecting-adb-device-client.ts";
import { getAdbUdidForDevice } from "%/device-info/device-info-utils";
import { getRedroidImage } from "%/device-info/redroid-images";
import { type Client } from "@devicefarmer/adbkit";
import { Device } from "@prisma/client";
import { spawn } from "child_process";
import { Duplex } from "node:stream";

enum PID_DETECTION_METHOD {
  UNKNOWN,
  PIDOF,
  GREP_PS,
  GREP_PS_A,
  LS_PROC,
}

interface AdbListDeviceDevice {
  id: string;
  type: "emulator" | "device" | "offline" | "unauthorized";
}

export function readStreamIntoBufferAndClose(stream: Duplex): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    stream.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
    });

    stream.on("end", () => {
      const result = Buffer.concat(chunks);
      stream.destroy();
      resolve(result);
    });

    stream.on("error", (error: Error) => {
      stream.destroy();
      reject(error);
    });
  });
}

// https://github.com/NetrisTV/ws-scrcpy/blob/29897e2cc5206631f79b7055f1385858572efe40/src/server/goog-device/Device.ts
// https://github.com/NetrisTV/ws-scrcpy/blob/29897e2cc5206631f79b7055f1385858572efe40/src/server/goog-device/ScrcpyServer.ts
export class AdbDevice {
  public adbDeviceClient: ReconnectingAdbDeviceClient;
  public adbClient: Client;
  private readonly tag: string;
  private pidDetectionMethod: PID_DETECTION_METHOD =
    PID_DETECTION_METHOD.UNKNOWN;

  constructor(
    public device: Device,
    private readonly timeout: number = DEFAULT_ADB_TIMEOUT,
  ) {
    this.tag = `[${this.udid}]`;
    this.adbClient = createAdbClient();
    this.adbDeviceClient = new ReconnectingAdbDeviceClient(
      this.adbClient,
      this.udid,
      timeout,
    );
  }

  /**
   * Connects to the device using adb. Silently fails if the device is already connected.
   */
  connect(): Promise<void> {
    return this.adbDeviceClient.doConnect();
  }

  connectRobust(timeout?: number): Promise<void> {
    return this.adbDeviceClient.connectRobust(timeout);
  }

  getIsConnected(): Promise<boolean> {
    return this.adbDeviceClient.getIsConnected();
  }

  get udid(): string {
    return getAdbUdidForDevice(this.device);
  }

  public async runShellCommandAdbKit(command: string): Promise<string> {
    return this.adbDeviceClient
      .shell(command)
      .then(readStreamIntoBufferAndClose)
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

  public async runShellCommandHostShell(command: string): Promise<string> {
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
    this.adbDeviceClient.push(contents, path);
  }

  /* custom methods */
  /**
   * Gets the Framework ID for an Android device so that it may be registered with Google at https://www.google.com/android/uncertified
   */
  async getGoogleServicesFrameworkID(timeout?: number): Promise<BigInt> {
    timeout = timeout ?? this.timeout;

    const startTime = Date.now();

    const redroidImage = getRedroidImage(this.device.redroidImage)!;
    if (!redroidImage.gms) {
      throw new Error("Device does not have Google Mobile Services");
    }

    // adb root
    // adb shell 'sqlite3 /data/user/$(cmd activity get-current-user)/*/*/gservices.db \
    //     "select * from main where name = \"android_id\";"'
    await this.getRootSafe();

    let androidIdRet: string;
    while (true) {
      try {
        androidIdRet = await this.runShellCommandAdbKit(
          `sqlite3 /data/user/$(cmd activity get-current-user)/*/*/gservices.db "select * from main where name = \\"android_id\\";"`,
        );
        // rets android_id|3546527965867813643
        break;
      } catch (e: any) {
        if (timeout && Date.now() - startTime > timeout) {
          throw new Error("Timeout waiting for device to connect");
        }
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    const androidIdString = androidIdRet.split("|")[1].trim();

    return BigInt(androidIdString); // literally too big for an integer, using parseInt will lose precision on the final values which makes the method useless
  }

  private async getRootSafe(): Promise<void> {
    try {
      await this.adbDeviceClient.root();
    } catch (e: any) {
      // we can sometimes get "Error: adbd is already running as root"
      // this is fine; we can ignore
      if (!(e as Error).message.includes("already running as root")) {
        throw e;
      }
    }
  }
}
