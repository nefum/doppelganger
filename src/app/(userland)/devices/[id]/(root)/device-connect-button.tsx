"use server";

import { getDeviceForId } from "%/device-info/device-info.ts";
import NotFound from "@/app/not-found.tsx";
import DeviceClientWithButtons from "@/components/client/device-client-with-buttons.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog.tsx";
import { createClient } from "@/utils/supabase/server.ts";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

export default async function DeviceConnectButton({
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
    <Dialog>
      <DialogTrigger asChild>
        <div className="mb-6">
          <Button className="w-full">Connect to Device</Button>
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>{device.name}</DialogHeader>
        <VisuallyHidden.Root>
          <DialogDescription>
            Interactive stream for {device.name}
          </DialogDescription>
        </VisuallyHidden.Root>
        <DeviceClientWithButtons device={device} />
      </DialogContent>
    </Dialog>
  );
}
