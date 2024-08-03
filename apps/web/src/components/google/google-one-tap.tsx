"use client";

import { useSupabaseGoogleAnalytics } from "@/components/google/google-analytics-hook.ts";
import { useHashedNonce } from "@/components/google/hashed-nonce.ts";
import { createClient } from "@/utils/supabase/client.ts";
import Script from "next/script";
import { useEffect, useState } from "react";

function useIsSignedIn(): boolean | null {
  const supabaseClient = createClient();
  const [userIsSignedIn, setUserIsSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    supabaseClient.auth.getUser().then((user) => {
      setUserIsSignedIn(user.data?.user?.id !== undefined);
    });
  }, [supabaseClient]);

  return userIsSignedIn;
}

export default function GoogleOneTap() {
  useSupabaseGoogleAnalytics();
  const hashedNonce = useHashedNonce();
  const userIsSignedIn = useIsSignedIn();

  if (!hashedNonce) {
    return null;
  }

  if (userIsSignedIn ?? true) {
    return null;
  }

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="lazyOnload" // while afterInteractive would be more appropriate, the google one tap elements have to laod first. loading the nonce is pretty much instant, but since this script is so common and in the memory cache of chromium-based browser, this tends to be faster.
        async
      />
      <div
        id="g_id_onload"
        data-client_id="6822405828-jcheqartcigc09111gq22tb6oqnvsrpa.apps.googleusercontent.com"
        data-context="signin"
        data-ux_mode="popup"
        data-callback="handleSignInWithGoogle"
        data-auto_select="true"
        data-itp_support="true"
        data-use_fedcm_for_prompt="true" // chrome third party cookies phase-out requirement
        data-nonce={hashedNonce}
      />
    </>
  );
}
