"use client";

import DeviceClient, {
  DeviceClientHandle,
} from "@/components/client/device-client.tsx";
import { Button } from "@/components/ui/button.tsx";
import { SimpleTooltip } from "@/components/ui/tooltip.tsx";
import type { Device } from "@prisma/client";
import { ReactNode, RefObject, useRef } from "react";
import {
  FullScreen,
  FullScreenHandle,
  useFullScreenHandle,
} from "react-full-screen";
import { BsVolumeDown, BsVolumeUp } from "react-icons/bs";
import { FaArrowsRotate } from "react-icons/fa6";
import {
  LuCircle,
  LuLoader2,
  LuPower,
  LuSettings2,
  LuSquare,
  LuTriangle,
} from "react-icons/lu";
import { RiNotification2Line } from "react-icons/ri";
import { RxEnterFullScreen, RxExitFullScreen } from "react-icons/rx";

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

function ButtonBar({
  clientRef,
  fullScreenHandle,
}: Readonly<{
  clientRef: RefObject<DeviceClientHandle>;
  fullScreenHandle: FullScreenHandle;
}>): ReactNode {
  return (
    <div className="flex flex-row justify-center">
      {/*no option to show quality stats, don't expose that to the user*/}

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

export default function DeviceClientWithButtons({
  device,
}: Readonly<{ device: Device }>) {
  const deviceClientHandleRef = useRef<DeviceClientHandle>(null);
  const fullScreenHandle = useFullScreenHandle();

  return (
    <FullScreen handle={fullScreenHandle}>
      <div
        // i have long tried to remove the minimum height, but it is not worth it.
        className="flex justify-center items-center place-items-center w-full min-h-[35vh] max-h-[70vh]"
      >
        {/*theres no need to worry about resource freeing, this client isn't created when this page isn't open*/}
        <DeviceClient
          ref={deviceClientHandleRef}
          device={device}
          loadingNode={<LuLoader2 className="h-20 w-20 animate-spin" />}
          autoCaptureKeyboard
          playAudio
        />
      </div>
      <ButtonBar
        clientRef={deviceClientHandleRef}
        fullScreenHandle={fullScreenHandle}
      />
    </FullScreen>
  );
}