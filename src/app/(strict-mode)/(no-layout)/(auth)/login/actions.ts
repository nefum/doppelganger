"use server";

import { createClient } from "@/utils/supabase/server.ts";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { FIRST_PAGE_URL } from "@/app/(strict-mode)/(no-layout)/(auth)/constants.ts";

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
