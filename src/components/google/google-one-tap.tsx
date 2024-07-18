"use client";

import { useHashedNonce } from "@/components/google/hashed-nonce.ts";
import { createClient } from "@/utils/supabase/client.ts";
import { useEffect, useMemo, useState } from "react";

function useIsSignedIn(): boolean | null {
  const supabaseClient = useMemo(() => createClient(), []);
  const [userIsSignedIn, setUserIsSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    supabaseClient.auth.getUser().then((user) => {
      setUserIsSignedIn(user.data?.user?.id !== undefined);
    });
  }, [supabaseClient]);

  return userIsSignedIn;
}

export default function GoogleOneTap() {
  const hashedNonce = useHashedNonce();
  const userIsSignedIn = useIsSignedIn();

  if (!hashedNonce) {
    return null;
  }

  if (userIsSignedIn ?? true) {
    return null;
  }

  return (
    <div
      id="g_id_onload"
      data-client_id="6822405828-jcheqartcigc09111gq22tb6oqnvsrpa.apps.googleusercontent.com"
      data-context="signin"
      data-ux_mode="popup"
      data-callback="handleSignInWithGoogle"
      data-auto_select="true"
      data-itp_support="true"
      data-use_fedcm_for_prompt="true"
      data-nonce={hashedNonce}
    />
  );
}
