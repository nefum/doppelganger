"use client";

import { useHashedNonce } from "@/components/google/hashed-nonce.ts";
import { RangeType } from "@/utils/types/range-type.ts";
import { useEffect, useRef, useState } from "react";

type GoogleSignInTextType = "signin_with" | "signup_with";

export function SigninWithGoogleButton({
  text = "signin_with",
  width = 300,
}: Readonly<{ text?: GoogleSignInTextType; width: RangeType<40, 400> }>) {
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
      data-text={text}
      data-size="large"
      data-logo_alignment="left"
      data-width={`${width}`} // needs to be a string
      data-use_fedcm_for_prompt="true"
      data-nonce={nonce}
    />
  );
}

export function DynamicSignInWithGoogleButton({
  text = "signin_with",
}: Readonly<{ text?: GoogleSignInTextType }>) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<RangeType<40, 400> | undefined>(undefined);

  useEffect(() => {
    function updateWidth() {
      if (parentRef.current) {
        const parentWidth = parentRef.current.offsetWidth;
        const adjustedWidth = Math.max(
          40,
          Math.min(400, parentWidth),
        ) as RangeType<40, 400>;
        setWidth(adjustedWidth);
      }
    }

    updateWidth();
    window.addEventListener("resize", updateWidth);

    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  return (
    <div ref={parentRef} className={"h-full flex place-items-center"}>
      {width && <SigninWithGoogleButton text={text} width={width} />}
    </div>
  );
}
