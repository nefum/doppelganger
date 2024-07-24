import { getDefaultRedroidHostname } from "%/device-info/device-info-utils";
import { Device } from "@prisma/client";
import path from "path";
import { AdbDevice } from "./adb-device";

const localScrcpyServerJarRelative = "../../scrcpy/scrcpy-server.jar";
const LOCAL_SCRCPY_SERVER_PATH = path.resolve(
  __dirname,
  localScrcpyServerJarRelative,
);
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
const RUN_COMMAND = `CLASSPATH=${TEMP_PATH}${FILE_NAME} nohup ${APP_PROCESS} / ${SERVER_CLASS} ${SERVER_VERSION} web ERROR ${SCRCPY_WS_PORT} true 2>&1 > /dev/null`;

export function getTargetWsScrcpyUrlForDevice(device: Device): string {
  return `ws://${device.adbHostname ?? getDefaultRedroidHostname(device.id)}:${SCRCPY_WS_PORT}`;
}

interface WaitForPidParams {
  tryCounter: number;
  processExited: boolean;
  lookPidFile: boolean;
}

class ScrcpyAdbDevice extends AdbDevice {
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
  const adbDevice = new ScrcpyAdbDevice(deviceInfo);
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
  const scrcpyServerPromise = adbDevice.runShellCommandAdbKit(RUN_COMMAND);
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
