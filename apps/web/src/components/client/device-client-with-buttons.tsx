"use client";

import DeviceClient, {
  DeviceClientHandle,
} from "@/components/client/device-client.tsx";
import MaxWidthHardlimiter from "@/components/max-width-hardlimiter.tsx";
import { Button } from "@/components/ui/button.tsx";
import { SimpleTooltip } from "@/components/ui/tooltip.tsx";
import { useToast } from "@/components/ui/use-toast.ts";
import type { Device } from "@prisma/client";
import * as Sentry from "@sentry/nextjs";
import { clsx } from "clsx";
import { ReactNode, RefObject, useEffect, useRef, useState } from "react";
import {
  FullScreen,
  FullScreenHandle,
  useFullScreenHandle,
} from "react-full-screen";
import { BsVolumeDown, BsVolumeUp } from "react-icons/bs";
import { FaArrowsRotate, FaKeyboard } from "react-icons/fa6";
import { IoStatsChartOutline } from "react-icons/io5";
import {
  LuCircle,
  LuClipboardPaste,
  LuLoader2,
  LuPower,
  LuSettings2,
  LuSquare,
  LuTriangle,
} from "react-icons/lu";
import { MdOutlineSpeaker } from "react-icons/md";
import { RiNotification2Line } from "react-icons/ri";
import { RxEnterFullScreen, RxExitFullScreen } from "react-icons/rx";
import OneSignal from "react-onesignal";
import styles from "./client.module.css";

function ButtonbarButton({
  onPress,
  onRelease,
  children,
  label,
}: Readonly<{
  onPress: () => void;
  onRelease?: () => void;
  children: ReactNode;
  label: string;
}>): ReactNode {
  return (
    <SimpleTooltip content={label}>
      <Button
        variant="ghost"
        size="icon"
        onMouseDown={onPress}
        onMouseUp={onRelease}
        onTouchStart={onPress}
        onTouchEnd={onRelease}
        onTouchCancel={onRelease}
      >
        {children}
      </Button>
    </SimpleTooltip>
  );
}

interface ButtonBarProps {
  clientRef: RefObject<DeviceClientHandle>;
  fullScreenHandle: FullScreenHandle;

  optionalAudio?: boolean;
  playAudio: boolean;
  setPlayAudio: (value: boolean) => void;

  optionalKeyboardCapture?: boolean;
  captureKeyboard: boolean;
  setCaptureKeyboard: (value: boolean) => void;
}

function ButtonBar({
  clientRef,
  fullScreenHandle,

  optionalAudio,
  playAudio,
  setPlayAudio,

  optionalKeyboardCapture,
  captureKeyboard,
  setCaptureKeyboard,
}: Readonly<ButtonBarProps>): ReactNode {
  // this is only available through a getter
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    if (clientRef.current) {
      setStatsVisible(clientRef.current.getShowQualityStats());
    }
  }, [clientRef]);

  return (
    <div className="flex flex-row justify-center">
      {/*qualityStats from client ref*/}
      <ButtonbarButton
        onPress={() => {
          if (clientRef.current) {
            clientRef.current.setShowQualityStats(!statsVisible);
            setStatsVisible(!statsVisible);
          }
        }}
        label={statsVisible ? "Hide Stats" : "Show Stats"}
      >
        <IoStatsChartOutline
          className={clsx("h-5 w-5", {
            "text-blue-500": statsVisible,
          })}
        />
      </ButtonbarButton>

      {/*audio, if optionalCapture !== undefined*/}
      {optionalAudio !== undefined && (
        <ButtonbarButton
          onPress={() => {
            setPlayAudio(!playAudio);
          }}
          label={playAudio ? "Mute Audio" : "Unmute Audio"}
        >
          <MdOutlineSpeaker
            className={clsx("h-5 w-5", {
              "text-blue-500": playAudio,
            })}
          />
        </ButtonbarButton>
      )}

      {/*keyboard capture, if optionalKeyboardCapture !== undefined*/}
      {optionalKeyboardCapture !== undefined && (
        <ButtonbarButton
          onPress={() => {
            setCaptureKeyboard(!captureKeyboard);
          }}
          label={captureKeyboard ? "Release Keyboard" : "Capture Keyboard"}
        >
          <FaKeyboard
            className={clsx("h-5 w-5", {
              "text-blue-500": captureKeyboard,
            })}
          />
        </ButtonbarButton>
      )}

      <ButtonbarButton
        onPress={() => {
          if (clientRef.current) {
            clientRef.current.doPaste();
          }
        }}
        label={"Paste Clipboard"}
      >
        <LuClipboardPaste className="h-5 w-5" />
      </ButtonbarButton>

      {/* instantaneous only */}
      <ButtonbarButton
        onPress={() => {
          if (clientRef.current) {
            clientRef.current.expandNotification();
          }
        }}
        label={"Show Notifications"}
      >
        <RiNotification2Line className="h-5 w-5" />
      </ButtonbarButton>
      <ButtonbarButton
        onPress={() => {
          if (clientRef.current) {
            clientRef.current.expandSettings();
          }
        }}
        label={"Show Quick Settings"}
      >
        <LuSettings2 className="h-5 w-5" />
      </ButtonbarButton>
      <ButtonbarButton
        onPress={() => {
          if (clientRef.current) {
            clientRef.current.rotateDevice();
          }
        }}
        label={"Rotate Device"}
      >
        <FaArrowsRotate className="h-5 w-5" />
      </ButtonbarButton>

      <ButtonbarButton
        onPress={() => {
          if (clientRef.current) {
            clientRef.current.pressDevicePowerButton("down");
          }
        }}
        onRelease={() => {
          if (clientRef.current) {
            clientRef.current.pressDevicePowerButton("up");
          }
        }}
        label={"Press Power Button"}
      >
        <LuPower className="h-5 w-5" />
      </ButtonbarButton>
      <ButtonbarButton
        onPress={() => {
          if (clientRef.current) {
            clientRef.current.pressDeviceVolumeUpButton("down");
          }
        }}
        onRelease={() => {
          if (clientRef.current) {
            clientRef.current.pressDeviceVolumeUpButton("up");
          }
        }}
        label={"Volume Up"}
      >
        <BsVolumeUp className="h-5 w-5" />
      </ButtonbarButton>
      <ButtonbarButton
        onPress={() => {
          if (clientRef.current) {
            clientRef.current.pressDeviceVolumeDownButton("down");
          }
        }}
        onRelease={() => {
          if (clientRef.current) {
            clientRef.current.pressDeviceVolumeDownButton("up");
          }
        }}
        label={"Volume Down"}
      >
        <BsVolumeDown className="h-5 w-5" />
      </ButtonbarButton>
      <ButtonbarButton
        onPress={() => {
          if (clientRef.current) {
            clientRef.current.pressDeviceBackButton("down");
          }
        }}
        onRelease={() => {
          if (clientRef.current) {
            clientRef.current.pressDeviceBackButton("up");
          }
        }}
        label={"Back"}
      >
        <LuTriangle className="h-5 w-5 -rotate-90" />
      </ButtonbarButton>
      <ButtonbarButton
        onPress={() => {
          if (clientRef.current) {
            clientRef.current.pressDeviceHomeButton("down");
          }
        }}
        onRelease={() => {
          if (clientRef.current) {
            clientRef.current.pressDeviceHomeButton("up");
          }
        }}
        label={"Home"}
      >
        <LuCircle className="h-5 w-5" />
      </ButtonbarButton>
      <ButtonbarButton
        onPress={() => {
          if (clientRef.current) {
            clientRef.current.pressDeviceAppSwitchButton("down");
          }
        }}
        onRelease={() => {
          if (clientRef.current) {
            clientRef.current.pressDeviceAppSwitchButton("up");
          }
        }}
        label={"App Switch"}
      >
        <LuSquare className="h-5 w-5" />
      </ButtonbarButton>

      <ButtonbarButton
        onPress={() => {
          if (fullScreenHandle.active) {
            fullScreenHandle.exit();
          } else {
            fullScreenHandle.enter();
          }
        }}
        label="Toggle Fullscreen"
      >
        {fullScreenHandle.active ? (
          <RxExitFullScreen className="h-5 w-5" />
        ) : (
          <RxEnterFullScreen className="h-5 w-5" />
        )}
      </ButtonbarButton>
    </div>
  );
}

interface DeviceClientWithButtonsProps {
  device: Device;

  optionalKeyboardCapture?: boolean;
  optionalAudio?: boolean;

  outerMostClassName?: string;
  widthLimiterClassName?: string;
  fullscreenInnerContainerClassName?: string;

  forceFullScreenHandling?: boolean;
}

export default function DeviceClientWithButtons({
  device,
  optionalAudio,
  optionalKeyboardCapture,
  outerMostClassName,
  widthLimiterClassName,
  fullscreenInnerContainerClassName,
  forceFullScreenHandling,
}: Readonly<DeviceClientWithButtonsProps>) {
  const deviceClientHandleRef = useRef<DeviceClientHandle>(null);
  const fullScreenHandle = useFullScreenHandle();
  // allows customization in multiview
  const handleAsFullScreen = forceFullScreenHandling || fullScreenHandle.active;

  const [playAudio, setPlayAudio] = useState(!optionalAudio);
  const [captureKeyboard, setCaptureKeyboard] = useState(
    !optionalKeyboardCapture,
  );

  const { toast } = useToast();

  useEffect(() => {
    if (!OneSignal.Notifications.permission) {
      OneSignal.Notifications.requestPermission().catch((e) => {
        console.error("Failed to request notification permission", e);
        toast({
          title: "Failed to enable notification passthrough",
          description: "Try disabling your adblocker",
        });
        Sentry.captureException(e);
      });
    }
  }, [toast]);

  return (
    <div className={outerMostClassName}>
      <MaxWidthHardlimiter className={widthLimiterClassName}>
        <FullScreen
          handle={fullScreenHandle}
          className={clsx(fullscreenInnerContainerClassName, {
            "flex flex-col justify-between": handleAsFullScreen,
            "h-full w-full": !handleAsFullScreen,
          })}
        >
          <div
            // i have long tried to remove the minimum height, but it is not worth it.
            className={clsx(
              "flex justify-center items-center place-items-center w-full",
              styles.fullscreenInnerContainer,
              {
                "min-h-[35vh] max-h-[70vh]": !handleAsFullScreen,
                "flex-grow max-h-[93%]": handleAsFullScreen,
              },
            )}
          >
            {/*theres no need to worry about resource freeing, this client isn't created when this page isn't open*/}
            <DeviceClient
              ref={deviceClientHandleRef}
              device={device}
              loadingNode={<LuLoader2 className="h-20 w-20 animate-spin" />}
              captureKeyboard={captureKeyboard}
              playAudio={playAudio}
            />
          </div>
          <div className={clsx("flex flex-col justify-end align-middle")}>
            <div
              className={clsx({
                "my-2 mx-2": handleAsFullScreen,
              })}
            >
              <ButtonBar
                clientRef={deviceClientHandleRef}
                fullScreenHandle={fullScreenHandle}
                optionalAudio={optionalAudio}
                playAudio={playAudio}
                setPlayAudio={setPlayAudio}
                optionalKeyboardCapture={optionalKeyboardCapture}
                captureKeyboard={captureKeyboard}
                setCaptureKeyboard={setCaptureKeyboard}
              />
            </div>
          </div>
        </FullScreen>
      </MaxWidthHardlimiter>
    </div>
  );
}
