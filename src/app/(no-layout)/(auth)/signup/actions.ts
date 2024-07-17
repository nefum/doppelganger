"use server";

import {
  FIRST_PAGE_PATHNAME,
  zodPassword,
} from "@/app/(no-layout)/(auth)/constants.ts";
import { createClient } from "@/utils/supabase/server.ts";
import { encodeQueryParams, encodeToastParams } from "@/utils/toast-utils.ts";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

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
  redirect(
    `${FIRST_PAGE_PATHNAME}${encodeQueryParams(
      encodeToastParams({
        toastTitle: "Signup Successful",
        toastDescription: "Please check your email to confirm your account.",
      }),
    )}`,
  );
}
