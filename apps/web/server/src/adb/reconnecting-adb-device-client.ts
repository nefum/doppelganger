import {
  type Client,
  DeviceClient,
  type Features,
  type Forward,
  type FramebufferStreamWithMeta,
  type Reverse,
  type StartActivityOptions,
  type StartServiceOptions,
  type WithToString,
} from "@devicefarmer/adbkit";
import { Duplex, Readable } from "node:stream";

export const DEFAULT_ADB_TIMEOUT = 60_000; // 1 minute

/**
 * Extention of the ADB client that proves a connection before running commands.
 * Useful for the edge and resource-constricted envuronments.
 */
export default class ReconnectingAdbDeviceClient extends DeviceClient {
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
    return (await this.getState()) === "device";
  }

  /* overridden methods */

  // @ts-expect-error -- promise is assignable to bluebird promise
  async install(apk: string | Readable): Promise<boolean> {
    await this.connectRobust(this.timeout);
    return super.install(apk);
  }

  // @ts-expect-error -- promise is assignable to bluebird promise
  async uninstall(packageName: string): Promise<boolean> {
    await this.connectRobust(this.timeout);
    return super.uninstall(packageName);
  }

  // @ts-expect-error -- promise is assignable to bluebird promise
  async shell(command: string | ArrayLike<WithToString>): Promise<Duplex> {
    await this.connectRobust(this.timeout);
    return super.shell(command);
  }

  // @ts-expect-error -- promise is assignable to bluebird promise
  async isInstalled(packageName: string): Promise<boolean> {
    await this.connectRobust(this.timeout);
    return super.isInstalled(packageName);
  }

  // @ts-expect-error -- promise is assignable to bluebird promise
  async getProperties(): Promise<Record<string, string>> {
    await this.connectRobust(this.timeout);
    return super.getProperties();
  }

  // @ts-expect-error -- promise is assignable to bluebird promise
  async getFeatures(): Promise<Features> {
    await this.connectRobust(this.timeout);
    return super.getFeatures();
  }

  // @ts-expect-error -- promise is assignable to bluebird promise
  async getDHCPIpAddress(iface?: string): Promise<string> {
    await this.connectRobust(this.timeout);
    return super.getDHCPIpAddress(iface);
  }

  // @ts-expect-error -- promise is assignable to bluebird promise
  async forward(local: string, remote: string): Promise<boolean> {
    await this.connectRobust(this.timeout);
    return super.forward(local, remote);
  }

  // @ts-expect-error -- promise is assignable to bluebird promise
  async listForwards(): Promise<Forward[]> {
    await this.connectRobust(this.timeout);
    return super.listForwards();
  }

  // @ts-expect-error -- promise is assignable to bluebird promise
  async reverse(remote: string, local: string): Promise<boolean> {
    await this.connectRobust(this.timeout);
    return super.reverse(remote, local);
  }

  // @ts-expect-error -- promise is assignable to bluebird promise
  async listReverses(): Promise<Reverse[]> {
    await this.connectRobust(this.timeout);
    return super.listReverses();
  }

  // @ts-expect-error -- promise is assignable to bluebird promise
  async reboot(): Promise<boolean> {
    await this.connectRobust(this.timeout);
    return super.reboot();
  }

  // @ts-expect-error -- promise is assignable to bluebird promise
  async remount(): Promise<boolean> {
    await this.connectRobust(this.timeout);
    return super.remount();
  }

  // @ts-expect-error -- promise is assignable to bluebird promise
  async root(): Promise<boolean> {
    await this.connectRobust(this.timeout);
    return super.root();
  }

  // async trackJdwp(): Promise<JdwpTracker> {
  //   await this.connectRobust(this.timeout);
  //   return super.trackJdwp();
  // }

  // @ts-expect-error -- promise is assignable to bluebird promise
  async framebuffer(format?: string): Promise<FramebufferStreamWithMeta> {
    await this.connectRobust(this.timeout);
    return super.framebuffer(format);
  }

  // @ts-expect-error -- promise is assignable to bluebird promise
  async screencap(): Promise<Duplex> {
    await this.connectRobust(this.timeout);
    return super.screencap();
  }

  // @ts-expect-error -- promise is assignable to bluebird promise
  async openLocal(path: string): Promise<Duplex> {
    await this.connectRobust(this.timeout);
    return super.openLocal(path);
  }

  // @ts-expect-error -- promise is assignable to bluebird promise
  async openLog(name: string): Promise<Duplex> {
    await this.connectRobust(this.timeout);
    return super.openLog(name);
  }

  // @ts-expect-error -- promise is assignable to bluebird promise
  async openTcp(port: number): Promise<Duplex> {
    await this.connectRobust(this.timeout);
    return super.openTcp(port);
  }

  // @ts-expect-error -- promise is assignable to bluebird promise
  async openMonkey(port?: number): Promise<Duplex> {
    await this.connectRobust(this.timeout);
    return super.openMonkey(port);
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
  async clear(packageName: string): Promise<boolean> {
    await this.connectRobust(this.timeout);
    return super.clear(packageName);
  }

  // @ts-expect-error -- promise is assignable to bluebird promise
  async installRemote(packagePath: string): Promise<boolean> {
    await this.connectRobust(this.timeout);
    return super.installRemote(packagePath);
  }

  // @ts-expect-error -- promise is assignable to bluebird promise
  async startActivity(options: StartActivityOptions): Promise<boolean> {
    await this.connectRobust(this.timeout);
    return super.startActivity(options);
  }

  // @ts-expect-error -- promise is assignable to bluebird promise
  async startService(options: StartServiceOptions): Promise<boolean> {
    await this.connectRobust(this.timeout);
    return super.startService(options);
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
