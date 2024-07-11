import allSampleDeviceSpecsJson from "./device-specs.json";

export interface SampleDeviceSpecs {
  name: string;
  width: number;
  height: number;
  dpi: number;
}

const allSampleDeviceSpecs: SampleDeviceSpecs[] = allSampleDeviceSpecsJson;

export const defaultSampleDeviceSpecs =
  allSampleDeviceSpecs[allSampleDeviceSpecs.length - 1]; // most practical one last

export default allSampleDeviceSpecs;
