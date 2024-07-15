import { toTitleCase } from "./misc";

describe("misc utilities", () => {
  describe("toTitleCase", () => {
    it("converts single word to title case", () => {
      expect(toTitleCase("hello")).toEqual("Hello");
    });

    it("converts multiple words to title case", () => {
      expect(toTitleCase("hello world")).toEqual("Hello World");
    });

    it("handles mixed case input correctly", () => {
      expect(toTitleCase("hElLo WoRlD")).toEqual("Hello World");
    });

    it("preserves spaces between words", () => {
      expect(toTitleCase("  hello   world  ")).toEqual("  Hello   World  ");
    });

    it("handles empty string input", () => {
      expect(toTitleCase("")).toEqual("");
    });

    it("processes strings with only spaces correctly", () => {
      expect(toTitleCase("   ")).toEqual("   ");
    });

    it("keeps punctuation intact", () => {
      expect(toTitleCase("hello, world!")).toEqual("Hello, World!");
    });
  });
});
