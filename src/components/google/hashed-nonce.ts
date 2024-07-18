// https://supabase.com/docs/guides/auth/social-login/auth-google?queryGroups=framework&framework=nextjs&queryGroups=environment&environment=client#google-pre-built:~:text=You%20can%20get,1
import { useNonce } from "@/components/google/nonce-provider.tsx";
import { useEffect, useState } from "react";

async function getHashedNonce(nonce: string): Promise<string> {
  // Adapted from https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest#converting_a_digest_to_a_hex_string

  const encoder = new TextEncoder();
  const encodedNonce = encoder.encode(nonce);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encodedNonce);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  // Use 'hashedNonce' when making the authentication request to Google
  // Use 'nonce' when invoking the supabase.auth.signInWithIdToken() method

  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function useHashedNonce(): string | null {
  const nonce = useNonce();
  // https://supabase.com/docs/guides/auth/social-login/auth-google?queryGroups=framework&framework=nextjs&queryGroups=environment&environment=client#google-pre-built:~:text=You%20can%20get,1
  const [hashedNonce, setHashedNonce] = useState<string | null>(null);

  useEffect(() => {
    getHashedNonce(nonce).then(setHashedNonce);
  }, [nonce]);

  return hashedNonce;
}
