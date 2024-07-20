import pwaClickHandler from "@/app/(userland)/devices/(root)/device-cards/pwa-click-handler.ts";
import DeviceClientWithButtons from "@/components/client/device-client-with-buttons.tsx";
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
import { LuMousePointer2 } from "react-icons/lu";
import { useMediaQuery } from "usehooks-ts";

const desktopClientTooltip = "Interact";

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
          <DeviceClientWithButtons device={deviceInfo} />
        )}
      </DialogContent>
    </Dialog>
  );
}
