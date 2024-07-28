"use server";

// DeviceScreenshot Components
import { getDeviceForId } from "%/device-info/device-info.ts";
import { getSnapshotUrlOfDevice } from "@/app/api/devices/[id]/snapshot/path.ts";
import NotFound from "@/app/not-found.tsx";
import DeviceClientWithButtons from "@/components/client/device-client-with-buttons.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog.tsx";
import { SimpleTooltip } from "@/components/ui/tooltip.tsx";
import { createClient } from "@/utils/supabase/server.ts";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import Image from "next/image";
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
        <Dialog>
          <DialogTrigger>
            <div className="h-[40em] flex place-content-center">
              <Image
                style={{
                  background: "no-repeat center url('/noconnect.svg')",
                }}
                unoptimized // cant be cached
                width={device.redroidWidth}
                height={device.redroidHeight}
                src={getSnapshotUrlOfDevice(deviceId)}
                placeholder={"blur"}
                blurDataURL={
                  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAACCAYAAAB/qH1jAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAJ0lEQVR4nGPY2fXjv458/H9Bbtf/IDbD/7v//8/Mvfq/J+nEfxAbAF3NFsFiuaE1AAAAAElFTkSuQmCC"
                }
                className="object-contain bg-black h-full"
                alt={`Device ${device.name} Snapshot`}
              />
            </div>
          </DialogTrigger>
          <DialogContent>
            {/*no pwa handling*/}
            <DialogHeader>{device.name}</DialogHeader>
            <VisuallyHidden.Root>
              <DialogDescription>
                Interactive stream for {device.name}
              </DialogDescription>
            </VisuallyHidden.Root>
            <DeviceClientWithButtons device={device} />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
