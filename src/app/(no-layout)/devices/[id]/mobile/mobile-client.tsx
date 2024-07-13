"use client";

import { getUdidForDevice } from "%/device-info/device-info.ts";
import ISpinner from "@/app/(no-layout)/devices/[id]/mobile/ispinner.tsx";
import ScrcpyDevicePlayer, {
  ScrcpyDevicePlayerHandle,
} from "@/components/scrcpy/scrcpy-device-player.tsx";
import { Button } from "@/components/ui/button.tsx";
import { useToast } from "@/components/ui/use-toast.ts";
import Size from "@/ws-scrcpy-native/app/Size.ts";
import VideoSettings from "@/ws-scrcpy-native/app/VideoSettings.ts";
import { Device } from "@prisma/client";
import { useOrientation } from "@uidotdev/usehooks";
import { ReactNode, useEffect, useRef, useState } from "react";

const MOBILE_BITRATE_BYTES = 800_0000;
const MOBILE_IFRAME_INTERVAL = 10;

export default function MobileClient({
  device,
}: Readonly<{ device: Device }>): ReactNode {
  const [wsPath, setWsPath] = useState<string | null>(null);
  const ref = useRef<ScrcpyDevicePlayerHandle>(null);
  const orientation = useOrientation();
  const [lastOrientation, setLastOrientation] = useState(orientation);
  const [listeningToKeys, setListeningToKeys] = useState(false);
  const [initialMaxSize, setInitialMaxSize] = useState<Size>(
    new Size(device.redroidHeight, device.redroidWidth),
  );
  const { toast } = useToast();

  useEffect(() => {
    if (ref.current && lastOrientation !== orientation) {
      ref.current.rotateDevice();
      setLastOrientation(orientation);
    }
  }, [lastOrientation, orientation]);

  useEffect(() => {
    const thisUrl = new URL(window.location.href);
    thisUrl.protocol = thisUrl.protocol === "https:" ? "wss" : "ws";
    thisUrl.pathname = `/devices/${device.id}/stream`;
    setWsPath(thisUrl.toString());
  }, [device.id]);

  useEffect(() => {
    function updateSize() {
      if (!ref.current) {
        return;
      }

      ref.current.setVideoSettings(
        new VideoSettings({
          bitrate: MOBILE_BITRATE_BYTES,
          maxFps: device.redroidFps,
          iFrameInterval: 10,
          sendFrameMeta: false,
          bounds: new Size(window.innerWidth, window.innerHeight),
        }),
      );
    }

    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [device.redroidFps, ref]);

  useEffect(() => {
    if (listeningToKeys) {
      return; // no need to hook in
    }

    function keydown(e: KeyboardEvent) {
      if (!ref.current) {
        return;
      }

      ref.current.setKeyboardCapture(true);
    }

    document.addEventListener("keydown", keydown);
    return () => document.removeEventListener("keydown", keydown);
  }, [ref, listeningToKeys]);

  useEffect(() => {
    setInitialMaxSize(new Size(window.innerWidth, window.innerHeight));
  }, []);

  if (!wsPath) {
    return <ISpinner large />;
  }

  return (
    <ScrcpyDevicePlayer
      ref={ref}
      wsPath={wsPath}
      udid={getUdidForDevice(device)}
      onDisconnect={(e) => {
        toast({
          title: `Disconnected: ${e.code} ${e.reason}`,
          description: (
            <Button onClick={() => window.location.reload()}>Reconnect</Button>
          ),
        });
      }}
      videoSettings={
        new VideoSettings({
          bitrate: MOBILE_IFRAME_INTERVAL,
          maxFps: device.redroidFps,
          iFrameInterval: 10,
          sendFrameMeta: false,
          bounds: initialMaxSize,
        })
      }
      fitToScreen
    />
  );
}
