import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import { SimpleTooltip } from "@/components/ui/tooltip.tsx";
import { Device } from "@prisma/client";
import Link from "next/link";
import { LuExternalLink } from "react-icons/lu";

export const mobileClientTooltip = "Open Immersive Client";
export const mobileClientTooltipIcon = <LuExternalLink className="h-5 w-5" />;

export function MobileClientButton({
  deviceInfo,
  dialogOpen,
  setDialogOpen,
}: Readonly<{
  deviceInfo: Device;
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
}>) {
  return (
    <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <SimpleTooltip content={mobileClientTooltip}>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="icon">
            {mobileClientTooltipIcon}
            <span className="sr-only">{mobileClientTooltip}</span>
          </Button>
        </AlertDialogTrigger>
      </SimpleTooltip>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{mobileClientTooltip}</AlertDialogTitle>
          <AlertDialogDescription>
            <p className="shadcn-p">
              Opening the immersive client will open a new tab isolated from
              this page.
            </p>
            <p className="shadcn-p">
              It supports installation as a{" "}
              <a
                href={"https://web.dev/explore/progressive-web-apps"}
                className={"shadcn-link"}
              >
                Progressive Web App (PWA)
              </a>
              , which provides a more immersive experience free of your
              browser&apos;s menu bar, making for easy use on mobile.
            </p>
            <p className="shadcn-p">
              See instructions{" "}
              <a
                href="https://www.bitcot.com/how-to-install-a-pwa-to-your-device/#Installing_a_PWA_on_iOS"
                className={"shadcn-link"}
              >
                here
              </a>{" "}
              for installing PWAs on iOS & Android.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Dismiss</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Link href={`/devices/${deviceInfo.id}/mobile`} target="_blank">
              {" "}
              {/*target="_blank" opens in new tab*/}
              Open
            </Link>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
