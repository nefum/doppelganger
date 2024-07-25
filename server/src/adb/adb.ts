import type { Client as ClientType } from "@devicefarmer/adbkit";
import adbKit from "@devicefarmer/adbkit";
// @ts-expect-error -- improperly exported
const { Client } = adbKit;

interface CustomNodeJsGlobal {
  ___adb: ClientType;
}

declare const globalThis: CustomNodeJsGlobal & { [key: string]: any };

const adb = globalThis.___adb || new Client();

globalThis.___adb = adb;

export default adb;
