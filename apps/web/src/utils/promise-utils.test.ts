import { sleep } from "./promise-utils";

describe("promise-utils", () => {
  describe("sleep", () => {
    it("resolves after the specified time", async () => {
      const start = Date.now();
      await sleep(100);
      const end = Date.now();
      expect(end - start).toBeGreaterThanOrEqual(100);
    });

    it("resolves immediately for zero milliseconds", async () => {
      const start = Date.now();
      await sleep(0);
      const end = Date.now();
      expect(end - start).toBeLessThan(10);
    });

    it("handles large sleep durations", async () => {
      const start = Date.now();
      await sleep(2000);
      const end = Date.now();
      expect(end - start).toBeGreaterThanOrEqual(2000);
    });
  });
});
