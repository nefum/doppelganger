import prisma from "%/database/prisma.ts";
import { DeviceCard } from "@/app/(userland)/devices/(root)/device-cards/device-card.tsx";
import NoDevicesCard from "@/app/(userland)/devices/(root)/device-pages/no-devices-card.tsx";
import { getIsDeviceRunning } from "@/utils/redroid/deployment.ts";
import { createClient } from "@/utils/supabase/server.ts";
import NotFound from "next/dist/client/components/not-found-error";

export default async function UserDevices() {
  const supabaseClient = createClient();
  const {
    data: { user },
  } = await supabaseClient.auth.getUser();

  if (!user) {
    return <NotFound />;
  }

  const clientDevices = await prisma.device.findMany({
    where: {
      ownerId: user.id,
    },
  });

  const clientDeviceUpStates: { [id: string]: boolean } = {};

  async function updateDeviceUpState(deviceId: string) {
    clientDeviceUpStates[deviceId] = await getIsDeviceRunning(deviceId);
  }

  await Promise.all(
    clientDevices.map((device) => updateDeviceUpState(device.id)),
  );

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
