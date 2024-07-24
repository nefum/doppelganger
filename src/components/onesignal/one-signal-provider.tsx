"use client";

import * as Sentry from "@sentry/nextjs";
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

export default function OneSignalProvider({
  children,
}: Readonly<{ children?: ReactNode }>) {
  const [oneSignalInitialized, setOneSignalInitialized] = useState(false);

  useEffect(() => {
    OneSignal.init(ONE_SIGNAL_PARAMS)
      .then(() => setOneSignalInitialized(true))
      .catch((error) => {
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
