"use client";

import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog.tsx";
import { SimpleTooltip } from "@/components/ui/tooltip.tsx";
import { useToast } from "@/components/ui/use-toast.ts";
import { clientSideReloadWithToast } from "@/utils/toast-utils.ts";
import { Device } from "@prisma/client";
import { DialogTitle } from "@radix-ui/react-dialog";
import React, { useMemo, useState } from "react";
import { LuLoader2, LuPower, LuPowerOff, LuSettings2 } from "react-icons/lu";

const editDeviceTooltip = "Edit Device";

export default function EditDeviceButton({
  deviceInfo,
}: Readonly<{ deviceInfo: Device }>) {
  const [deviceUpLoading, setDeviceUpLoading] = useState(false);
  const [deviceDownLoading, setDeviceDownLoading] = useState(false);
  const { toast } = useToast();

  const handleDeviceUp = useMemo(
    () => async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      e.preventDefault();
      setDeviceUpLoading(true);
      const response = await fetch(`/api/devices/${deviceInfo.id}/start`, {
        method: "PUT",
      });
      if (response.ok) {
        clientSideReloadWithToast({
          toastTitle: "Device started successfully",
        });
      } else {
        console.error("Failed to start device", response);
        setDeviceUpLoading(false);
        toast({
          title: "Failed to start device",
          description: "Please try again later.",
        });
      }
    },
    [deviceInfo.id, toast],
  );

  const handleDeviceDown = useMemo(
    () => async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      e.preventDefault();
      setDeviceDownLoading(true);
      const response = await fetch(`/api/devices/${deviceInfo.id}/stop`, {
        method: "PUT",
      });
      if (response.ok) {
        clientSideReloadWithToast({
          toastTitle: "Device stopped successfully",
        });
      } else {
        console.error("Failed to stop device", response);
        setDeviceDownLoading(false);
        toast({
          title: "Failed to stop device",
          description: "Please try again later.",
        });
      }
    },
    [deviceInfo.id, toast],
  );

  return (
    <Dialog>
      <SimpleTooltip content={editDeviceTooltip}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon">
            <LuSettings2 className="h-5 w-5" />
            <span className="sr-only">{editDeviceTooltip}</span>
          </Button>
        </DialogTrigger>
      </SimpleTooltip>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Device</DialogTitle>
        </DialogHeader>
        <div className="mt-2 flex flex-row">
          <Button
            onClick={handleDeviceUp}
            variant="default"
            disabled={deviceUpLoading || deviceDownLoading}
          >
            <LuPower className="h-4 w-4" />
            <span className="ml-1">Start Device</span>
            {deviceUpLoading && (
              <LuLoader2 className="ml-2 h-4 w-4 animate-spin" />
            )}
          </Button>
          <Button
            onClick={handleDeviceDown}
            variant="destructive"
            disabled={deviceUpLoading || deviceDownLoading}
            className="ml-2"
          >
            <LuPowerOff className="h-4 w-4" />
            <span className="ml-1">Stop Device</span>
            {deviceDownLoading && (
              <LuLoader2 className="ml-2 h-4 w-4 animate-spin" />
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
