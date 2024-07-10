import { getDeviceForId } from "%/device-info/device-info.ts";
import ISpinner from "@/app/(no-layout)/devices/[id]/ios/ispinner.tsx";
import ServerPage from "@/app/(no-layout)/devices/[id]/ios/server-page.tsx";
import NotFound from "next/dist/client/components/not-found-error";
import { Suspense } from "react";
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

  return (
    <div className="flex justify-center items-center place-items-center h-screen w-screen">
      <Suspense fallback={<ISpinner large />}>
        <ServerPage id={id} />
      </Suspense>
    </div>
  );
}
