import { getIsDeviceRunning } from "%/docker/device-state.ts";
import { DeviceCard } from "@/app/(userland)/devices/(root)/device-cards/device-card.tsx";
import NoDevicesCard from "@/app/(userland)/devices/(root)/device-pages/no-devices-card.tsx";
import { getDevicesForUser } from "@/utils/devices.ts";
import { createClient } from "@/utils/supabase/server.ts";
import { Device } from "@prisma/client";
import "array.prototype.tosorted/auto";
import NotFound from "next/dist/client/components/not-found-error";

export default async function UserDevices() {
  const supabaseClient = createClient();
  const {
    data: { user },
  } = await supabaseClient.auth.getUser();

  if (!user) {
    return <NotFound />;
  }

  const clientDevices = (await getDevicesForUser(user)).toSorted(
    // sort by the createdAt
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
  );

  const clientDeviceUpStates: { [id: string]: boolean } = {};

  async function updateDeviceUpState(device: Device) {
    clientDeviceUpStates[device.id] = await getIsDeviceRunning(device);
  }

  await Promise.all(clientDevices.map((device) => updateDeviceUpState(device)));

  if (clientDevices.length === 0) {
    return <NoDevicesCard />;
  }

  return (
    <>
      {clientDevices.map((deviceInfo) => (
        <DeviceCard
          key={deviceInfo.id}
          deviceInfo={deviceInfo}
          deviceIsUp={clientDeviceUpStates[deviceInfo.id]}
        />
      ))}
    </>
  );
}
