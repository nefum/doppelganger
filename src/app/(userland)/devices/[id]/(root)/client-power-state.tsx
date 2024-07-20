"use client";

import { Button } from "@/components/ui/button.tsx";
import { useToast } from "@/components/ui/use-toast.ts";
import { clientSideReloadWithToast } from "@/utils/toast-utils.ts";
import { Device } from "@prisma/client";
import React, { useMemo, useState } from "react";
import { LuLoader2, LuPower, LuPowerOff } from "react-icons/lu";

export function ClientDevicePowerStateButtons({
  deviceInfo,
  deviceIsUp,
}: Readonly<{
  deviceInfo: Device;
  deviceIsUp: boolean;
}>) {
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
      const responseJson = await response.json();
      if (response.ok) {
        clientSideReloadWithToast({
          title: "Device started successfully",
        });
      } else {
        console.error("Failed to start device", response);
        setDeviceUpLoading(false);
        toast({
          title: "Failed to start device",
          description: responseJson.error ?? "Please try again later.",
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
      const responseJson = await response.json();
      if (response.ok) {
        clientSideReloadWithToast({
          title: "Device stopped successfully",
        });
      } else {
        console.error("Failed to stop device", response);
        setDeviceDownLoading(false);
        toast({
          title: "Failed to stop device",
          description: responseJson.error ?? "Please try again later.",
        });
      }
    },
    [deviceInfo.id, toast],
  );

  return (
    <div className="grid grid-cols-2 gap-4">
      <Button
        onClick={handleDeviceUp}
        variant="default"
        disabled={deviceUpLoading || deviceDownLoading || deviceIsUp}
      >
        <LuPower className="h-4 w-4" />
        <span className="ml-1">Start Device</span>
        {deviceUpLoading && <LuLoader2 className="ml-2 h-4 w-4 animate-spin" />}
      </Button>
      <Button
        onClick={handleDeviceDown}
        variant="destructive"
        disabled={deviceUpLoading || deviceDownLoading || !deviceIsUp}
      >
        <LuPowerOff className="h-4 w-4" />
        <span className="ml-1">Stop Device</span>
        {deviceDownLoading && (
          <LuLoader2 className="ml-2 h-4 w-4 animate-spin" />
        )}
      </Button>
    </div>
  );
}
