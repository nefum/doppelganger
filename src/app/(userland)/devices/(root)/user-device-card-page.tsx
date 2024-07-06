import { getDeviceForId } from "../../../../../server/device-info/device-info.ts";
import { DeviceCardPage } from "@/components/device-cards/device-card-page.tsx";
import { DeviceCard } from "@/components/device-cards/device-card.tsx";
import prisma from "../../../../../prisma/prisma.ts";
import { createClient } from "../../../../../server/supabase/server.ts";

export default async function UserDeviceCardPage() {
  const supabaseClient = createClient();
  const user = await supabaseClient.auth.getUser();
  const email = user.data.user!.email!;

  const clientDevices = await prisma.device.findMany({
    where: {
      ownerEmail: email,
    },
  });

  return (
    <DeviceCardPage>
      {clientDevices.map((deviceInfo) => (
        <DeviceCard key={deviceInfo.id} deviceInfo={deviceInfo} />
      ))}
    </DeviceCardPage>
  );
}