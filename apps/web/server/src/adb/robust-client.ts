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

export const DEFAULT_ADB_TIMEOUT = 60_000; // 1 minute

type DeviceState = Device["type"];

/**
 * Extention of the ADB client that proves a connection before running commands.
 * Useful for the edge and resource-constricted envuronments.
 */
export default class RobustClient extends DeviceClient {
  private readonly timeout: number;

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

  async connectRobust(timeout?: number): Promise<void> {
    // keep trying to run connect until either the timeout is reached or the device is connected
    const startTime = Date.now();
    let connected = await this.getIsConnected();
    if (connected) return;

    while (true) {
      try {
        await this.doConnect();
        connected = await this.getIsConnected();
        if (connected) break;
      } catch (e: any) {
        // ignore and continue loop
      }
      if (timeout && Date.now() - startTime > timeout) {
        throw new Error("Timeout waiting for device to connect");
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

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

  /* overridden methods */

  // @ts-expect-error -- promise is assignable to bluebird promise
  install(apk: string | Readable): Promise<boolean> {
    return retry(async () => {
      await this.connectRobust(this.timeout);
      return super.install(apk);
    });
  }

  // @ts-expect-error -- promise is assignable to bluebird promise
  uninstall(packageName: string): Promise<boolean> {
    return retry(async () => {
      await this.connectRobust(this.timeout);
      return super.uninstall(packageName);
    });
  }

  // @ts-expect-error -- promise is assignable to bluebird promise
  shell(command: string | ArrayLike<WithToString>): Promise<Duplex> {
    return retry(async () => {
      await this.connectRobust(this.timeout);
      return super.shell(command);
    });
  }

  // @ts-expect-error -- promise is assignable to bluebird promise
  isInstalled(packageName: string): Promise<boolean> {
    return retry(async () => {
      await this.connectRobust(this.timeout);
      return super.isInstalled(packageName);
    });
  }

  // @ts-expect-error -- promise is assignable to bluebird promise
  getProperties(): Promise<Record<string, string>> {
    return retry(async () => {
      await this.connectRobust(this.timeout);
      return super.getProperties();
    });
  }

  // @ts-expect-error -- promise is assignable to bluebird promise
  getFeatures(): Promise<Features> {
    return retry(async () => {
      await this.connectRobust(this.timeout);
      return super.getFeatures();
    });
  }

  // @ts-expect-error -- promise is assignable to bluebird promise
  getDHCPIpAddress(iface?: string): Promise<string> {
    return retry(async () => {
      await this.connectRobust(this.timeout);
      return super.getDHCPIpAddress(iface);
    });
  }

  // @ts-expect-error -- promise is assignable to bluebird promise
  forward(local: string, remote: string): Promise<boolean> {
    return retry(async () => {
      await this.connectRobust(this.timeout);
      return super.forward(local, remote);
    });
  }

  // @ts-expect-error -- promise is assignable to bluebird promise
  listForwards(): Promise<Forward[]> {
    return retry(async () => {
      await this.connectRobust(this.timeout);
      return super.listForwards();
    });
  }

  // @ts-expect-error -- promise is assignable to bluebird promise
  reverse(remote: string, local: string): Promise<boolean> {
    return retry(async () => {
      await this.connectRobust(this.timeout);
      return super.reverse(remote, local);
    });
  }

  // @ts-expect-error -- promise is assignable to bluebird promise
  listReverses(): Promise<Reverse[]> {
    return retry(async () => {
      await this.connectRobust(this.timeout);
      return super.listReverses();
    });
  }

  // @ts-expect-error -- promise is assignable to bluebird promise
  reboot(): Promise<boolean> {
    return retry(async () => {
      await this.connectRobust(this.timeout);
      return super.reboot();
    });
  }

  // @ts-expect-error -- promise is assignable to bluebird promise
  remount(): Promise<boolean> {
    return retry(async () => {
      await this.connectRobust(this.timeout);
      return super.remount();
    });
  }

  // @ts-expect-error -- promise is assignable to bluebird promise
  root(): Promise<boolean> {
    return retry(async () => {
      await this.connectRobust(this.timeout);
      return super.root();
    });
  }

  // async trackJdwp(): Promise<JdwpTracker> {
  //   await this.connectRobust(this.timeout);
  //   return super.trackJdwp();
  // }

  // @ts-expect-error -- promise is assignable to bluebird promise
  framebuffer(format?: string): Promise<FramebufferStreamWithMeta> {
    return retry(async () => {
      await this.connectRobust(this.timeout);
      return super.framebuffer(format);
    });
  }

  // @ts-expect-error -- promise is assignable to bluebird promise
  screencap(): Promise<Duplex> {
    return retry(async () => {
      await this.connectRobust(this.timeout);
      return super.screencap();
    });
  }

  // @ts-expect-error -- promise is assignable to bluebird promise
  openLocal(path: string): Promise<Duplex> {
    return retry(async () => {
      await this.connectRobust(this.timeout);
      return super.openLocal(path);
    });
  }

  // @ts-expect-error -- promise is assignable to bluebird promise
  openLog(name: string): Promise<Duplex> {
    return retry(async () => {
      await this.connectRobust(this.timeout);
      return super.openLog(name);
    });
  }

  // @ts-expect-error -- promise is assignable to bluebird promise
  openTcp(port: number): Promise<Duplex> {
    return retry(async () => {
      await this.connectRobust(this.timeout);
      return super.openTcp(port);
    });
  }

  // @ts-expect-error -- promise is assignable to bluebird promise
  openMonkey(port?: number): Promise<Duplex> {
    return retry(async () => {
      await this.connectRobust(this.timeout);
      return super.openMonkey(port);
    });
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
    return retry(async () => {
      await this.connectRobust(this.timeout);
      return super.clear(packageName);
    });
  }

  // @ts-expect-error -- promise is assignable to bluebird promise
  installRemote(packagePath: string): Promise<boolean> {
    return retry(async () => {
      await this.connectRobust(this.timeout);
      return super.installRemote(packagePath);
    });
  }

  // @ts-expect-error -- promise is assignable to bluebird promise
  startActivity(options: StartActivityOptions): Promise<boolean> {
    return retry(async () => {
      await this.connectRobust(this.timeout);
      return super.startActivity(options);
    });
  }

  // @ts-expect-error -- promise is assignable to bluebird promise
  startService(options: StartServiceOptions): Promise<boolean> {
    return retry(async () => {
      await this.connectRobust(this.timeout);
      return super.startService(options);
    });
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
