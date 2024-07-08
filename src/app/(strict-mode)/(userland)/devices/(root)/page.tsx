import UserDeviceCardPage from "@/app/(strict-mode)/(userland)/devices/(root)/user-device-card-page.tsx";
import { DeviceCardPage } from "@/components/device-cards/device-card-page.tsx";
import { DeviceCardSkeleton } from "@/components/device-cards/device-card-skeleton.tsx";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense
      fallback={
        <DeviceCardPage>
          <DeviceCardSkeleton />
          <DeviceCardSkeleton />
          <DeviceCardSkeleton />
          <DeviceCardSkeleton />
          <DeviceCardSkeleton />
          <DeviceCardSkeleton />
        </DeviceCardPage>
      }
    >
      <UserDeviceCardPage />
    </Suspense>
  );
}
