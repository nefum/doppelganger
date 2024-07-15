"use client";

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
import { Card } from "@/components/ui/card.tsx";
import { clsx } from "clsx";
import { useEffect, useState } from "react";

import DeleteDeviceButton from "@/app/(userland)/devices/(root)/device-cards/delete-device-button.tsx";
import DesktopClientButton from "@/app/(userland)/devices/(root)/device-cards/desktop-client-button.tsx";
import EditDeviceButton from "@/app/(userland)/devices/(root)/device-cards/edit-device-button.tsx";
import styles from "@/app/(userland)/devices/(root)/device-cards/fill.module.css";
import { MobileClientButton } from "@/app/(userland)/devices/(root)/device-cards/mobile-client-button.tsx";
import { getSnapshotUrlOfDevice } from "@/app/(userland)/devices/[id]/snapshot/path.ts";
import { Button } from "@/components/ui/button.tsx";
import { toTitleCase } from "@/utils/misc.ts";
import { getRedroidImage } from "@/utils/redroid/redroid-images.ts";
import { Device, DeviceState } from "@prisma/client";
import { LuMousePointer2 } from "react-icons/lu";

export function DeviceCard({
  deviceInfo,
  deviceIsUp,
}: Readonly<{ deviceInfo: Device; deviceIsUp: boolean }>) {
  const [screenDialogOpen, setScreenDialogOpen] = useState(false);
  const [mobileDialogOpen, setMobileDialogOpen] = useState(false);

  const openMobileDialog = () => setMobileDialogOpen(true);

  // interesting problem: sometimes the image loads so fast that the onload event never fires,
  // leading to the loading screen never disappearing. so we wait for the component to mount before we start loading
  const [startLoading, setStartLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // this doesn't make that big of a deal for performance because the url is already preloaded
    setStartLoading(true);
  }, []);

  return (
    <div className="w-full xs:max-w-[400px] p-3">
      <Card className="w-full max-w-md">
        <div className="grid grid-cols-[1fr_200px] gap-6 p-4">
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-2xl max-w-28 break-words text-wrap font-semibold">
                {deviceInfo.name}
              </h3>
              <div className="flex items-center gap-2 text-muted-foreground">
                <div
                  className={clsx("h-2 w-2 rounded-full", {
                    "bg-green-500":
                      deviceInfo.lastState === DeviceState.USABLE && deviceIsUp,
                    "bg-red-500":
                      deviceInfo.lastState === DeviceState.USABLE &&
                      !deviceIsUp,
                    "bg-yellow-500":
                      deviceInfo.lastState === DeviceState.SUSPENDED,
                    "bg-gray-500":
                      deviceInfo.lastState === DeviceState.UNAVAILABLE,
                  })}
                />
                <span>
                  {deviceInfo.lastState === DeviceState.USABLE
                    ? deviceIsUp
                      ? "Online"
                      : "Offline"
                    : toTitleCase(deviceInfo.lastState)}
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-medium">Type</h4>
              <p className="text-muted-foreground max-w-28 break-words">
                {getRedroidImage(deviceInfo.redroidImage)?.name ?? "Unknown"}
              </p>
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-medium">Max FPS</h4>
              <p className="text-muted-foreground">{deviceInfo.redroidFps}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <MobileClientButton
                deviceInfo={deviceInfo}
                dialogOpen={mobileDialogOpen}
                setDialogOpen={setMobileDialogOpen}
              />
              <DesktopClientButton
                deviceInfo={deviceInfo}
                dialogOpen={screenDialogOpen}
                setDialogOpen={setScreenDialogOpen}
                openMobileDialog={openMobileDialog}
              />
              <EditDeviceButton deviceInfo={deviceInfo} />
              <DeleteDeviceButton deviceInfo={deviceInfo} />
            </div>
          </div>
          {/*because of the loading nightmare this snapshot is, we need to preload it manually*/}
          <link rel="prefetch" href={getSnapshotUrlOfDevice(deviceInfo.id)} />
          <div
            className={clsx(
              "rounded-lg object-cover aspect-[2/4] relative bg-gray-200",
              styles.fill,
              {
                "animate-pulse": !loaded,
              },
            )}
          >
            {startLoading && (
              // eslint-disable-next-line @next/next/no-img-element -- we NEVER want to cache this, this is an API endpoint
              <img
                className={clsx("absolute bg-black min-h-[100%] min-w-[100%]", {
                  "opacity-0": !loaded,
                })}
                style={{
                  background: "no-repeat url('/noconnect.svg')",
                }}
                alt={`${deviceInfo.name} snapshot`}
                src={getSnapshotUrlOfDevice(deviceInfo.id)}
                onError={() => setLoaded(true)}
                onLoad={() => setLoaded(true)}
              />
            )}
            <Button
              className={styles.hoverOverButton}
              onClick={() => setScreenDialogOpen(true)}
            >
              Interact
              <LuMousePointer2 className="ml-1 h-5 w-5" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
