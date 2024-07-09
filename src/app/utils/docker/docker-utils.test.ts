import { getlatestDigest } from "./docker-utils";

describe("getDigestOfLatestImage Integration Test", () => {
  it("should fetch digest for a real image name without a tag", async () => {
    const digest = await getlatestDigest("homeassistant/amd64-addon-mosquitto");
    expect(digest).toBeDefined();
    console.log(digest);
  });

  it("should fetch digest for a real image name with a tag", async () => {
    const digest = await getlatestDigest(
      "homeassistant/amd64-addon-mosquitto:6.4.1",
    );
    expect(digest).toBeDefined();
    console.log(digest);
  });

  it("should fetch digest for a real image from the library", async () => {
    const digest = await getlatestDigest("ubuntu");
    expect(digest).toBeDefined();
    console.log(digest);
  });
});
