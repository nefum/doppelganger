import allSampleDeviceSpecs from "./device-specs";

describe("Device Specs Tests", () => {
  it("should have all required properties", () => {
    allSampleDeviceSpecs.forEach((device) => {
      expect(device).toHaveProperty("name");
      expect(device).toHaveProperty("width");
      expect(device).toHaveProperty("height");
      expect(device).toHaveProperty("dpi");
    });
  });

  it("width and height should be divisible by 2", () => {
    allSampleDeviceSpecs.forEach((device) => {
      console.log(device);
      expect(device.width % 2).toBe(0);
      expect(device.height % 2).toBe(0);
    });
  });
});
