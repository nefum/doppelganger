import dynamic from "next/dynamic";
import ISpinner from "@/app/(not-strict)/devices/[id]/ios/ispinner.tsx";
import { getDeviceForId } from "%/device-info/device-info.ts";
import NotFound from "next/dist/client/components/not-found-error";
import type { ClientProps } from "@/app/components/nextvncscreen.tsx";
import IosFail from "@/app/(not-strict)/devices/[id]/ios/ios-fail.tsx";
import { createClient } from "@/utils/supabase/server.ts";
// import "./ios-client.css";
// there is never a reason to manually hide the cursor because the cursor will not show in the WKWebView;
// the cursor we view is from

const IosClient = dynamic<ClientProps>(
  () => import("../../../../components/nextvncscreen.tsx"),
  {
    ssr: false,
    loading: () => <ISpinner large />,
  },
);

export default async function ServerPage({ id }: { id: string }) {
  const supabaseClient = createClient();
  const user = await supabaseClient.auth.getUser();
  const email = user.data.user!.email!;
  const deviceInfo = await getDeviceForId(id);

  if (!deviceInfo || deviceInfo.ownerEmail !== email) {
    return <NotFound />;
  }

  return (
    <div className="flex justify-center items-center place-items-center h-screen w-screen">
      <IosClient
        fullScreen
        loadingComponent={<ISpinner large />}
        failComponent={<IosFail reason={"Failed to connect to device"} />}
        thisPathname={`/devices/${id}/ios`}
        deviceInfo={deviceInfo}
      />
    </div>
  );
}
