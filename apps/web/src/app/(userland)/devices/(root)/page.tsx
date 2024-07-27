import { DeviceCardSkeleton } from "@/app/(userland)/devices/(root)/device-cards/device-card-skeleton.tsx";
import { DeviceCardPage } from "@/app/(userland)/devices/(root)/device-pages/device-card-page.tsx";
import UserDevices from "@/app/(userland)/devices/(root)/device-pages/user-devices.tsx";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "My Devices",
};

export default function Page() {
  return (
    <DeviceCardPage>
      <Suspense
        fallback={
          <>
            {Array.from({ length: 6 }).map((_, i) => (
              <DeviceCardSkeleton key={i} />
            ))}
          </>
        }
      >
        <UserDevices />
      </Suspense>
    </DeviceCardPage>
  );
}
