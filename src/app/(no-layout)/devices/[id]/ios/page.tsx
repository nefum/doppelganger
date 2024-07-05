import dynamic from "next/dynamic";
import ISpinner from "@/app/(no-layout)/devices/[id]/ios/ispinner.tsx";
import { getDeviceInfoForId } from "../../../../../../server/device-info/device-info.ts";
import NotFound from "next/dist/client/components/not-found-error";
import type { ClientProps } from "@/app/components/nextvncscreen.tsx";
import IosFail from "@/app/(no-layout)/devices/[id]/ios/ios-fail.tsx";
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

export default function Page({ params: { id } }: { params: { id: string } }) {
  const deviceInfo = getDeviceInfoForId(id);

  if (!deviceInfo) {
    return <NotFound />;
  }

  return (
    <div className="flex justify-center items-center place-items-center h-screen w-screen">
      <IosClient
        fullScreen
        loadingComponent={ISpinner}
        failComponent={IosFail}
        thisPathname={`/devices/${id}/ios`}
        deviceInfo={deviceInfo}
      />
    </div>
  );
}
