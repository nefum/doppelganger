"use client";

import { OneSignalHashReturn } from "@/app/api/onesignal/route.ts";
import { createClient } from "@/utils/supabase/client.ts";
import * as Sentry from "@sentry/nextjs";
import { User } from "@supabase/supabase-js";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import OneSignal from "react-onesignal";

const ONE_SIGNAL_PARAMS = {
  appId:
    process.env.NODE_ENV === "production"
      ? "5ac065a9-c76c-4c31-8159-85a260832ee6"
      : "912cb78a-0c27-4c77-ad56-c2f7f7f37313",
  safari_web_id:
    process.env.NODE_ENV === "production"
      ? "web.onesignal.auto.24c5a223-602c-4339-a230-554aefc554b5"
      : "web.onesignal.auto.26f438e4-4907-4b0f-9fba-4ab15d3b5c3b",
  notifyButton: {
    enable: false, // the default notification icon looks so scummy
  },
  allowLocalhostAsSecureOrigin: true,
};

const OneSignalContext = createContext<boolean>(false);

async function updateOneSignalUsingSupabase(user: User): Promise<void> {
  // although I have the code implemented to pass an HMAC on the server side, it can't be listened to on OneSignal's side because it is not yet working
  // therefore, the following notice still applies:
  // SECURITY NOTE: anybody can forge a request to OneSignal using an arbitrary User ID and receive their notifications
  // this pretty much makes Supabase User IDs a secret, which is weird. thanks onesignal!

  const hashResponse = await fetch("/api/onesignal");
  const hashJson = (await hashResponse.json()) as OneSignalHashReturn;

  await OneSignal.login(user.id, hashJson.externalIdHash); // must login before updating user data

  const { email, phone } = user;

  if (email) {
    // @ts-expect-error -- the version with the 2-argument signature is not in the types
    OneSignal.User.addEmail(email, hashJson.emailHash!);
  }

  if (phone) {
    // @ts-expect-error -- the version with the 2-argument signature is not in the types
    OneSignal.User.addSms(phone, hashJson.phoneHash!);
  }
}

export default function OneSignalProvider({
  children,
}: Readonly<{ children?: ReactNode }>) {
  const [oneSignalInitialized, setOneSignalInitialized] = useState(false);
  const supabaseClient = createClient(); // auto-singleton

  useEffect(() => {
    OneSignal.init(ONE_SIGNAL_PARAMS)
      .then(() => {
        setOneSignalInitialized(true);

        supabaseClient.auth.getUser().then(async ({ data: { user } }) => {
          if (user) {
            await updateOneSignalUsingSupabase(user);
          }
        });

        // making this async makes supabase methods unavailable until these calls are done, don't do that
        supabaseClient.auth.onAuthStateChange((event, session) => {
          if (event === "SIGNED_OUT") {
            OneSignal.logout().catch((error) => {
              Sentry.captureException(error);
              console.error("OneSignal logout failed:", error);
            });
            return;
          } else if (!(event === "SIGNED_IN" || event === "USER_UPDATED")) {
            return; // this event is irrelevant to push notifications
          }

          const user = session?.user;

          if (!user) {
            return;
          }

          updateOneSignalUsingSupabase(user).catch((error) => {
            Sentry.captureException(error);
            console.error("OneSignal update failed:", error);
          });
        });
      })
      .catch((error: any) => {
        if (error.message && error.message === "OneSignal is already initialized.") {
          return; // this failure is inconsequential
        }

        Sentry.captureException(error);
        console.error("OneSignal initialization failed:", error);
      });
  });

  return (
    <OneSignalContext.Provider value={oneSignalInitialized}>
      {children}
    </OneSignalContext.Provider>
  );
}

export function useIsOneSignalLoaded() {
  const context = useContext(OneSignalContext);
  if (context === undefined) {
    throw new Error(
      "useIsOneSignalLoaded must be used within a OneSignalProvider",
    );
  }
  return context;
}
