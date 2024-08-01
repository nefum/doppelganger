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
import { retry } from "@lifeomic/attempt";
import { Duplex, Readable } from "node:stream";

export const DEFAULT_ADB_TIMEOUT = 2 * 60 * 1_000;

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

  // @ts-expect-error -- promise is assignable to bluebird promise
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

  // @ts-expect-error -- promise is assignable to bluebird promise
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

  // @ts-expect-error -- promise is assignable to bluebird promise
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

  // @ts-expect-error -- promise is assignable to bluebird promise
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

  // @ts-expect-error -- promise is assignable to bluebird promise
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

  // @ts-expect-error -- promise is assignable to bluebird promise
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

  // @ts-expect-error -- promise is assignable to bluebird promise
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

  // @ts-expect-error -- promise is assignable to bluebird promise
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

  // @ts-expect-error -- promise is assignable to bluebird promise
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

  // @ts-expect-error -- promise is assignable to bluebird promise
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

  // @ts-expect-error -- promise is assignable to bluebird promise
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

  // @ts-expect-error -- promise is assignable to bluebird promise
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

  // @ts-expect-error -- promise is assignable to bluebird promise
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

  // @ts-expect-error -- promise is assignable to bluebird promise
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

  // async trackJdwp(): Promise<JdwpTracker> {
  //   await this.connectRobust(this.timeout);
  //   return super.trackJdwp();
  // }

  // @ts-expect-error -- promise is assignable to bluebird promise
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

  // @ts-expect-error -- promise is assignable to bluebird promise
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

  // @ts-expect-error -- promise is assignable to bluebird promise
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

  // @ts-expect-error -- promise is assignable to bluebird promise
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

  // @ts-expect-error -- promise is assignable to bluebird promise
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

  // @ts-expect-error -- promise is assignable to bluebird promise
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

  // async openLogcat(options?: {
  //   clear?: boolean;
  // }): Promise<Logcat> {
  //   await this.connectRobust(this.timeout);
  //   return super.openLogcat(options);
  // }

  // async openProcStat(): Promise<ProcStat> {
  //   await this.connectRobust(this.timeout);
  //   return super.openProcStat();
  // }

  // @ts-expect-error -- promise is assignable to bluebird promise
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

  // @ts-expect-error -- promise is assignable to bluebird promise
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

  // @ts-expect-error -- promise is assignable to bluebird promise
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

  // @ts-expect-error -- promise is assignable to bluebird promise
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

  // async syncService(): Promise<Sync> {
  //   await this.connectRobust(this.timeout);
  //   return super.syncService();
  // }

  // async stat(path: string): Promise<Stats> {
  //   await this.connectRobust(this.timeout);
  //   return super.stat(path);
  // }

  // async readdir(path: string): Promise<Entry[]> {
  //   await this.connectRobust(this.timeout);
  //   return super.readdir(path);
  // }

  // async pull(path: string): Promise<PullTransfer> {
  //   await this.connectRobust(this.timeout);
  //   return super.pull(path);
  // }

  // no tcpip or usb
}
