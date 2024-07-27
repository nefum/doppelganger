import { BaseDeviceDescriptor } from "./BaseDeviceDescriptor";
import { NetInterface } from "./NetInterface";

export default interface GoogDeviceDescriptor extends BaseDeviceDescriptor {
  "ro.build.version.release": string;
  "ro.build.version.sdk": string;
  "ro.product.cpu.abi": string;
  "ro.product.manufacturer": string;
  "ro.product.model": string;
  "wifi.interface": string;
  interfaces: NetInterface[];
  pid: number;
  "last.update.timestamp": number;
}
