"use client";

import pwaClickHandler from "@/app/(userland)/devices/pwa-click-handler.ts";
import { getSnapshotUrlOfDevice } from "@/app/api/devices/[id]/snapshot/path.ts";
import DeviceClientWithButtons from "@/components/client/device-client-with-buttons.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog.tsx";
import { Device } from "@prisma/client";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import Image from "next/image";
import { useRouter } from "next/navigation";

export function DeviceScreenshotClient(props: { device: Device }) {
  const router = useRouter();

  return (
    <Dialog>
      <DialogTrigger
        onClick={(e) => {
          pwaClickHandler(router, props.device, e);
        }}
      >
        <div className="h-[40em] flex place-content-center">
          <Image
            style={{
              background: "no-repeat center url('/noconnect.svg')",
            }}
            unoptimized // cant be cached
            width={props.device.redroidWidth}
            height={props.device.redroidHeight}
            src={getSnapshotUrlOfDevice(props.device.id)}
            placeholder={"blur"}
            blurDataURL={
              "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAACCAYAAAB/qH1jAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAJ0lEQVR4nGPY2fXjv458/H9Bbtf/IDbD/7v//8/Mvfq/J+nEfxAbAF3NFsFiuaE1AAAAAElFTkSuQmCC"
            }
            className="object-contain bg-black h-full"
            alt={`Device ${props.device.name} Snapshot`}
          />
        </div>
      </DialogTrigger>
      <DialogContent>
        {/*no pwa handling*/}
        <DialogHeader>{props.device.name}</DialogHeader>
        <VisuallyHidden.Root>
          <DialogDescription>
            Interactive stream for {props.device.name}
          </DialogDescription>
        </VisuallyHidden.Root>
        <DeviceClientWithButtons device={props.device} />
      </DialogContent>
    </Dialog>
  );
}
