/**
 * This code was generated by v0 by Vercel.
 * @see https://v0.dev/t/uKrxPB136RF
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */

/** Add fonts into your Next.js project:

 import { Inter } from 'next/font/google'

 inter({
 subsets: ['latin'],
 display: 'swap',
 })

 To read more about using these font, please visit the Next.js documentation:
 - App Directory: https://nextjs.org/docs/app/building-your-application/optimizing/fonts
 - Pages Directory: https://nextjs.org/docs/pages/building-your-application/optimizing/fonts
 **/
import { Card } from "@/components/ui/card";
import {
  DeviceInfo,
  DeviceStates,
} from "../../../server/device-info/device-info";
import { clsx } from "clsx";
import {
  DeviceCardSnapshotClient,
  PARENT_DIV_CLASSES,
} from "@/components/device-cards/device-card-snapshot-client";
import { Suspense } from "react";

export function DeviceCard({
  deviceInfo,
}: Readonly<{ deviceInfo: DeviceInfo }>) {
  return (
    <Card className="w-full max-w-sm">
      <div className="grid grid-cols-[1fr_200px] gap-6 p-4">
        <div className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-2xl font-semibold">{deviceInfo.deviceName}</h3>
            <div className="flex items-center gap-2 text-muted-foreground">
              <div
                className={clsx("h-2 w-2 rounded-full", {
                  "bg-green-500": deviceInfo.state === DeviceStates.ON,
                  "bg-red-500": deviceInfo.state === DeviceStates.OFF,
                  "bg-yellow-500": deviceInfo.state === DeviceStates.SUSPENDED,
                  "bg-gray-500": deviceInfo.state === DeviceStates.UNAVAILABLE,
                })}
              />
              <span>{deviceInfo.state}</span>
            </div>
          </div>
          {/*TODO: properties of the device instead of placeholders like battery & storage*/}
          <div className="space-y-1">
            <h4 className="text-sm font-medium">Battery</h4>
            <p className="text-muted-foreground">85%</p>
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-medium">Storage</h4>
            <p className="text-muted-foreground">128GB</p>
          </div>
        </div>
        <Suspense
          fallback={
            <div className={clsx(PARENT_DIV_CLASSES, "animate-pulse")} />
          }
        >
          <DeviceCardSnapshotClient
            deviceName={deviceInfo.deviceName}
            id={deviceInfo.id}
          />
        </Suspense>
      </div>
    </Card>
  );
}
