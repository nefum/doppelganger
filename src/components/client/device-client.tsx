"use client";

import { getUdidForDevice } from "%/device-info/device-info.ts";
import ScrcpyDevicePlayer, {
  ScrcpyDevicePlayerHandle,
} from "@/components/scrcpy/scrcpy-device-player.tsx";
import { AspectRatio } from "@/components/ui/aspect-ratio.tsx";
import { Button } from "@/components/ui/button.tsx";
import { useToast } from "@/components/ui/use-toast.ts";
import useOnInteraction from "@/utils/hooks/use-on-interaction.ts"; // doesn't exist at runtime; type-only
import Size from "@/ws-scrcpy/src/app/Size.ts";
import VideoSettings from "@/ws-scrcpy/src/app/VideoSettings.ts";
import JSMpeg from "@cycjimmy/jsmpeg-player";
import { Device } from "@prisma/client";
import type { Player } from "jsmpeg";
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

const JSMpegVideoElement = JSMpeg.VideoElement;
const JSMpegPlayer = JSMpeg.Player || JSMpegVideoElement.player;

const MOBILE_BITRATE_BYTES = 800_0000;
const MOBILE_IFRAME_INTERVAL = 10;
const OVERSCAN_MULTIPLIER = 1.05;
const RESIZE_DEBOUNCE = 100;

interface DeviceClientProps {
  device: Device;
  loadingNode: ReactNode;

  className?: string;
  givenMaxWidth?: number;

  autoCaptureKeyboard?: boolean;
}

function getInitialMaxSize(device: Device): Size {
  return new Size(device.redroidHeight, device.redroidWidth);
}

export type DeviceClientHandle = Omit<
  ScrcpyDevicePlayerHandle,
  "getVideoSettings" | "setVideoSettings" | "containerRef" | "getName"
>;

/**
 * A client to connect to an Android device using ws-scrcpy. See the full props list and the handle for customizable behaviour.
 */
const DeviceClient = forwardRef<DeviceClientHandle, DeviceClientProps>(
  (props, ref) => {
    const {
      device,
      loadingNode,
      className,
      givenMaxWidth,
      autoCaptureKeyboard,
    } = props;

    const { toast } = useToast();

    const [aspectRatio, setAspectRatio] = useState(
      device.redroidWidth / device.redroidHeight,
    );

    const parentRef = useRef<HTMLDivElement>(null);
    const scrcpyClientRef = useRef<ScrcpyDevicePlayerHandle>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const sizerRef = useRef<HTMLImageElement>(null);
    const audioCanvasRef = useRef<HTMLCanvasElement>(null);

    const jsmpegPlayerRef = useRef<Player | null>();

    const [scrcpyWsUrlString, setScrcpyWsUrlString] = useState<string | null>(
      null,
    );
    const [jsmpegWsUrlString, setJsmpegWsUrlString] = useState<string | null>(
      null,
    );

    const [connected, setConnected] = useState(false);

    const interacted = useOnInteraction(containerRef);

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
      if (jsmpegPlayerRef.current || !audioCanvasRef.current) {
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
              <Button onClick={() => window.location.reload()}>
                Reconnect
              </Button>
            ),
          });
        },
        onStalled: (player: Player) => {
          toast({
            title: "Audio Stalled; is your connection ok?",
            description: (
              <Button onClick={() => window.location.reload()}>
                Reconnect
              </Button>
            ),
          });
        },
      });

      jsmpegPlayerRef.current = player;

      return () => {
        player.destroy();
        jsmpegPlayerRef.current = null;
      };
    }, [jsmpegPlayerRef, interacted, jsmpegWsUrlString, toast]);

    const createVideoSettingsWithBound = useMemo(
      () => (bounds: Size) => {
        return new VideoSettings({
          bitrate: MOBILE_BITRATE_BYTES,
          maxFps: device.redroidFps,
          iFrameInterval: MOBILE_IFRAME_INTERVAL,
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

    const [aspectRatioWidth, setAspectRatioWidth] = useState("100%"); // Default width

    const setAspectRatioWidthWithoutOverflow = useMemo(() => {
      return (requestedWidth: string) => {
        if (!parentRef.current) {
          return;
        }

        const parentParent = parentRef.current.parentElement!;

        if (requestedWidth.endsWith("px")) {
          // don't allow it to overflow
          const requestedWidthPx = parseInt(requestedWidth.slice(0, -2));
          const maxWidth = parentParent.clientWidth;
          const acceptableMaxWidth = givenMaxWidth ?? maxWidth + 30; // give it a little bit of room for resizing

          if (requestedWidthPx > acceptableMaxWidth) {
            setAspectRatioWidth(`${givenMaxWidth ?? maxWidth}px`);
            return;
          }
        }

        setAspectRatioWidth(requestedWidth);
      };
    }, [givenMaxWidth]);

    useEffect(() => {
      if (!parentRef.current) {
        return;
      }

      const calculateWidth = () => {
        if (!parentRef.current) {
          return;
        }

        const viewportHeightPx = parentRef.current.parentElement!.clientHeight;
        const widthPx = aspectRatio * viewportHeightPx;
        return `${widthPx}px`;
      };

      const width = calculateWidth()!;
      setAspectRatioWidth(width);

      const resizeObserver = new ResizeObserver(() => {
        setAspectRatioWidthWithoutOverflow(calculateWidth()!);
      });

      resizeObserver.observe(parentRef.current!);

      return () => {
        resizeObserver.disconnect();
      };
    }, [aspectRatio, setAspectRatioWidthWithoutOverflow]);

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
      <div ref={parentRef} style={{ width: aspectRatioWidth }}>
        <AspectRatio
          ratio={aspectRatio}
          ref={containerRef}
          className={className}
        >
          {/*this is SO hacky but it's the best way to do the scrcpydevicehelper with react bindings*/}
          {/*eslint-disable-next-line @next/next/no-img-element -- placeholder*/}
          <img
            ref={sizerRef}
            className="h-full w-full object-cover opacity-0"
            src="/placeholder.svg"
            alt={`${device.name} live stream`}
          />
          <div className={styles.absolutelyCenteredItem}>
            <Suspense fallback={loadingNode}>
              {(scrcpyWsUrlString && (
                <ScrcpyDevicePlayer
                  ref={scrcpyClientRef}
                  wsPath={scrcpyWsUrlString}
                  udid={getUdidForDevice(device)}
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
            {!connected && scrcpyClientRef.current && loadingNode}
          </div>
          <canvas ref={audioCanvasRef} className="h-0 w-0" />
        </AspectRatio>
      </div>
    );
  },
);
DeviceClient.displayName = "DeviceClient";

export default DeviceClient;
