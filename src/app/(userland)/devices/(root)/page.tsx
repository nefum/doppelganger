import { DeviceCardPage } from "@/components/device-cards/device-card-page.tsx";
import { getDeviceForId } from "../../../../../server/device-info/device-info.ts";
import { DeviceCard } from "@/components/device-cards/device-card.tsx";
import { DeviceCardSkeleton } from "@/components/device-cards/device-card-skeleton.tsx";
import { Suspense } from "react";
import UserDeviceCardPage from "@/app/(userland)/devices/(root)/user-device-card-page.tsx";

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
