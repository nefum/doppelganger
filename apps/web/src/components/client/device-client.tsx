"use client";

import { getAdbUdidForDevice } from "%/device-info/device-info-utils.ts";
import { getRedroidImage } from "%/device-info/redroid-images.ts";
import {
  LocationPutReturnType,
  LocationPutSendType,
} from "@/app/api/devices/[id]/location/route.ts";
import JSMpegClient from "@/components/client/jsmpeg-client.tsx";
import {
  getOrientationFromRatio,
  getOrientationFromUseOrientationOrientationType,
  Orientation,
} from "@/components/client/orientation.ts";
import FillingAspectRatio from "@/components/filling-aspect-ratio.tsx";
import ScrcpyDevicePlayer, {
  ScrcpyDevicePlayerHandle,
} from "@/components/scrcpy/scrcpy-device-player.tsx";
import { useToast } from "@/components/ui/use-toast.ts";
import { sleep } from "@/utils/promise-utils.ts";
import { CommandControlMessage } from "@/ws-scrcpy/src/app/controlMessage/CommandControlMessage.ts";
import { KeyCodeControlMessage } from "@/ws-scrcpy/src/app/controlMessage/KeyCodeControlMessage";
import KeyEvent, {
  getKeyEventForChar,
} from "@/ws-scrcpy/src/app/googDevice/android/KeyEvent";
import Size from "@/ws-scrcpy/src/app/Size.ts";
import VideoSettings from "@/ws-scrcpy/src/app/VideoSettings.ts";
import type { Device } from "@prisma/client";
import * as Sentry from "@sentry/nextjs";
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
import styles from "../center.module.css";

// 8 MB/s
const DEVICE_BITRATE_BYTES = 8_000_000;
// for some bizzarre reason, the video is always a bit too small, so we overscan it
const OVERSCAN_MULTIPLIER = 1.025;
// we need to wait a bit between each key press to let the result transmit to the device
const PASTE_SLEEP_WAIT_TIME_MS = 100; // according to claude, 100ms is the average keypress duration of a human, so it's a good value

interface DeviceClientProps {
  device: Device;
  loadingNode: ReactNode;

  captureKeyboard?: boolean;
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
  | "getVideoSettings"
  | "setVideoSettings"
  | "containerRef"
  | "getName"
  | "streamClientRef"
  | "getKeyboardCapture"
  | "setKeyboardCapture"
> & {
  doPaste: () => void;
};

// this is called the oneshot device client because it cannot rerender itself from scratch in case of an error, it excepts a function that can do that
const OneshotDeviceClient = forwardRef<
  DeviceClientHandle,
  OneshotDeviceClientProps
>((props, ref) => {
  const {
    device,
    loadingNode,
    captureKeyboard,
    playAudio,
    autoRotate,
    hardReset,
  } = props;
  const deviceRedroidImage = getRedroidImage(device.redroidImage)!;

  const { type: orientationType } = useOrientation();

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

    const clientOrientation =
      getOrientationFromUseOrientationOrientationType(orientationType);
    const streamOrientation = getOrientationFromRatio(aspectRatio);

    if (clientOrientation === Orientation.INDETERMINATE) {
      return;
    }

    if (clientOrientation === streamOrientation) {
      return; // orientations match we needn't do anything
    }

    if (!scrcpyClientRef.current) {
      return;
    }

    scrcpyClientRef.current.rotateDevice();
  }, [aspectRatio, autoRotate, orientationType]);

  useEffect(() => {
    const scrcpyWsUrl = new URL(window.location.href);
    scrcpyWsUrl.protocol = scrcpyWsUrl.protocol === "https:" ? "wss" : "ws";
    scrcpyWsUrl.pathname = `/api/devices/${device.id}/scrcpy`;
    setScrcpyWsUrlString(scrcpyWsUrl.toString());

    const jsmpegWsUrl = new URL(window.location.href);
    jsmpegWsUrl.protocol = jsmpegWsUrl.protocol === "https:" ? "wss" : "ws";
    jsmpegWsUrl.pathname = `/api/devices/${device.id}/jsmpeg`;
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

  useEffect(() => {
    if (!sizerRef.current) {
      return;
    }

    const resizeObserver = new ResizeObserver(updateBoundsRuntime);

    resizeObserver.observe(sizerRef.current);
    return () => {
      resizeObserver.disconnect();
    };
  }, [updateBoundsRuntime]);

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

  useEffect(() => {
    if (!connected && !scrcpyClientRef.current) {
      return;
    }

    const scrcpyContainer = scrcpyClientRef.current!.containerRef.current!;
    const resizeObserver = new ResizeObserver(handleRatioChange);

    resizeObserver.observe(scrcpyContainer);
    return () => {
      resizeObserver.disconnect();
    };
  }, [connected, handleRatioChange]);

  // turn on keyboard processing when a key is pressed
  useEffect(() => {
    // reference: apps/web/src/ws-scrcpy/src/app/googDevice/KeyInputHandler.ts line 13 for handling
    // does e.preventDefault();

    if (!captureKeyboard) {
      if (!scrcpyClientRef.current) {
        return;
      }

      scrcpyClientRef.current.setKeyboardCapture(false);
    }

    function keydown(e: KeyboardEvent) {
      if (!scrcpyClientRef.current) {
        return;
      }

      scrcpyClientRef.current.setKeyboardCapture(true);
    }

    document.addEventListener("keydown", keydown);
    return () => {
      document.removeEventListener("keydown", keydown);
      if (scrcpyClientRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps -- refs don't change
        scrcpyClientRef.current.setKeyboardCapture(false);
      }
    };
  }, [captureKeyboard]);

  const doPaste = useMemo(
    () => () => {
      navigator.clipboard.readText().then(async (text) => {
        if (
          !scrcpyClientRef.current ||
          !scrcpyClientRef.current.streamClientRef.current
        ) {
          return;
        }

        const streamClient = scrcpyClientRef.current.streamClientRef.current;

        // andorid >=12 (sdk >= 31) needs a permission to paste, so it will be easier to just send keys for letters in the clipboard
        if (deviceRedroidImage.androidSdkVersion >= 31) {
          // we wait a little between each key press to let the result transmit to the device
          for (const char of text) {
            const [keyCode, needShift] = getKeyEventForChar(char);
            const metaState = needShift ? KeyEvent.META_SHIFT_ON : 0;

            if (keyCode === KeyEvent.KEYCODE_UNKNOWN) {
              continue; // we don't know how to type this character
            }

            streamClient.sendMessage(
              new KeyCodeControlMessage(
                KeyEvent.ACTION_DOWN,
                keyCode,
                0,
                metaState,
              ),
            );
            await sleep(PASTE_SLEEP_WAIT_TIME_MS);

            streamClient.sendMessage(
              new KeyCodeControlMessage(
                KeyEvent.ACTION_UP,
                keyCode,
                0,
                metaState,
              ),
            );
            await sleep(PASTE_SLEEP_WAIT_TIME_MS);
          }
          return;
        } else {
          // we can use native paste
          streamClient.sendMessage(
            CommandControlMessage.createSetClipboardCommand(text, true),
          );
        }
      });
    },
    [deviceRedroidImage.androidSdkVersion],
  );

  // commented out because it causes refreshing on iOS
  // // although this is slightly inefficient, it doesn't matter since there will already be SO much js running on the client during stream time that it's inconsequential
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     updateBoundsRuntime();
  //   }, 1_000);
  //
  //   return () => clearInterval(interval);
  // }, [updateBoundsRuntime]);

  // when tabbing back & resuming streaming, it can reset the bounds to the initial bounds, so we need to update them
  useEffect(() => {
    function handleVisibilityChange() {
      setTimeout(() => {
        if (document.visibilityState === "visible") {
          updateBoundsRuntime();
        }
      }, 300); // wait a bit for the tab switching to finish
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [updateBoundsRuntime]);

  // there are only two events that can reliably be captured: keydown & keyup
  // everything else, paste, touch, pointer, etc. is completely suppressed by the client.
  // this gives us some trouble because we can't get a paste event, but we CAN listen to a keydown for ctrl+v or cmd+v
  // and then read the clipboard
  useEffect(() => {
    if (!captureKeyboard) {
      return;
    }

    function keydown(e: KeyboardEvent) {
      if (e.key === "v" && (e.ctrlKey || e.metaKey)) doPaste();
    }

    document.addEventListener("keydown", keydown);
    return () => document.removeEventListener("keydown", keydown);
  }, [captureKeyboard, doPaste]);

  // location providing
  useEffect(() => {
    async function locationCallback(position: GeolocationPosition) {
      // this does not destructure properly for a reason unbeknownst to me
      const {
        latitude,
        longitude,
        altitude,
        accuracy,
        altitudeAccuracy,
        heading,
        speed,
      } = position.coords;
      const timestamp = position.timestamp;

      const locationPayload: LocationPutSendType = {
        latitude,
        longitude,
        altitude,
        accuracy,
        altitudeAccuracy,
        heading,
        speed,
        timestamp,
      };

      let response: Response;
      try {
        response = await fetch(`/api/devices/${device.id}/location`, {
          method: "PUT",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(locationPayload),
        });
      } catch (e: any) {
        console.error("Failed to send location", e);
        Sentry.captureException(e);
        return;
      }
      let responseJson: LocationPutReturnType;
      try {
        responseJson = await response.json();
      } catch (e: any) {
        console.error("Failed to parse location response", e);
        Sentry.captureException(e);
        return;
      }

      if (responseJson.error || !response.ok) {
        console.error("Failed to send location", responseJson.error);
        return;
      }

      console.log("Location sent successfully");
    }

    function locationError(error: GeolocationPositionError) {
      switch (error.code) {
        case error.PERMISSION_DENIED:
          toast({
            title: "Location Permission Denied",
            description:
              "Location passthrough will be disabled until you enable location access.",
          });
          break;
        case error.POSITION_UNAVAILABLE:
          toast({
            title: "Location Unavailable",
            description: "Your location could not be determined.",
          });
          break;
        case error.TIMEOUT:
          toast({
            title: "Location Timeout",
            description: "The request to get your location timed out.",
          });
          break;
        default:
          toast({
            title: "Location Error",
            description:
              "An unknown error occurred while getting your location.",
          });
          Sentry.captureException(error);
          break;
      }
    }

    const locationWatchId = navigator.geolocation.watchPosition(
      locationCallback,
      locationError,
    );

    return () => navigator.geolocation.clearWatch(locationWatchId);
  }, [device.id, toast]);

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
      doPaste,
    };
  }, [doPaste]);

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
