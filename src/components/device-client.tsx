"use client";

import { getUdidForDevice } from "%/device-info/device-info.ts";
import ScrcpyDevicePlayer, {
  ScrcpyDevicePlayerHandle,
} from "@/components/scrcpy/scrcpy-device-player.tsx";
import { Button } from "@/components/ui/button.tsx";
import { useToast } from "@/components/ui/use-toast.ts";
import useOnInteraction from "@/utils/use-on-interaction.ts"; // doesn't exist at runtime; type-only
import Size from "@/ws-scrcpy-native/app/Size.ts";
import VideoSettings from "@/ws-scrcpy-native/app/VideoSettings.ts";
import JSMpeg from "@cycjimmy/jsmpeg-player";
import { Device } from "@prisma/client";
import { useOrientation } from "@uidotdev/usehooks";
import { clsx } from "clsx";
import type { Player } from "jsmpeg";
import { ReactNode, useEffect, useRef, useState } from "react";
import { useResizeDetector } from "react-resize-detector";

const JSMpegVideoElement = JSMpeg.VideoElement;
const JSMpegPlayer = JSMpeg.Player || JSMpegVideoElement.player;

const MOBILE_BITRATE_BYTES = 800_0000;
const MOBILE_IFRAME_INTERVAL = 10;

interface MobileClientProps {
  device: Device;
  loadingNode: ReactNode;
  className?: string;
}

export default function DeviceClient({
  device,
  loadingNode,
  className,
}: Readonly<MobileClientProps>): ReactNode {
  const orientation = useOrientation();
  const [lastOrientation, setLastOrientation] = useState(orientation);
  const [initialMaxSize, setInitialMaxSize] = useState<Size>(
    new Size(device.redroidHeight, device.redroidWidth),
  );
  const { toast } = useToast();

  const clientRef = useRef<ScrcpyDevicePlayerHandle>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const audioCanvasRef = useRef<HTMLCanvasElement>(null);
  const { width, height } = useResizeDetector({ targetRef: containerRef });

  const playerRef = useRef<Player | null>();

  const [scrcpyWsUrlString, setScrcpyWsUrlString] = useState<string | null>(
    null,
  );
  const [jsmpegWsUrlString, setJsmpegWsUrlString] = useState<string | null>(
    null,
  );
  const interacted = useOnInteraction(containerRef);

  useEffect(() => {
    // we already set the canvas element
    if (playerRef.current || !audioCanvasRef.current) {
      return;
    }

    if (!interacted || !jsmpegWsUrlString) {
      return;
    }

    console.log("starting audio player");

    // we have the jsmpeg url and the user has interacted, we can attach the player
    const player = new JSMpegPlayer(jsmpegWsUrlString, {
      canvas: audioCanvasRef.current,
      audio: true,
      video: false,
      onEnded: () => {
        toast({
          title: "Audio Disconnected",
          description: (
            <Button onClick={() => window.location.reload()}>Reconnect</Button>
          ),
        });
      },
      onStalled: (player: Player) => {
        toast({
          title: "Audio Stalled; is your connection ok?",
          description: (
            <Button onClick={() => window.location.reload()}>Reconnect</Button>
          ),
        });
      },
    });

    playerRef.current = player;

    return () => {
      player.destroy();
      playerRef.current = null;
    };
  }, [playerRef, interacted, jsmpegWsUrlString, toast]);

  useEffect(() => {
    if (clientRef.current && lastOrientation !== orientation) {
      clientRef.current.rotateDevice();
      setLastOrientation(orientation);
    }
  }, [lastOrientation, orientation]);

  useEffect(() => {
    const scrcpyWsUrl = new URL(window.location.href);
    scrcpyWsUrl.protocol = scrcpyWsUrl.protocol === "https:" ? "wss" : "ws";
    scrcpyWsUrl.pathname = `/devices/${device.id}/scrcpy`;
    setScrcpyWsUrlString(scrcpyWsUrl.toString());

    const jsmpegWsUrl = new URL(window.location.href);
    jsmpegWsUrl.protocol = jsmpegWsUrl.protocol === "https:" ? "wss" : "ws";
    jsmpegWsUrl.pathname = `/devices/${device.id}/jsmpeg`;
    setJsmpegWsUrlString(jsmpegWsUrl.toString());
  }, [device.id]);

  useEffect(() => {
    if (!clientRef.current || !width || !height) {
      return;
    }

    clientRef.current.setVideoSettings(
      new VideoSettings({
        bitrate: MOBILE_BITRATE_BYTES,
        maxFps: device.redroidFps,
        iFrameInterval: 10,
        sendFrameMeta: false,
        bounds: new Size(width, height),
      }),
    );
  }, [device.redroidFps, clientRef, width, height]);

  useEffect(() => {
    function keydown(e: KeyboardEvent) {
      if (!clientRef.current) {
        return;
      }

      clientRef.current.setKeyboardCapture(true);
    }

    document.addEventListener("keydown", keydown);
    return () => document.removeEventListener("keydown", keydown);
  }, [clientRef]);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    setInitialMaxSize(
      new Size(
        containerRef.current.clientWidth,
        containerRef.current.clientHeight,
      ),
    );
  }, [containerRef]);

  return (
    <div ref={containerRef} className={clsx("h-full w-full", className)}>
      {(scrcpyWsUrlString && (
        <ScrcpyDevicePlayer
          ref={clientRef}
          wsPath={scrcpyWsUrlString}
          udid={getUdidForDevice(device)}
          onDisconnect={(e) => {
            toast({
              title: `Video Disconnected: ${e.code} ${e.reason}`,
              description: (
                <Button onClick={() => window.location.reload()}>
                  Reconnect
                </Button>
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
      )) ||
        loadingNode}
      <canvas ref={audioCanvasRef} className="h-0 w-0" />
    </div>
  );
}
