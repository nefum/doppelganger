"use client";

import { getAdbUdidForDevice } from "%/device-info/device-info-utils.ts";
import JSMpegClient from "@/components/client/jsmpeg-client.tsx";
import FillingAspectRatio from "@/components/filling-aspect-ratio.tsx";
import ScrcpyDevicePlayer, {
  ScrcpyDevicePlayerHandle,
} from "@/components/scrcpy/scrcpy-device-player.tsx";
import { useToast } from "@/components/ui/use-toast.ts";
import Size from "@/ws-scrcpy/src/app/Size.ts";
import VideoSettings from "@/ws-scrcpy/src/app/VideoSettings.ts";
import type { Device } from "@prisma/client";
import { useOrientation } from "@uidotdev/usehooks";
import { clsx } from "clsx";
import {
  forwardRef,
  ReactNode,
  Suspense,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import styles from "./sizer.module.css";

// 8 MB/s
const DEVICE_BITRATE_BYTES = 8_000_000;
// for some bizzarre reason, the video is always a bit too small, so we overscan it
const OVERSCAN_MULTIPLIER = 1.05;

interface DeviceClientProps {
  device: Device;
  loadingNode: ReactNode;

  autoCaptureKeyboard?: boolean;
  playAudio?: boolean;
  autoRotate?: boolean;
}

interface OneshotDeviceClientProps extends DeviceClientProps {
  hardReset: () => void;
}

function getInitialMaxSize(device: Device): Size {
  return new Size(device.redroidHeight, device.redroidWidth);
}

export type DeviceClientHandle = Omit<
  ScrcpyDevicePlayerHandle,
  "getVideoSettings" | "setVideoSettings" | "containerRef" | "getName"
>;

// this is called the oneshot device client because it cannot rerender itself from scratch in case of an error, it excepts a function that can do that
const OneshotDeviceClient = forwardRef<
  DeviceClientHandle,
  OneshotDeviceClientProps
>((props, ref) => {
  const {
    device,
    loadingNode,
    autoCaptureKeyboard,
    playAudio,
    autoRotate,
    hardReset,
  } = props;
  const { type: orientationType } = useOrientation();
  const [knownOrientationType, setKnownOrientationType] =
    useState(orientationType);

  const { toast } = useToast();

  const [aspectRatio, setAspectRatio] = useState(
    device.redroidWidth / device.redroidHeight,
  );

  const scrcpyClientRef = useRef<ScrcpyDevicePlayerHandle>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sizerRef = useRef<HTMLImageElement>(null);

  const [scrcpyWsUrlString, setScrcpyWsUrlString] = useState<string | null>(
    null,
  );
  const [jsmpegWsUrlString, setJsmpegWsUrlString] = useState<string | null>(
    null,
  );

  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!autoRotate) {
      return;
    }

    if (orientationType === knownOrientationType) {
      return;
    }

    setKnownOrientationType(orientationType);

    if (!scrcpyClientRef.current) {
      return;
    }

    scrcpyClientRef.current.rotateDevice();
  }, [autoRotate, knownOrientationType, orientationType]);

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

  const createVideoSettingsWithBound = useMemo(
    () => (bounds: Size) => {
      return new VideoSettings({
        bitrate: DEVICE_BITRATE_BYTES,
        maxFps: device.redroidFps,
        iFrameInterval: Math.floor(device.redroidFps / 2), // 0.5 seconds, balances responsiveness and bandwidth
        sendFrameMeta: false,
        bounds,
      });
    },
    [device.redroidFps],
  );

  const getMaxBounds = useMemo(
    () => () => {
      if (!sizerRef.current) {
        return null;
      }

      return new Size(
        sizerRef.current.clientWidth * OVERSCAN_MULTIPLIER,
        sizerRef.current.clientHeight * OVERSCAN_MULTIPLIER,
      );
    },
    [],
  );

  const updateBoundsRuntime = useMemo(
    () => () => {
      if (!scrcpyClientRef.current || !sizerRef.current) {
        return;
      }

      const bounds = getMaxBounds()!;

      if (bounds === scrcpyClientRef.current.getVideoSettings().bounds) {
        return; // no need
      }

      const newVideoSettings = createVideoSettingsWithBound(bounds);
      scrcpyClientRef.current.setVideoSettings(newVideoSettings);
    },
    [createVideoSettingsWithBound, getMaxBounds],
  );

  const sizerResizeObserver = useMemo(() => {
    return new ResizeObserver(updateBoundsRuntime);
  }, [updateBoundsRuntime]);

  useEffect(() => {
    if (!sizerRef.current) {
      return;
    }

    sizerResizeObserver.observe(sizerRef.current);
    return () => {
      sizerResizeObserver.disconnect();
    };
  }, [sizerResizeObserver]);

  const handleRatioChange = useMemo(
    () => () => {
      if (!scrcpyClientRef.current) {
        return;
      }

      const internalContainer = scrcpyClientRef.current.containerRef.current!;
      const newlyUpdatedRatio =
        internalContainer.clientWidth / internalContainer.clientHeight;

      // if the current ratio is close enough (within error of decimal precision) to the aspect ratio, don't update
      if (Math.abs(newlyUpdatedRatio - aspectRatio) < 0.1) {
        return;
      }

      setAspectRatio(newlyUpdatedRatio);
    },
    [aspectRatio],
  );

  const scrcpyContainerResizeObserver = useMemo(() => {
    return new ResizeObserver(handleRatioChange);
  }, [handleRatioChange]);

  useEffect(() => {
    if (!connected && !scrcpyClientRef.current) {
      return;
    }

    const scrcpyContainer = scrcpyClientRef.current!.containerRef.current!;
    const resizeObserver = scrcpyContainerResizeObserver;

    resizeObserver.observe(scrcpyContainer);
    return () => {
      resizeObserver.disconnect();
    };
  }, [connected, scrcpyContainerResizeObserver]);

  // turn on keyboard processing when a key is pressed
  useEffect(() => {
    if (!autoCaptureKeyboard) {
      return;
    }

    function keydown(e: KeyboardEvent) {
      if (!scrcpyClientRef.current) {
        return;
      }

      scrcpyClientRef.current.setKeyboardCapture(true);
    }

    document.addEventListener("keydown", keydown);
    return () => document.removeEventListener("keydown", keydown);
  }, [autoCaptureKeyboard]);

  useImperativeHandle(ref, () => {
    return {
      getShowQualityStats: () => {
        return scrcpyClientRef.current?.getShowQualityStats() ?? false;
      },
      setShowQualityStats: (show: boolean) => {
        if (scrcpyClientRef.current) {
          scrcpyClientRef.current.setShowQualityStats(show);
        }
      },

      getKeyboardCapture: () => {
        return scrcpyClientRef.current?.getKeyboardCapture() ?? false;
      },
      setKeyboardCapture: (capture: boolean) => {
        if (autoCaptureKeyboard) {
          console.warn(
            "setKeyboardCapture is disabled because autoListenToKeyboard is enabled",
          );
          return;
        }
        if (scrcpyClientRef.current) {
          scrcpyClientRef.current.setKeyboardCapture(capture);
        }
      },

      expandNotification: () => {
        if (scrcpyClientRef.current) {
          scrcpyClientRef.current.expandNotification();
        }
      },
      expandSettings: () => {
        if (scrcpyClientRef.current) {
          scrcpyClientRef.current.expandSettings();
        }
      },
      collapsePanels: () => {
        if (scrcpyClientRef.current) {
          scrcpyClientRef.current.collapsePanels();
        }
      },
      rotateDevice: () => {
        if (scrcpyClientRef.current) {
          scrcpyClientRef.current.rotateDevice();
        }
      },

      pressDevicePowerButton: (action: "up" | "down") => {
        if (scrcpyClientRef.current) {
          scrcpyClientRef.current.pressDevicePowerButton(action);
        }
      },
      pressDeviceVolumeUpButton: (action: "up" | "down") => {
        if (scrcpyClientRef.current) {
          scrcpyClientRef.current.pressDeviceVolumeUpButton(action);
        }
      },
      pressDeviceVolumeDownButton: (action: "up" | "down") => {
        if (scrcpyClientRef.current) {
          scrcpyClientRef.current.pressDeviceVolumeDownButton(action);
        }
      },
      pressDeviceBackButton: (action: "up" | "down") => {
        if (scrcpyClientRef.current) {
          scrcpyClientRef.current.pressDeviceBackButton(action);
        }
      },
      pressDeviceHomeButton: (action: "up" | "down") => {
        if (scrcpyClientRef.current) {
          scrcpyClientRef.current.pressDeviceHomeButton(action);
        }
      },
      pressDeviceAppSwitchButton: (action: "up" | "down") => {
        if (scrcpyClientRef.current) {
          scrcpyClientRef.current.pressDeviceAppSwitchButton(action);
        }
      },
    };
  }, [autoCaptureKeyboard]);

  return (
    <FillingAspectRatio
      aspectRatio={aspectRatio}
      innerContainerRef={containerRef}
      className={"items-center place-items-center"}
    >
      {/*this is SO hacky but it's the best way to do the scrcpydevicehelper with react bindings*/}
      {/*eslint-disable-next-line @next/next/no-img-element -- placeholder*/}
      <img
        ref={sizerRef}
        className="h-full w-full object-cover opacity-0"
        src="/placeholder.svg"
        alt={`${device.name} live stream`}
      />
      <div className={clsx(styles.absolutelyCenteredItem, "z-20")}>
        <Suspense fallback={loadingNode}>
          {(scrcpyWsUrlString && (
            <ScrcpyDevicePlayer
              ref={scrcpyClientRef}
              wsPath={scrcpyWsUrlString}
              udid={getAdbUdidForDevice(device)}
              onDisconnect={(closeEvent) => {
                if (
                  closeEvent.code !== 1005 &&
                  closeEvent.code !== 1000 &&
                  closeEvent.code !== 1001
                ) {
                  // this library does normal exits with 1005, so dumb
                  toast({
                    title: "Disconnected Abnormally",
                    description: "Attempting reconnection...",
                  });

                  // this library does not implement any reconnection mechanism
                  setTimeout(() => {
                    hardReset();
                  }, 1 * 1_000); //  avoid anything faster than a second as it could spam the user
                }

                setConnected(false);
              }}
              videoSettings={createVideoSettingsWithBound(
                getInitialMaxSize(device),
              )}
              onConnect={() => {
                updateBoundsRuntime();

                setConnected(true);
              }}
            />
          )) ||
            loadingNode}
        </Suspense>
      </div>
      <div className={clsx(styles.absolutelyCenteredItem, "z-10")}>
        {loadingNode}
      </div>
      {jsmpegWsUrlString && playAudio && (
        <div className={styles.absolutelyCenteredItem}>
          <JSMpegClient
            containerRef={containerRef}
            jsmpegWsUrlString={jsmpegWsUrlString}
          />
        </div>
      )}
    </FillingAspectRatio>
  );
});
OneshotDeviceClient.displayName = "OneshotDeviceClient";

const DeviceClient = forwardRef<DeviceClientHandle, DeviceClientProps>(
  (props, ref) => {
    const [key, setKey] = useState(0);

    return (
      <OneshotDeviceClient
        key={key}
        ref={ref}
        {...props}
        hardReset={() => setKey((k) => k + 1)} // forces a hard reset
      />
    );
  },
);
DeviceClient.displayName = "DeviceClient";

export default DeviceClient;
