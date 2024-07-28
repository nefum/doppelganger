"use server";

// DeviceChecklist Components
import { AdbDevice } from "%/adb/adb-device.ts";
import { getIsSetupComplete } from "%/adb/initial-setup.ts";
import { getDeviceForId } from "%/device-info/device-info.ts";
import { getRedroidImage } from "%/device-info/redroid-images.ts";
import {
  ClientSideIsPwaChecklistItem,
  ClientSideIsSignedUpForNotificationsChecklistItem,
} from "@/app/(userland)/devices/[id]/(root)/clientside-checklist.tsx";
import { DeviceChecklistItemSkeleton } from "@/app/(userland)/devices/[id]/(root)/skeletons.tsx";
import NotFound from "@/app/not-found.tsx";
import CopyButton from "@/components/copy-button.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { Input } from "@/components/ui/input.tsx";
import { createClient } from "@/utils/supabase/server.ts";
import { Device } from "@prisma/client";
import * as Sentry from "@sentry/nextjs";
import { Suspense } from "react";

function SetupCompleteChecklistItem() {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox id="create-device" disabled checked />
      <label htmlFor="create-device">
        Create your device
        <small className="shadcn-muted block">
          Congratulations! You&apos;ve already created your device. The hardest
          part is done, now let&apos;s finish the setup.
        </small>
      </label>
    </div>
  );
}

async function GMSChecklistItem({
  adbDevice,
}: Readonly<{ adbDevice: AdbDevice }>) {
  let gmsId: string | null;

  try {
    gmsId = (await adbDevice.getGoogleServicesFrameworkID()).toString(10);
  } catch (e: any) {
    console.error("Failed to get GMS ID", e);
    Sentry.captureException(e);
    gmsId = null;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="connect-google-services"
          disabled
          checked={"indeterminate"}
        />
        <label htmlFor="connect-google-services">
          Connect Google Services
          <small className="shadcn-muted block">
            Your device supports the Google Play Store, but you need to complete
            a little more setup before it can be used. You must copy the code
            below and paste it into into the Google device registration portal.{" "}
            <a
              href="https://www.google.com/android/uncertified/"
              className="shadcn-link"
            >
              Click this link to jump to the portal.
            </a>{" "}
            After you have submitted the code, stop and then start your device
            using the buttons above. When the device comes back up, you will be
            able to sign into your Google account!
          </small>
        </label>
      </div>
      <div className={"inline-flex"}>
        <Input
          value={gmsId || "Refresh to get GMS ID"}
          disabled
          className="ml-6 w-48"
        />
        {gmsId && (
          <div className={"ml-2"}>
            <CopyButton value={String(gmsId)} className={"h-5 w-5"} />
          </div>
        )}
      </div>
    </div>
  );
}

async function DeferredSetupCompleteChecklistItem({
  device,
}: {
  device: Device;
}) {
  const deferredSetupComplete = await getIsSetupComplete(device);

  return (
    <div className="flex items-center space-x-2">
      <Checkbox id="create-device" disabled checked={deferredSetupComplete} />
      <label htmlFor="create-device">
        Wait for deferred setup tasks to complete
        <small className="shadcn-muted block">
          {deferredSetupComplete
            ? "The device setup tasks have completed. You can now use your device with all features!"
            : "Doppelganger needs to setup your device a little bit more in the background. This should only take a few minutes."}
        </small>
      </label>
    </div>
  );
}

export async function DeviceChecklist({
  deviceId,
}: Readonly<{ deviceId: string }>) {
  // the layout never helped us
  const device = await getDeviceForId(deviceId);
  if (!device) {
    return <NotFound />;
  }
  const supabaseClient = createClient();
  const {
    data: { user },
  } = await supabaseClient.auth.getUser();
  if (!user || device.ownerId !== user.id) {
    return <NotFound />;
  }

  const redroidImage = getRedroidImage(device.redroidImage)!; // can't be null if it was deployed
  const adbDevice = new AdbDevice(device);

  const deviceHasGms = redroidImage.gms;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Device Setup Checklist</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription>
          Although you can jump into your device right away, you may find some
          features like screenshots, notifications, and Google services are not
          yet set up. Following this checklist will get you ready-to-go as soon
          as possible.
        </CardDescription>
        <div className="space-y-4 mt-4">
          <SetupCompleteChecklistItem />
          <Suspense fallback={<DeviceChecklistItemSkeleton />}>
            <DeferredSetupCompleteChecklistItem device={device} />
          </Suspense>
          {deviceHasGms && (
            <Suspense fallback={<DeviceChecklistItemSkeleton />}>
              <GMSChecklistItem adbDevice={adbDevice} />
            </Suspense>
          )}
          <ClientSideIsPwaChecklistItem />
          <ClientSideIsSignedUpForNotificationsChecklistItem />
        </div>
      </CardContent>
    </Card>
  );
}
