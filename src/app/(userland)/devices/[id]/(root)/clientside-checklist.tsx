"use client";

import { useIsOneSignalLoaded } from "@/components/onesignal/one-signal-provider.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import useIsPWA from "@/utils/hooks/use-is-pwa.ts";
import { useEffect, useState } from "react";
import OneSignal from "react-onesignal";

export function ClientSideIsPwaChecklistItem() {
  const isPwa = useIsPWA();

  return (
    <div className="flex items-center space-x-2">
      <Checkbox id="install-pwa" disabled checked={isPwa} />
      <label htmlFor="install-pwa">
        Install Doppelganger as a PWA
        <small className="shadcn-muted block">
          {!isPwa
            ? "Doppelganger supports installation as a PWA to provide a rich integration with your device. " +
              "You can install it by clicking the install button in the address bar, or by clicking share and then add to home screen in iOS."
            : "Doppelganger is running inside of a PWA! When loading a device from the dashboard, " +
              "the device will be loaded completely full-screen. To leave this mode, you will need to restart the PWA."}
        </small>
      </label>
    </div>
  );
}

export function ClientSideIsSignedUpForNotificationsChecklistItem() {
  const [hasPermission, setHasPermission] = useState(false);
  const oneSignalLoaded = useIsOneSignalLoaded();

  useEffect(() => {
    if (!oneSignalLoaded) return;
    setHasPermission(OneSignal.Notifications.permission);
  }, [oneSignalLoaded]);

  return (
    <div className="flex items-center space-x-2">
      <Checkbox id="notifications" disabled checked={hasPermission} />
      <label htmlFor="notifications">
        Sign up for notifications
        <small className="shadcn-muted block">
          {!hasPermission ? (
            <>
              You can receive the notifications that are sent to your
              Doppelganger device.{" "}
              <a
                className="shadcn-link"
                href="https://www.xda-developers.com/how-enable-safari-notifications-iphone/"
              >
                If you are on iOS, follow this guide before clicking below.
              </a>{" "}
              If you are not on iOS, no additional configuration is required.
              <button
                className="shadcn-link"
                onClick={async () => {
                  await OneSignal.Notifications.requestPermission();
                  setHasPermission(OneSignal.Notifications.permission);
                }}
              >
                Once you are ready, click here to enable notifications.
              </button>
            </>
          ) : (
            "You are signed up to receive notifications from Doppelganger! " +
            "You can manage your notification preferences in your browser settings."
          )}
        </small>
      </label>
    </div>
  );
}
