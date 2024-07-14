"use client";

import useWebCodecs from "@/components/scrcpy/use-web-codecs.ts";
import { CommandControlMessage } from "@/ws-scrcpy-native/app/controlMessage/CommandControlMessage.ts";
import { ControlMessage } from "@/ws-scrcpy-native/app/controlMessage/ControlMessage.ts";
import { KeyCodeControlMessage } from "@/ws-scrcpy-native/app/controlMessage/KeyCodeControlMessage.ts";
import { DisplayInfo } from "@/ws-scrcpy-native/app/DisplayInfo.ts";
import KeyEvent from "@/ws-scrcpy-native/app/googDevice/android/KeyEvent.ts";
import { StreamClientScrcpy } from "@/ws-scrcpy-native/app/googDevice/client/StreamClientScrcpy.ts";
import { StreamReceiverScrcpy } from "@/ws-scrcpy-native/app/googDevice/client/StreamReceiverScrcpy.ts";
import { WebCodecsPlayer } from "@/ws-scrcpy-native/app/player/WebCodecsPlayer.ts";
import ScreenInfo from "@/ws-scrcpy-native/app/ScreenInfo.ts";
import VideoSettings from "@/ws-scrcpy-native/app/VideoSettings.ts";
import { ACTION } from "@/ws-scrcpy-native/common/Action.ts";
import { ParamsStreamScrcpy } from "@/ws-scrcpy-native/types/ParamsStreamScrcpy";
import { clsx } from "clsx";
import {
  forwardRef,
  RefObject,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import "./minstyles.css";

interface ScrcpyDevicePlayerProps {
  wsPath: string;
  udid: string;
  displayInfo?: DisplayInfo;
  videoSettings?: VideoSettings;
  name?: string;
  fitToScreen?: boolean;
  onDisconnect?: (closeEvent: CloseEvent) => void;
  onConnect?: () => void;
  className?: string;
}

export interface ScrcpyDevicePlayerHandle {
  getVideoSettings: () => VideoSettings;
  setVideoSettings: (videoSettings: VideoSettings) => void;

  getName: () => string;

  getShowQualityStats: () => boolean;
  setShowQualityStats: (showQuality: boolean) => void;

  expandNotification: () => void;
  expandSettings: () => void;
  collapsePanels: () => void;
  rotateDevice: () => void;

  pressDevicePowerButton: (action: "down" | "up") => void;
  pressDeviceVolumeUpButton: (action: "down" | "up") => void;
  pressDeviceVolumeDownButton: (action: "down" | "up") => void;
  pressDeviceBackButton: (action: "down" | "up") => void;
  pressDeviceHomeButton: (action: "down" | "up") => void;
  pressDeviceAppSwitchButton: (action: "down" | "up") => void;

  setKeyboardCapture: (capture: boolean) => void;

  containerRef: RefObject<HTMLDivElement>;
}

// eslint-disable-next-line react/display-name --  set into ScrcpyDevicePlayer
const ScrcpyDevicePlayer = forwardRef<
  ScrcpyDevicePlayerHandle,
  ScrcpyDevicePlayerProps
>((props: ScrcpyDevicePlayerProps, ref) => {
  const {
    wsPath,
    udid,
    displayInfo,
    videoSettings,
    name,
    fitToScreen,
    onConnect,
    onDisconnect,
    className,
  } = props;

  const wcReady = useWebCodecs();

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const streamClient = useRef<StreamClientScrcpy | null>(null);
  const player = useRef<WebCodecsPlayer | null>(null);
  const streamReceiver = useRef<StreamReceiverScrcpy | null>(null);

  useEffect(() => {
    if (!wcReady) {
      return;
    }

    if (!containerRef.current || !canvasRef.current) {
      return; // we need the container & canvas to do it
    }

    const canvas = canvasRef.current;
    const container = containerRef.current;

    const paramsStreamScrcpy = {
      action: ACTION.STREAM_SCRCPY,
      player: "webcodecs",
      udid: udid,
      ws: wsPath,
      fitToScreen: fitToScreen,
      videoSettings: videoSettings,
    } satisfies ParamsStreamScrcpy;

    const newPlayer = new WebCodecsPlayer(udid, displayInfo, canvas);

    const newStreamReceiver = new StreamReceiverScrcpy(paramsStreamScrcpy);

    if (onDisconnect) {
      newStreamReceiver.on("disconnected", onDisconnect);
    }

    streamClient.current = StreamClientScrcpy.start(
      paramsStreamScrcpy,
      container,
      newStreamReceiver,
      newPlayer,
      paramsStreamScrcpy.fitToScreen,
    );
    player.current = newPlayer;
    streamReceiver.current = newStreamReceiver;

    if (onDisconnect) {
      newStreamReceiver.once("disconnected", onDisconnect);
    }

    if (onConnect) {
      newStreamReceiver.once("connected", onConnect);
    }

    return () => {
      newStreamReceiver.destroy();

      streamClient.current = null;
      player.current = null;
      streamReceiver.current = null;

      // size of the container array changes so we need to copy it
      // https://developer.mozilla.org/en-US/docs/Web/API/HTMLCollection
      for (const child of Array.from(container.children)) {
        container.removeChild(child);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- we SHOULD NOT re-run this effect, it's a one-time setup and any changes can be made via the handle since this is so expensive
  }, [wcReady]);

  useImperativeHandle(ref, () => {
    return {
      getVideoSettings: () => {
        if (player.current) {
          return player.current.getVideoSettings();
        }
        return new VideoSettings();
      },
      setVideoSettings: (videoSettings: VideoSettings) => {
        if (streamClient.current) {
          streamClient.current.sendNewVideoSetting(videoSettings);
        }
      },

      getName: () => {
        if (player.current) {
          return player.current.getName();
        }
        return "";
      },

      getDisplayInfo: () => {
        if (player.current) {
          return player.current.getDisplayInfo();
        }
        return undefined;
      },
      setDisplayInfo: (displayInfo: DisplayInfo) => {
        if (player.current) {
          player.current.setDisplayInfo(displayInfo);
        }
      },

      getScreenInfo: () => {
        if (player.current) {
          return player.current.getScreenInfo();
        }
        return undefined;
      },
      setScreenInfo: (screenInfo: ScreenInfo) => {
        if (player.current) {
          player.current.setScreenInfo(screenInfo);
        }
      },

      getShowQualityStats: () => {
        if (player.current) {
          return player.current.getShowQualityStats();
        }
        return false;
      },
      setShowQualityStats: (showQuality: boolean) => {
        if (player.current) {
          player.current.setShowQualityStats(showQuality);
        }
      },

      expandNotification: () => {
        if (streamClient.current) {
          streamClient.current.sendMessage(
            new CommandControlMessage(
              ControlMessage.TYPE_EXPAND_NOTIFICATION_PANEL,
            ),
          );
        }
      },
      expandSettings: () => {
        if (streamClient.current) {
          streamClient.current.sendMessage(
            new CommandControlMessage(
              ControlMessage.TYPE_EXPAND_SETTINGS_PANEL,
            ),
          );
        }
      },
      collapsePanels: () => {
        if (streamClient.current) {
          streamClient.current.sendMessage(
            new CommandControlMessage(ControlMessage.TYPE_COLLAPSE_PANELS),
          );
        }
      },
      rotateDevice: () => {
        if (streamClient.current) {
          streamClient.current.sendMessage(
            new CommandControlMessage(ControlMessage.TYPE_ROTATE_DEVICE),
          );
        }
      },

      pressDevicePowerButton: (action: "up" | "down") => {
        if (streamClient.current) {
          streamClient.current.sendMessage(
            new KeyCodeControlMessage(
              action === "up" ? KeyEvent.ACTION_UP : KeyEvent.ACTION_DOWN,
              KeyEvent.KEYCODE_POWER,
              0,
              0,
            ),
          );
        }
      },
      pressDeviceVolumeUpButton: (action: "up" | "down") => {
        if (streamClient.current) {
          streamClient.current.sendMessage(
            new KeyCodeControlMessage(
              action === "up" ? KeyEvent.ACTION_UP : KeyEvent.ACTION_DOWN,
              KeyEvent.KEYCODE_VOLUME_UP,
              0,
              0,
            ),
          );
        }
      },
      pressDeviceVolumeDownButton: (action: "up" | "down") => {
        if (streamClient.current) {
          streamClient.current.sendMessage(
            new KeyCodeControlMessage(
              action === "up" ? KeyEvent.ACTION_UP : KeyEvent.ACTION_DOWN,
              KeyEvent.KEYCODE_VOLUME_DOWN,
              0,
              0,
            ),
          );
        }
      },
      pressDeviceBackButton: (action: "up" | "down") => {
        if (streamClient.current) {
          streamClient.current.sendMessage(
            new KeyCodeControlMessage(
              action === "up" ? KeyEvent.ACTION_UP : KeyEvent.ACTION_DOWN,
              KeyEvent.KEYCODE_BACK,
              0,
              0,
            ),
          );
        }
      },
      pressDeviceHomeButton: (action: "up" | "down") => {
        if (streamClient.current) {
          streamClient.current.sendMessage(
            new KeyCodeControlMessage(
              action === "up" ? KeyEvent.ACTION_UP : KeyEvent.ACTION_DOWN,
              KeyEvent.KEYCODE_HOME,
              0,
              0,
            ),
          );
        }
      },
      pressDeviceAppSwitchButton: (action: "up" | "down") => {
        if (streamClient.current) {
          streamClient.current.sendMessage(
            new KeyCodeControlMessage(
              action === "up" ? KeyEvent.ACTION_UP : KeyEvent.ACTION_DOWN,
              KeyEvent.KEYCODE_APP_SWITCH,
              0,
              0,
            ),
          );
        }
      },

      setKeyboardCapture: (capture: boolean) => {
        if (streamClient.current) {
          streamClient.current.setHandleKeyboardEvents(capture);
        }
      },

      containerRef,
    };
  }, []);

  return (
    <div ref={containerRef} className={clsx("device-view", className)}>
      <canvas ref={canvasRef} />
    </div>
  );
});

export default ScrcpyDevicePlayer;
