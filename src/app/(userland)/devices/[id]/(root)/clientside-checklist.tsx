"use client";

import { Checkbox } from "@/components/ui/checkbox.tsx";
import useIsPWA from "@/utils/hooks/use-is-pwa.ts";

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
