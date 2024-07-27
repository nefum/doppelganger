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
    // this is due to using a bash divsion operator in https://github.com/regulad/workspaces-images/blob/a079f3462d8741a0ea64a1b5af7899c02db0ae33/src/ubuntu/install/scrcpy/custom_startup.sh#L70
    // if a non-even value is used, bash will behave unpredictably
    allSampleDeviceSpecs.forEach((device) => {
      console.log(device);
      expect(device.width % 2).toBe(0);
      expect(device.height % 2).toBe(0);
    });
  });
});
