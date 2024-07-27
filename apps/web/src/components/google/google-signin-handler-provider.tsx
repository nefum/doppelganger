"use client";

import { FIRST_PAGE_PATHNAME } from "@/app/(no-layout)/(auth)/constants.ts";
import { useNonce } from "@/components/google/nonce-provider.tsx";
import { useToast } from "@/components/ui/use-toast.ts";
import { createClient } from "@/utils/supabase/client.ts";
import { clientSideRedirectWithToast } from "@/utils/toast-utils.ts";
import { ReactNode, useEffect } from "react";

/**
 * https://developers.google.com/identity/gsi/web/reference/js-reference#CredentialResponse
 */
interface CredentialResponse {
  credential: string; // jwt
  select_by:
    | "auto"
    | "user"
    | "fedcm"
    | "fedcm_auto"
    | "user_1tap"
    | "user_2tap"
    | "btn"
    | "btn_confirm"
    | "btn_add_session"
    | "btn_confirm_add_session";
  state?: string;
}

interface AugmentedGlobalThis extends Window {
  handleSignInWithGoogle: (response: CredentialResponse) => void;
}

declare const window: AugmentedGlobalThis;

/**
 * Not a true provider. Provides a handler for Google Signin in the global scope for the Google One Tap API.
 * Must be the child of a NonceProvider.
 * See https://supabase.com/docs/guides/auth/social-login/auth-google?queryGroups=framework&framework=nextjs&queryGroups=environment&environment=client#google-pre-built:~:text=Create%20a%20handleSignInWithGoogle%20function%20that%20takes%20the%20CredentialResponse%20and%20passes%20the%20included%20token%20to%20Supabase.%20The%20function%20needs%20to%20be%20available%20in%20the%20global%20scope%20for%20Google%27s%20code%20to%20find%20it. for why this is required
 * @constructor
 */
export default function GoogleSigninHandlerProvider({
  children,
}: Readonly<{ children?: ReactNode }>): ReactNode {
  const nonce = useNonce();
  const { toast } = useToast();
  const supabaseClient = createClient();

  useEffect(() => {
    async function handleSignInWithGoogle(response: CredentialResponse) {
      const { data, error } = await supabaseClient.auth.signInWithIdToken({
        provider: "google",
        token: response.credential,
        nonce: nonce,
      });

      if (error) {
        console.error("Error signing in with Google", error);
        toast({
          title: "Error signing in with Google",
          description: error.message,
          variant: "destructive",
        });
      } else {
        console.log("Signed in with Google", data);
        clientSideRedirectWithToast(FIRST_PAGE_PATHNAME, {
          title: "Signed in with Google",
          description: "You are now signed in with Google.",
        });
      }
    }

    window.handleSignInWithGoogle = handleSignInWithGoogle;
  }, [nonce, supabaseClient, toast]);

  return <>{children}</>;
}
