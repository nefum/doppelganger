import { createClient } from "@/utils/supabase/client.ts";
import { sendGAEvent } from "@next/third-parties/google";
import { User } from "@supabase/supabase-js";
import { useEffect } from "react";

export function useSupabaseGoogleAnalytics() {
  const supabaseClient = createClient();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const signInMethod = getSignInMethod(session.user);

        // Send user ID to Google Analytics
        sendGAEvent("set_user_id", {
          user_id: session.user.id,
        });

        // Log sign-in event with method
        sendGAEvent("login", {
          method: signInMethod,
        });
      } else if (event === "SIGNED_OUT") {
        // Clear user ID from Google Analytics
        sendGAEvent("set_user_id", {
          user_id: null,
        });

        // Log sign-out event
        sendGAEvent("logout", {
          method: "Supabase",
        });
      }
    });

    // Cleanup subscription on unmount
    return () => subscription.unsubscribe();
  }, [supabaseClient]);
}

function getSignInMethod(user: User) {
  if (user.app_metadata.provider) {
    // OAuth sign-in
    return user.app_metadata.provider;
  } else if (user.email) {
    // Email sign-in
    return "email";
  } else if (user.phone) {
    // Phone sign-in
    return "phone";
  } else {
    // Fallback for any other methods
    return "other";
  }
}
