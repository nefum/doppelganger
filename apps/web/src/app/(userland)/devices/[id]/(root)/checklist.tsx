"use server";

// DeviceChecklist Components
import { AdbDevice } from "%/adb/adb-device.ts";
import { getDeviceForId } from "%/device-info/device-info.ts";
import { getRedroidImage } from "%/device-info/redroid-images.ts";
import {
  ClientSideIsPwaChecklistItem,
  ClientSideIsSignedUpForNotificationsChecklistItem,
} from "@/app/(userland)/devices/[id]/(root)/clientside-checklist.tsx";
import NotFound from "@/app/not-found.tsx";
import CopyButton from "@/components/copy-button.tsx";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { Input } from "@/components/ui/input.tsx";
import { getRunningStatus } from "@/utils/redroid/stats.ts";
import { createClient } from "@/utils/supabase/server.ts";

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

  const deviceUp = await getRunningStatus(device);
  if (deviceUp) {
    try {
      await adbDevice.connectRobust(600_000);
    } catch (e) {
      console.error(e);
    }
  }
  const deviceConnected = await adbDevice.getIsConnected();

  const deviceHasGms = redroidImage.gms;
  const gmsId =
    deviceHasGms &&
    deviceConnected &&
    (await adbDevice.getGoogleServicesFrameworkID(600_000)).toString(10);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Device Setup Checklist</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox id="create-device" disabled checked />
            <label htmlFor="create-device">
              Create your device
              <small className="shadcn-muted block">
                Congratulations! You&apos;ve already created your device. The
                hardest part is done, now let&apos;s finish the setup.
              </small>
            </label>
          </div>
          {/*there is NO WAY to check if a gms-enabled device has been verified*/}
          {deviceHasGms && (
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
                    Your device supports the Google Play Store, but you need to
                    complete a little more setup before it can be used. You must
                    copy the code below and paste it into into the Google device
                    registration portal.{" "}
                    <a
                      href="https://www.google.com/android/uncertified/"
                      className="shadcn-link"
                    >
                      Click this link to jump to the portal.
                    </a>{" "}
                    After you have submitted the code, stop and then start your
                    device using the buttons above. When the device comes back
                    up, you will be able to sign into your Google account!
                  </small>
                </label>
              </div>
              <div className={"inline-flex"}>
                <Input
                  value={gmsId || "Start device to see ID"}
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
          )}
          <ClientSideIsPwaChecklistItem />
          <ClientSideIsSignedUpForNotificationsChecklistItem />
        </div>
      </CardContent>
    </Card>
  );
}
