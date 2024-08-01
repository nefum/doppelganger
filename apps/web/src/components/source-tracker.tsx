"use client";

import { sendGAEvent } from "@next/third-parties/google";
import { setCookie } from "cookies-next";
import { useEffect } from "react";

/**
 * Tracks the source of an engagement by adding the (source) query param to google analytics
 * and also setting a cookie so it can be recalled later by the stripe checkout session (measuring conversion rate)
 */
export default function SourceTracker() {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const source = urlParams.get("source");

    if (source) {
      // Send event to Google Analytics
      sendGAEvent("event", "source_tracking", { value: source });

      // Set cookie for later use (e.g., in Stripe checkout)
      setCookie("source", source, {
        maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
        path: "/",
      });
    }
  }, []);

  return null;
}
