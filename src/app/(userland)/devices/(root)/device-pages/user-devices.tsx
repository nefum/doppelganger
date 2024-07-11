import prisma from "%/database/prisma.ts";
import { DeviceCard } from "@/app/(userland)/devices/(root)/device-cards/device-card.tsx";
import NoDevicesCard from "@/app/(userland)/devices/(root)/device-pages/no-devices-card.tsx";
import { createClient } from "@/utils/supabase/server.ts";

export default async function UserDevices() {
  const supabaseClient = createClient();
  const user = await supabaseClient.auth.getUser();
  const email = user.data.user!.email!;

  const clientDevices = await prisma.device.findMany({
    where: {
      ownerEmail: email,
    },
  });

  if (clientDevices.length === 0) {
    return <NoDevicesCard />;
  }

  return (
    <>
      {clientDevices.map((deviceInfo) => (
        <DeviceCard key={deviceInfo.id} deviceInfo={deviceInfo} />
      ))}
    </>
  );
}
