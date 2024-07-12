import { getDeviceForId } from "%/device-info/device-info.ts";
import { createClient } from "@/utils/supabase/server.ts";
import NotFound from "next/dist/client/components/not-found-error";
import { ReactNode } from "react";

export default async function Format({
  children,
  params: { id },
}: Readonly<{ children: ReactNode; params: { id: string } }>) {
  const deviceInfo = await getDeviceForId(id);

  if (!deviceInfo) {
    // 404, we don't even want the user to know this device exists
    return <NotFound />;
  }

  const supabaseClient = createClient();
  const {
    data: { user },
  } = await supabaseClient.auth.getUser();

  if (!user) {
    return <NotFound />;
  }

  if (deviceInfo.ownerId !== user.id) {
    // 404, we don't even want the user to know this device exists
    return <NotFound />;
  }

  return <>{children}</>;
}
