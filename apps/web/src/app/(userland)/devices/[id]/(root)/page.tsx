import { DeviceBreadcrumb } from "@/app/(userland)/devices/[id]/(root)/breadcrumb.tsx";
import { DeviceChecklist } from "@/app/(userland)/devices/[id]/(root)/checklist.tsx";
import DeviceConnectButton from "@/app/(userland)/devices/[id]/(root)/device-connect-button.tsx";
import DeviceScreenshot from "@/app/(userland)/devices/[id]/(root)/device-screenshot.tsx";
import DevicePowerStateButtons from "@/app/(userland)/devices/[id]/(root)/power-state.tsx";
import {
  DeviceBreadcrumbSkeleton,
  DeviceChecklistSkeleton,
  DeviceConnectButtonSkeleton,
  DevicePowerStateButtonsSkeleton,
  DeviceScreenshotSkeleton,
  DeviceStatsSkeleton,
} from "@/app/(userland)/devices/[id]/(root)/skeletons.tsx";
import { DeviceStats } from "@/app/(userland)/devices/[id]/(root)/stats.tsx";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Device",
  description: "Device details and actions",
};

// Main Page Component
export default async function Page({
  params: { id: deviceId },
}: Readonly<{ params: { id: string } }>) {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Suspense fallback={<DeviceBreadcrumbSkeleton deviceId={deviceId} />}>
        <DeviceBreadcrumb deviceId={deviceId} />
      </Suspense>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="mb-6">
            <Suspense fallback={<DevicePowerStateButtonsSkeleton />}>
              <DevicePowerStateButtons deviceId={deviceId} />
            </Suspense>
          </div>
          <Suspense fallback={<DeviceChecklistSkeleton />}>
            <DeviceChecklist deviceId={deviceId} />
          </Suspense>
          <Suspense fallback={<DeviceStatsSkeleton />}>
            <DeviceStats deviceId={deviceId} />
          </Suspense>
        </div>
        <div>
          <Suspense fallback={<DeviceConnectButtonSkeleton />}>
            <DeviceConnectButton deviceId={deviceId} />
          </Suspense>
          <Suspense fallback={<DeviceScreenshotSkeleton />}>
            <DeviceScreenshot deviceId={deviceId} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
