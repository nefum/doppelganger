"use client";

import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog.tsx";
import { SimpleTooltip } from "@/components/ui/tooltip.tsx";
import { Device } from "@prisma/client";
import { DialogTitle } from "@radix-ui/react-dialog";
import { LuSettings2 } from "react-icons/lu";

import { ClientDevicePowerStateButtons } from "@/app/(userland)/devices/[id]/(root)/client-power-state.tsx";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

const quickSettingsTooltip = "Quick Settings";

export default function DeviceQuickSettingsButton({
  deviceInfo,
  deviceIsUp,
}: Readonly<{
  deviceInfo: Device;
  deviceIsUp: boolean;
}>) {
  return (
    <Dialog>
      <SimpleTooltip content={quickSettingsTooltip}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon">
            <LuSettings2 className="h-5 w-5" />
            <span className="sr-only">{quickSettingsTooltip}</span>
          </Button>
        </DialogTrigger>
      </SimpleTooltip>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Quick Settings</DialogTitle>
        </DialogHeader>
        <VisuallyHidden.Root>
          <DialogDescription>
            Quick settings for {deviceInfo.name}
          </DialogDescription>
        </VisuallyHidden.Root>
        <ClientDevicePowerStateButtons
          deviceInfo={deviceInfo}
          deviceIsUp={deviceIsUp}
        />
      </DialogContent>
    </Dialog>
  );
}
