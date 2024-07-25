"use client";

import pwaClickHandler from "@/app/(userland)/devices/pwa-click-handler.ts";
import DeviceClientWithButtons from "@/components/client/device-client-with-buttons.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog.tsx";
import type { Device } from "@prisma/client";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeviceConnectButtonClient(props: { device: Device }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const router = useRouter();

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <div className="mb-6">
          <Button
            onClick={(e) => {
              const isPWA = pwaClickHandler(router, props.device, e);
              if (!isPWA) {
                setDialogOpen(true);
              }
            }}
            className="w-full"
          >
            Connect to Device
          </Button>
        </div>
      </DialogTrigger>
      <DialogContent>
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
