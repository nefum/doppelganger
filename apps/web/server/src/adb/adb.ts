import type {
  Client as ClientType,
  DeviceClient as DeviceClientType,
} from "@devicefarmer/adbkit"; // broken ESM mixed with CJS, we can only do the single import
import adbKit from "@devicefarmer/adbkit";

interface AugmentedGlobal {
  ___adbClient: ClientType;
}

declare const globalThis: AugmentedGlobal;

function createNewAdbClient(): ClientType {
  // @ts-expect-error -- this lib is so weird
  return adbKit.createClient?.() || new adbKit.Client();
}

export function createAdbClient(): ClientType {
  if (globalThis.___adbClient) {
    return globalThis.___adbClient;
  }

  globalThis.___adbClient = createNewAdbClient();
  return globalThis.___adbClient;
}

// because of the broken exports we can't trust any other way of getting these objects (esm imports)
// @ts-expect-error -- is a type
export const Client: typeof ClientType = createAdbClient()
  .constructor as unknown as ClientType;
// @ts-expect-error -- is a type
export const DeviceClient: typeof DeviceClientType =
  createAdbClient().getDevice("dummy:5555")
    .constructor as unknown as DeviceClientType;
