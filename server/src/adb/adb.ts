import { Client } from "@devicefarmer/adbkit";

interface CustomNodeJsGlobal {
  ___adb: Client;
}

declare const globalThis: CustomNodeJsGlobal & { [key: string]: any };

const adb = globalThis.___adb || new Client();

globalThis.___adb = adb;

export default adb;
