import DeviceClient from "@/components/device-client.tsx";
import { AspectRatio } from "@/components/ui/aspect-ratio.tsx";
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
import { useEffect, useState } from "react";
import { LuLoader2, LuMousePointer2 } from "react-icons/lu";

const desktopClientTooltip = "Interact";

export default function DesktopClientButton({
  deviceInfo,
  dialogOpen,
  setDialogOpen,
}: Readonly<{
  deviceInfo: Device;
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
}>) {
  // implementation note of the @shadcn/ui AspectRatio: you can only size it with width, not height
  // we need to calculate the width based on the radio and the target 80vh
  const aspectRatio = deviceInfo.redroidWidth / deviceInfo.redroidHeight;
  const [aspectRatioWidth, setAspectRatioWidth] = useState("100%"); // Default width

  useEffect(() => {
    const calculateWidth = () => {
      const viewportHeight = window.innerHeight;
      const targetHeightPx = viewportHeight * 0.9; // 90vh
      const widthPx = aspectRatio * targetHeightPx;
      return `${widthPx}px`;
    };

    if (dialogOpen) {
      const width = calculateWidth();
      setAspectRatioWidth(width);
    }
  }, [dialogOpen, aspectRatio]);

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
        <div className="flex justify-center">
          <div className="90vh" style={{ width: aspectRatioWidth }}>
            <AspectRatio ratio={aspectRatio}>
              {/*do *not* render this if the dialog isn't open, it will hog resources and network traffic*/}
              {/*TODO: implement a better client that supports rotation*/}
              {dialogOpen && (
                <DeviceClient
                  className="flex justify-center items-center place-items-center"
                  device={deviceInfo}
                  loadingNode={<LuLoader2 className="h-20 w-20 animate-spin" />}
                />
              )}
            </AspectRatio>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
