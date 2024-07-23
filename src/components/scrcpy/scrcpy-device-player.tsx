"use client";

import { CommandControlMessage } from "@/ws-scrcpy/src/app/controlMessage/CommandControlMessage.ts";
import { ControlMessage } from "@/ws-scrcpy/src/app/controlMessage/ControlMessage.ts";
import { KeyCodeControlMessage } from "@/ws-scrcpy/src/app/controlMessage/KeyCodeControlMessage.ts";
import { DisplayInfo } from "@/ws-scrcpy/src/app/DisplayInfo.ts";
import KeyEvent from "@/ws-scrcpy/src/app/googDevice/android/KeyEvent.ts";
import { StreamClientScrcpy } from "@/ws-scrcpy/src/app/googDevice/client/StreamClientScrcpy.ts";
import { StreamReceiverScrcpy } from "@/ws-scrcpy/src/app/googDevice/client/StreamReceiverScrcpy.ts";
import { BasePlayer } from "@/ws-scrcpy/src/app/player/BasePlayer.ts";
import { TinyH264Player } from "@/ws-scrcpy/src/app/player/TinyH264Player.ts";
import { WebCodecsPlayer } from "@/ws-scrcpy/src/app/player/WebCodecsPlayer.ts";
import ScreenInfo from "@/ws-scrcpy/src/app/ScreenInfo.ts";
import VideoSettings from "@/ws-scrcpy/src/app/VideoSettings.ts";
import { ACTION } from "@/ws-scrcpy/src/common/Action.ts";
import { ParamsStreamScrcpy } from "@/ws-scrcpy/src/types/ParamsStreamScrcpy";
import { clsx } from "clsx";
import {
  forwardRef,
  MutableRefObject,
  RefObject,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
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

  getKeyboardCapture: () => boolean;
  setKeyboardCapture: (capture: boolean) => void;

  containerRef: RefObject<HTMLDivElement>;
  streamClientRef: MutableRefObject<StreamClientScrcpy | null>;
}

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
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const streamClient = useRef<StreamClientScrcpy | null>(null);
  const player = useRef<BasePlayer | null>(null);
  const streamReceiver = useRef<StreamReceiverScrcpy | null>(null);

  // we are the only one who can change keyboard events, so this state must therefore always be accurate
  const [keyboardListening, setKeyboardListening] = useState(false);

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) {
      return; // we need the container & canvas to do it
    }

    const canvas = canvasRef.current;
    const container = containerRef.current;

    // options for the non-webcodecs player are either tinyh264 or broadway
    // both have been untouched for ages and neither are production-viable

    // tinyh264 is faster and uses webworkers
    // broadway isn't even on npm

    // and also broadway is broken in webpack5 and it will take forever to fix ‼️

    // the choice is relatively obvious

    type ScrcpySupportedPlayerName = "webcodecs" | "tinyh264" | "broadway";
    let playerName: ScrcpySupportedPlayerName;

    const webWorkerSupported = typeof Worker !== "undefined";

    if (WebCodecsPlayer.isSupported()) {
      playerName = "webcodecs";
    } else {
      console.warn(
        "tinyh264 is not production-viable, consider using a browser that natively supports webcodecs",
      );
      playerName = "tinyh264";
    }

    if (
      playerName == "tinyh264" &&
      (!TinyH264Player.isSupported() || !webWorkerSupported)
    ) {
      console.warn(
        "had to fallback to tinyh264 and we aren't sure if its supported, possible failure imbound",
      );
    }

    const paramsStreamScrcpy = {
      action: ACTION.STREAM_SCRCPY,
      player: playerName,
      udid: udid,
      ws: wsPath,
      fitToScreen: fitToScreen,
      videoSettings: videoSettings,
    } satisfies ParamsStreamScrcpy;

    let newPlayer: BasePlayer;
    switch (playerName) {
      // case "broadway":
      //   newPlayer = new BroadwayPlayer(udid, displayInfo, canvas);
      //   break;
      case "webcodecs":
        newPlayer = new WebCodecsPlayer(udid, displayInfo, canvas);
        break;
      case "tinyh264":
        newPlayer = new TinyH264Player(udid, displayInfo, canvas);
        break;
    }

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
  }, []);

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

      getKeyboardCapture: () => {
        return keyboardListening;
      },
      setKeyboardCapture: (capture: boolean) => {
        if (streamClient.current) {
          setKeyboardListening(capture);
          streamClient.current.setHandleKeyboardEvents(capture);
        }
      },

      containerRef,
      streamClientRef: streamClient,
    };
  }, [keyboardListening]);

  return (
    <div
      ref={containerRef}
      className={clsx("device-view", className)}
      contentEditable={true}
      inputMode={"none"}
    >
      <canvas ref={canvasRef} />
    </div>
  );
});
ScrcpyDevicePlayer.displayName = "ScrcpyDevicePlayer";

export default ScrcpyDevicePlayer;
