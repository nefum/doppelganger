import type { Client } from "@devicefarmer/adbkit";
import adbKit from "@devicefarmer/adbkit";

interface CustomNodeJsGlobal {
  ___adb: Client;
}

declare const globalThis: CustomNodeJsGlobal & { [key: string]: any };

// @ts-expect-error -- this lib is so weird
const adb = globalThis.___adb || adbKit.createClient?.() || new adbKit.Client();

globalThis.___adb = adb;

export default adb;
