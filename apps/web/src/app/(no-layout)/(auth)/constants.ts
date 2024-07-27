import { z } from "zod";

export const FIRST_PAGE_PATHNAME = "/devices";
export const zodPassword = z
  .string()
  .min(6)
  .max(100)
  .refine(
    (password) => {
      return (
        /[a-z]/.test(password) &&
        /[A-Z]/.test(password) &&
        /[0-9]/.test(password)
      );
    },
    {
      message:
        "Password must contain at least one lowercase letter, one uppercase letter, and one number.",
    },
  );
