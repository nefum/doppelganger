import { DeviceClient } from "%/adb/adb.ts";
import { resolveOrDefaultValue } from "%/utils/promise-utils.ts";
import {
  type Client,
  type Device,
  type Features,
  type Forward,
  type FramebufferStreamWithMeta,
  type Reverse,
  type StartActivityOptions,
  type StartServiceOptions,
  type WithToString,
} from "@devicefarmer/adbkit";
/* illegal imports */
import type Logcat from "@devicefarmer/adbkit-logcat";
import type JdwpTracker from "@devicefarmer/adbkit/dist/src/adb/jdwptracker";
import type ProcStat from "@devicefarmer/adbkit/dist/src/adb/proc/stat";
import type Sync from "@devicefarmer/adbkit/dist/src/adb/sync";
import type Entry from "@devicefarmer/adbkit/dist/src/adb/sync/entry";
import type PullTransfer from "@devicefarmer/adbkit/dist/src/adb/sync/pulltransfer";
import type Stats from "@devicefarmer/adbkit/dist/src/adb/sync/stats";
/* end illegal imports */
import { retry } from "@lifeomic/attempt";
import { Duplex, Readable } from "node:stream";

export const DEFAULT_ADB_TIMEOUT = 5 * 60 * 1_000; // so much time 🔥

type DeviceState = Device["type"];

/**
 * Extention of the ADB client that proves a connection before running commands.
 * Useful for the edge and resource-constricted envuronments.
 */
export default class RobustClient extends DeviceClient {
  readonly timeout: number;

  constructor(
    client: Client,
    serial: string,
    timeout: number = DEFAULT_ADB_TIMEOUT,
  ) {
    super(client, serial);
    this.timeout = timeout;
  }

  async doConnect(): Promise<void> {
    // only works with tcp hosts
    const [host, port] = this.serial.split(":");
    await this.client.connect(host, parseInt(port, 10));
  }

  async connectRobust(): Promise<void> {
    // keep trying to run connect until either the timeout is reached or the device is connected
    const startTime = Date.now();
    let connected = await this.getIsConnected();
    if (connected) return;

    await retry(
      async () => {
        await this.doConnect();
        connected = await this.getIsConnected();
        if (!connected) {
          throw new Error(`Device is not connected`);
        }
      },
      {
        timeout: this.timeout,
      },
    );

    await this.waitForDevice();
    await this.waitBootComplete();
  }

  async getIsConnected(): Promise<boolean> {
    const state = (await resolveOrDefaultValue(
      this.getState(),
      "offline",
      false,
    )) as DeviceState; // this throws if we are offline
    return state === "device" || state === "emulator";
  }

  /**
   * Get the state (moreso type) of the device after it has been connected
   */
  getStateRuntime(): Promise<"device" | "emulator"> {
    return retry(
      async () => {
        await this.connectRobust();
        const maybeState = await this.getState();
        if (maybeState === "device" || maybeState === "emulator") {
          return maybeState;
        }
        throw new Error(
          `Device is not in a connected state, expected device or emulator but got ${maybeState}`,
        );
      },
      {
        timeout: this.timeout,
      },
    );
  }

  /* overridden methods */

  // we can't define getState because it would cause a recursive call

  install(apk: string | Readable): Promise<boolean> {
    return retry(
      async () => {
        await this.connectRobust();
        return super.install(apk);
      },
      {
        timeout: this.timeout,
      },
    );
  }

  uninstall(packageName: string): Promise<boolean> {
    return retry(
      async () => {
        await this.connectRobust();
        return super.uninstall(packageName);
      },
      {
        timeout: this.timeout,
      },
    );
  }

  shell(command: string | ArrayLike<WithToString>): Promise<Duplex> {
    return retry(
      async () => {
        await this.connectRobust();
        return super.shell(command);
      },
      {
        timeout: this.timeout,
      },
    );
  }

  isInstalled(packageName: string): Promise<boolean> {
    return retry(
      async () => {
        await this.connectRobust();
        return super.isInstalled(packageName);
      },
      {
        timeout: this.timeout,
      },
    );
  }

  getProperties(): Promise<Record<string, string>> {
    return retry(
      async () => {
        await this.connectRobust();
        return super.getProperties();
      },
      {
        timeout: this.timeout,
      },
    );
  }

  getFeatures(): Promise<Features> {
    return retry(
      async () => {
        await this.connectRobust();
        return super.getFeatures();
      },
      {
        timeout: this.timeout,
      },
    );
  }

  getDHCPIpAddress(iface?: string): Promise<string> {
    return retry(
      async () => {
        await this.connectRobust();
        return super.getDHCPIpAddress(iface);
      },
      {
        timeout: this.timeout,
      },
    );
  }

  forward(local: string, remote: string): Promise<boolean> {
    return retry(
      async () => {
        await this.connectRobust();
        return super.forward(local, remote);
      },
      {
        timeout: this.timeout,
      },
    );
  }

  listForwards(): Promise<Forward[]> {
    return retry(
      async () => {
        await this.connectRobust();
        return super.listForwards();
      },
      {
        timeout: this.timeout,
      },
    );
  }

  reverse(remote: string, local: string): Promise<boolean> {
    return retry(
      async () => {
        await this.connectRobust();
        return super.reverse(remote, local);
      },
      {
        timeout: this.timeout,
      },
    );
  }

  listReverses(): Promise<Reverse[]> {
    return retry(
      async () => {
        await this.connectRobust();
        return super.listReverses();
      },
      {
        timeout: this.timeout,
      },
    );
  }

  reboot(): Promise<boolean> {
    return retry(
      async () => {
        await this.connectRobust();
        return super.reboot();
      },
      {
        timeout: this.timeout,
      },
    );
  }

  remount(): Promise<boolean> {
    return retry(
      async () => {
        await this.connectRobust();
        return super.remount();
      },
      {
        timeout: this.timeout,
      },
    );
  }

  root(): Promise<boolean> {
    return retry(
      async () => {
        await this.connectRobust();
        return super.root();
      },
      {
        timeout: this.timeout,
      },
    );
  }

  trackJdwp(): Promise<JdwpTracker> {
    return retry(
      async () => {
        await this.connectRobust();
        return super.trackJdwp();
      },
      {
        timeout: this.timeout,
      },
    );
  }

  framebuffer(format?: string): Promise<FramebufferStreamWithMeta> {
    return retry(
      async () => {
        await this.connectRobust();
        return super.framebuffer(format);
      },
      {
        timeout: this.timeout,
      },
    );
  }

  screencap(): Promise<Duplex> {
    return retry(
      async () => {
        await this.connectRobust();
        return super.screencap();
      },
      {
        timeout: this.timeout,
      },
    );
  }

  openLocal(path: string): Promise<Duplex> {
    return retry(
      async () => {
        await this.connectRobust();
        return super.openLocal(path);
      },
      {
        timeout: this.timeout,
      },
    );
  }

  openLog(name: string): Promise<Duplex> {
    return retry(
      async () => {
        await this.connectRobust();
        return super.openLog(name);
      },
      {
        timeout: this.timeout,
      },
    );
  }

  openTcp(port: number): Promise<Duplex> {
    return retry(
      async () => {
        await this.connectRobust();
        return super.openTcp(port);
      },
      {
        timeout: this.timeout,
      },
    );
  }

  openMonkey(port?: number): Promise<Duplex> {
    return retry(
      async () => {
        await this.connectRobust();
        return super.openMonkey(port);
      },
      {
        timeout: this.timeout,
      },
    );
  }

  openLogcat(options?: { clear?: boolean }): Promise<Logcat> {
    return retry(
      async () => {
        await this.connectRobust();
        return super.openLogcat(options);
      },
      {
        timeout: this.timeout,
      },
    );
  }

  openProcStat(): Promise<ProcStat> {
    return retry(
      async () => {
        await this.connectRobust();
        return super.openProcStat();
      },
      {
        timeout: this.timeout,
      },
    );
  }

  clear(packageName: string): Promise<boolean> {
    return retry(
      async () => {
        await this.connectRobust();
        return super.clear(packageName);
      },
      {
        timeout: this.timeout,
      },
    );
  }

  installRemote(packagePath: string): Promise<boolean> {
    return retry(
      async () => {
        await this.connectRobust();
        return super.installRemote(packagePath);
      },
      {
        timeout: this.timeout,
      },
    );
  }

  startActivity(options: StartActivityOptions): Promise<boolean> {
    return retry(
      async () => {
        await this.connectRobust();
        return super.startActivity(options);
      },
      {
        timeout: this.timeout,
      },
    );
  }

  startService(options: StartServiceOptions): Promise<boolean> {
    return retry(
      async () => {
        await this.connectRobust();
        return super.startService(options);
      },
      {
        timeout: this.timeout,
      },
    );
  }

  syncService(): Promise<Sync> {
    return retry(
      async () => {
        await this.connectRobust();
        return super.syncService();
      },
      {
        timeout: this.timeout,
      },
    );
  }

  stat(path: string): Promise<Stats> {
    return retry(
      async () => {
        await this.connectRobust();
        return super.stat(path);
      },
      {
        timeout: this.timeout,
      },
    );
  }

  readdir(path: string): Promise<Entry[]> {
    return retry(
      async () => {
        await this.connectRobust();
        return super.readdir(path);
      },
      {
        timeout: this.timeout,
      },
    );
  }

  pull(path: string): Promise<PullTransfer> {
    return retry(
      async () => {
        await this.connectRobust();
        return super.pull(path);
      },
      {
        timeout: this.timeout,
      },
    );
  }
}
