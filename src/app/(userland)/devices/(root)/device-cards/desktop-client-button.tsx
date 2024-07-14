import DeviceClient, {
  DeviceClientHandle,
} from "@/components/client/device-client.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog.tsx";
import { SimpleTooltip } from "@/components/ui/tooltip.tsx";
import { Device } from "@prisma/client";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { ReactNode, RefObject, useEffect, useRef, useState } from "react";
import { BsVolumeDown, BsVolumeUp } from "react-icons/bs";
import { FaArrowsRotate } from "react-icons/fa6";
import {
  LuCircle,
  LuLoader2,
  LuMousePointer2,
  LuPower,
  LuSettings2,
  LuSquare,
  LuTriangle,
} from "react-icons/lu";
import { RiNotification2Line } from "react-icons/ri";

const desktopClientTooltip = "Interact";

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
        className="my-2"
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
}: Readonly<{ clientRef: RefObject<DeviceClientHandle> }>): ReactNode {
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
    </div>
  );
}

function MaxWidthSetter({
  containerRef,
  maxWidth,
  setMaxWidth,
}: Readonly<{
  containerRef: RefObject<HTMLDivElement>;
  maxWidth: number | undefined;
  setMaxWidth: (maxWidth: number) => void;
}>): ReactNode {
  useEffect(() => {
    if (containerRef.current && maxWidth === undefined) {
      setMaxWidth(containerRef.current.clientWidth);
    }
  }, [containerRef, maxWidth, setMaxWidth]);

  return null;
}

export default function DesktopClientButton({
  deviceInfo,
  dialogOpen,
  setDialogOpen,
}: Readonly<{
  deviceInfo: Device;
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
}>) {
  const ref = useRef<DeviceClientHandle>(null);
  const clientContainerRef = useRef<HTMLDivElement>(null);
  const [clientMaxWidth, setClientMaxWidth] = useState<number | undefined>(
    undefined,
  );

  // top-level effects in this component will run when the dialog is first loaded, but won't be very effective.

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <SimpleTooltip content={desktopClientTooltip}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon">
            <LuMousePointer2 className="h-5 w-5" />
            <span className="sr-only">{desktopClientTooltip}</span>
          </Button>
        </DialogTrigger>
      </SimpleTooltip>
      <DialogContent>
        <DialogHeader>{deviceInfo.name}</DialogHeader>
        <VisuallyHidden.Root>
          <DialogDescription>
            Interactive stream for {deviceInfo.name}
          </DialogDescription>
        </VisuallyHidden.Root>
        <div
          className="flex justify-center w-full min-h-[25vh] max-h-[70vh]"
          ref={clientContainerRef}
        >
          <MaxWidthSetter
            containerRef={clientContainerRef}
            maxWidth={clientMaxWidth}
            setMaxWidth={setClientMaxWidth}
          />
          {/*theres no need to worry about resource freeing, this client isn't created when this page isn't open*/}
          <DeviceClient
            ref={ref}
            className="flex justify-center items-center place-items-center"
            device={deviceInfo}
            loadingNode={<LuLoader2 className="h-20 w-20 animate-spin" />}
            givenMaxWidth={clientMaxWidth}
            autoCaptureKeyboard
          />
        </div>
        <ButtonBar clientRef={ref} />
      </DialogContent>
    </Dialog>
  );
}
