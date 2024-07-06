"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server.ts";
import { z } from "zod";

const UsernamePasswordLoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export interface LoginFormState {
  errors?: {
    email?: string[];
    password?: string[];
  };
  message?: string | null;
}

const FIRST_PAGE_URL = "/devices";

// https://github.com/regular-solutions/socratic-showdown/blob/2561e93f1368661b7541175b9acacbb3581a4713/apps/web/src/app/(signin)/login/actions.ts
export async function login(
  previousState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const supabase = createClient();

  const validatedParsedFormData = UsernamePasswordLoginSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );

  if (!validatedParsedFormData.success) {
    return {
      errors: validatedParsedFormData.error.flatten().fieldErrors,
      message: "Failed to login. Check the form for errors.",
    };
  }

  const { email, password } = validatedParsedFormData.data;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      message: error.message,
    };
  }

  revalidatePath("/", "layout");
  redirect(FIRST_PAGE_URL);
}

const zodPassword = z
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

const UsernamePasswordSignupSchema = z.object({
  email: z.string().email(),
  password: zodPassword,
  password2: zodPassword,
  terms: z.coerce.boolean().refine((terms) => terms, {
    message: "You must agree to the terms and conditions.",
  }),
});

export interface SignupFormState {
  errors?: {
    email?: string[];
    password?: string[];
    password2?: string[];
    terms?: string[];
  };
  message?: string | null;
}

export async function signup(
  previousState: SignupFormState,
  formData: FormData,
): Promise<SignupFormState> {
  const supabase = createClient();

  const validatedParsedFormData = UsernamePasswordSignupSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );

  if (!validatedParsedFormData.success) {
    return {
      errors: validatedParsedFormData.error.flatten().fieldErrors,
      message: "Failed to sign up. Check the form for errors.",
    };
  }

  if (
    validatedParsedFormData.data.password !==
    validatedParsedFormData.data.password2
  ) {
    return {
      errors: {
        password2: ["Passwords do not match."],
      },
      message: "Failed to sign up. Check the form for errors.",
    };
  }

  const { email, password } = validatedParsedFormData.data;

  const { error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return {
      message: error.message,
    };
  }

  revalidatePath("/", "layout");
  redirect(FIRST_PAGE_URL);
}
