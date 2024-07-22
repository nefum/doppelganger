import allRedroidImages from "./redroid-images.ts";

describe("Redroid Images Tests", () => {
  // Existing test...
  it("usable images should have androidSdkVersion >= 29", () => {
    allRedroidImages.forEach((image) => {
      if (image.usable) {
        expect(image.androidSdkVersion).toBeGreaterThanOrEqual(29);
      }
    });
  });

  // Test for Validity of All Images
  it("all images should have valid properties", () => {
    allRedroidImages.forEach((image) => {
      expect(image).toHaveProperty("name");
      expect(image).toHaveProperty("description");
      expect(image).toHaveProperty("imageName");
      expect(image).toHaveProperty("usable");
      expect(image).toHaveProperty("premium");
      expect(image).toHaveProperty("gms");
      expect(image).toHaveProperty("androidSdkVersion");
    });
  });

  // Test for At Least One Usable Free Image
  it("there should be at least one usable free image", () => {
    const usableFreeImage = allRedroidImages.some(
      (image) => image.usable && !image.premium,
    );
    expect(usableFreeImage).toBe(true);
  });

  it("should not contain usable images that are either older than Android 10 (api 29) or exactly Android 11 (api 30)", () => {
    // requirement for sound copying: https://github.com/Genymobile/scrcpy/blob/master/doc/audio.md
    allRedroidImages.forEach((image) => {
      if (image.usable) {
        expect(image.androidSdkVersion).toBeGreaterThanOrEqual(29);
        expect(image.androidSdkVersion).not.toBe(30);
      }
    });
  });
});
