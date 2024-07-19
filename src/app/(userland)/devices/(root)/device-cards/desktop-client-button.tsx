import {
  mobileClientTooltip,
  mobileClientTooltipIcon,
} from "@/app/(userland)/devices/(root)/device-cards/mobile-client-button.tsx";
import pwaClickHandler from "@/app/(userland)/devices/(root)/device-cards/pwa-click-handler.ts";
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
import { useToast } from "@/components/ui/use-toast.ts";
import { Device } from "@prisma/client";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { useRouter } from "next/navigation";
import { ReactNode, RefObject, useRef } from "react";
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
import { useMediaQuery } from "usehooks-ts";

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
  openMobileDialog,
}: Readonly<{
  clientRef: RefObject<DeviceClientHandle>;
  openMobileDialog: () => void;
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
          openMobileDialog();
        }}
        label={mobileClientTooltip}
      >
        {mobileClientTooltipIcon}
      </ButtonbarButton>
    </div>
  );
}

export default function DesktopClientButton({
  deviceInfo,
  dialogOpen,
  deviceIsUp,
  setDialogOpen,
  openMobileDialog,
}: Readonly<{
  deviceInfo: Device;
  dialogOpen: boolean;
  deviceIsUp: boolean;
  setDialogOpen: (open: boolean) => void;
  openMobileDialog: () => void;
}>) {
  const ref = useRef<DeviceClientHandle>(null);
  const screenTooSmall = useMediaQuery("(max-width: 500px)");
  const router = useRouter();
  const { toast } = useToast();

  // top-level effects in this component will run when the dialog is first loaded, but won't be very effective.

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <SimpleTooltip content={desktopClientTooltip}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              if (!deviceIsUp) {
                toast({
                  title: "This may take a while...",
                  description:
                    "You are trying to interact with an offline device. We will wake it up for you, but this could take a moment.",
                });
              }
              pwaClickHandler(router, deviceInfo, e);
            }}
          >
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
        {screenTooSmall ? (
          <div>
            <p className="shadcn-p">
              This screen is too small to use the embedded viewer.
            </p>
            <p className="shadcn-p">
              Please use a larger screen, or{" "}
              <span className="shadcn-link" onClick={openMobileDialog}>
                click here
              </span>{" "}
              to open the immersive viewer.
            </p>
          </div>
        ) : (
          <>
            <div
              // i have long tried to remove the minimum width, but it is not worth it.
              className="flex justify-center  items-center place-items-center w-full min-h-[35vh] max-h-[70vh]"
            >
              {/*theres no need to worry about resource freeing, this client isn't created when this page isn't open*/}
              <DeviceClient
                ref={ref}
                device={deviceInfo}
                loadingNode={<LuLoader2 className="h-20 w-20 animate-spin" />}
                autoCaptureKeyboard
                playAudio
              />
            </div>
            <ButtonBar clientRef={ref} openMobileDialog={openMobileDialog} />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
