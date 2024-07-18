"use client";

import { BASE_ORIGIN } from "@/app/constants.ts";
import { useHashedNonce } from "@/components/google/hashed-nonce.ts";

export default function GoogleOneTap() {
  const hashedNonce = useHashedNonce();

  if (!hashedNonce) {
    return null;
  }

  return (
    <div
      id="g_id_onload"
      data-client_id="6822405828-jcheqartcigc09111gq22tb6oqnvsrpa.apps.googleusercontent.com"
      data-context="signin"
      data-login_uri={`${BASE_ORIGIN}/auth/confirm`}
      data-auto_select="true"
      data-itp_support="true"
      data-use_fedcm_for_prompt="true"
      data-nonce={hashedNonce}
    />
  );
}
