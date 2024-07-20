"use client";

import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog.tsx";
import { SimpleTooltip } from "@/components/ui/tooltip.tsx";
import { Device } from "@prisma/client";
import { DialogTitle } from "@radix-ui/react-dialog";
import { LuSettings2 } from "react-icons/lu";

import { ClientDevicePowerStateButtons } from "@/app/(userland)/devices/[id]/(root)/client-power-state.tsx";

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
          <DialogTitle>Edit Device</DialogTitle>
        </DialogHeader>
        <ClientDevicePowerStateButtons
          deviceInfo={deviceInfo}
          deviceIsUp={deviceIsUp}
        />
      </DialogContent>
    </Dialog>
  );
}
