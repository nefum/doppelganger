import { useHashedNonce } from "@/components/google/hashed-nonce.ts";

export default function SigninWithGoogleButton() {
  const nonce = useHashedNonce();

  if (!nonce) {
    return null;
  }

  return (
    <div
      className="g_id_signin"
      data-type="standard"
      data-shape="rectangular"
      data-theme="filled_black"
      data-text="signup_with"
      data-size="large"
      data-logo_alignment="left"
      data-width="300"
      data-nonce={nonce}
    />
  );
}
