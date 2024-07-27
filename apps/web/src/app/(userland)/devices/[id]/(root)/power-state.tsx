"use server";

import { getDeviceForId } from "%/device-info/device-info.ts";
import { getIsDeviceRunning } from "%/docker/device-state.ts";
import { ClientDevicePowerStateButtons } from "@/app/(userland)/devices/[id]/(root)/client-power-state.tsx";
import NotFound from "@/app/not-found.tsx";
import { createClient } from "@/utils/supabase/server.ts";

export default async function DevicePowerStateButtons({
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

  const deviceIsUp = await getIsDeviceRunning(device);

  return (
    <ClientDevicePowerStateButtons
      deviceInfo={device}
      deviceIsUp={deviceIsUp}
    />
  );
}
