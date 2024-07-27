import { BaseDeviceDescriptor } from "../../types/BaseDeviceDescriptor";
import { ParamsDeviceTracker } from "../../types/ParamsDeviceTracker";

type Entry = HTMLElement | DocumentFragment;

export interface Tool {
  createEntryForDeviceList(
    descriptor: BaseDeviceDescriptor,
    blockClass: string,
    params: ParamsDeviceTracker,
  ): Array<Entry | undefined> | Entry | undefined;
}
