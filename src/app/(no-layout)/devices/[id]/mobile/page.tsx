import { getDeviceForId } from "%/device-info/device-info.ts";
import MobileClient from "@/app/(no-layout)/devices/[id]/mobile/mobile-client.tsx";
import { createClient } from "@/utils/supabase/server.ts";
import NotFound from "next/dist/client/components/not-found-error";
// import "./ios-client.css";
// there is never a reason to manually hide the cursor because the cursor will not show in the WKWebView;
// the cursor we view is from

export default async function Page({
  params: { id },
}: {
  params: { id: string };
}) {
  const deviceInfo = await getDeviceForId(id);

  if (!deviceInfo) {
    return <NotFound />;
  }

  const supabaseClient = createClient();
  const {
    data: { user },
  } = await supabaseClient.auth.getUser();

  // user will never be null here, but just put in the check for safety
  if (!user) {
    return <NotFound />;
  }
  if (!deviceInfo || deviceInfo.ownerId !== user.id) {
    return <NotFound />;
  }

  return (
    <div className="flex justify-center items-center place-items-center h-screen w-screen">
      <MobileClient device={deviceInfo} />
    </div>
  );
}
