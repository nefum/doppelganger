"use server";

// DeviceScreenshot Components
import { getDeviceForId } from "%/device-info/device-info.ts";
import { DeviceScreenshotClient } from "@/app/(userland)/devices/[id]/(root)/device-screenshot-client.tsx";
import { getSnapshotUrlOfDevice } from "@/app/api/devices/[id]/snapshot/path.ts";
import NotFound from "@/app/not-found.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { SimpleTooltip } from "@/components/ui/tooltip.tsx";
import { createClient } from "@/utils/supabase/server.ts";
import { LuDownload } from "react-icons/lu";

export default async function DeviceScreenshot({
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

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between content-center">
          <div className="content-center">
            <CardTitle>Device Screenshot</CardTitle>
          </div>
          <SimpleTooltip content={"Download Screenshot"}>
            <Button variant="ghost" asChild>
              <a
                href={getSnapshotUrlOfDevice(deviceId)}
                download={getSnapshotUrlOfDevice(deviceId)}
              >
                <LuDownload className="h-5 w-6" />
              </a>
            </Button>
          </SimpleTooltip>
        </div>
      </CardHeader>
      <CardContent>
        <DeviceScreenshotClient device={device} />
      </CardContent>
    </Card>
  );
}
