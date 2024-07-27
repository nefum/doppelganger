import {
  clientSideRedirectWithToast,
  encodeQueryParams,
  encodeToastParams,
} from "./toast-utils";

describe("toast-utils", () => {
  describe("encodeToastParams", () => {
    it("encodes both title and description when provided", () => {
      const params = {
        title: "Test Title",
        description: "Test Description",
      };
      const encoded = encodeToastParams(params);
      expect(encoded.encodedToastTitle).toEqual(
        encodeURIComponent("Test Title"),
      );
      expect(encoded.encodedToastDescription).toEqual(
        encodeURIComponent("Test Description"),
      );
    });

    it("encodes title only when description is not provided", () => {
      const params = { title: "Only Title" };
      const encoded = encodeToastParams(params);
      expect(encoded.encodedToastTitle).toEqual(
        encodeURIComponent("Only Title"),
      );
      expect(encoded.encodedToastDescription).toBeUndefined();
    });
  });

  describe("encodeQueryParams", () => {
    it("returns query string with both title and description when both are provided", () => {
      const encodedParams = {
        encodedToastTitle: encodeURIComponent("Title"),
        encodedToastDescription: encodeURIComponent("Description"),
      };
      const queryString = encodeQueryParams(encodedParams);
      expect(queryString).toEqual(
        `?toastTitle=${encodeURIComponent("Title")}&toastDescription=${encodeURIComponent("Description")}`,
      );
    });

    it("returns query string with title only when description is not provided", () => {
      const encodedParams = { encodedToastTitle: encodeURIComponent("Title") };
      const queryString = encodeQueryParams(encodedParams);
      expect(queryString).toEqual(`?toastTitle=${encodeURIComponent("Title")}`);
    });
  });

  describe("clientSideRedirectWithToast", () => {
    beforeEach(() => {
      // @ts-expect-error -- weird
      delete window.location;
      window.location = { href: "" } as any;
    });

    it("redirects with both title and description in the query params", () => {
      clientSideRedirectWithToast("/path", {
        title: "Title",
        description: "Description",
      });
      expect(window.location.href).toEqual(
        `/path?toastTitle=${encodeURIComponent("Title")}&toastDescription=${encodeURIComponent("Description")}`,
      );
    });

    it("redirects with only title in the query params when description is not provided", () => {
      clientSideRedirectWithToast("/path", {
        title: "Title",
      });
      expect(window.location.href).toEqual(
        `/path?toastTitle=${encodeURIComponent("Title")}`,
      );
    });
  });
});
