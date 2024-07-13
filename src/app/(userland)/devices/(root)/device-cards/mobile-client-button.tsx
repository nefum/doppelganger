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
import { IoPhonePortraitOutline } from "react-icons/io5";

const mobileClientTooltip = "Open Mobile-Optimized Client";

export function MobileClientButton({
  deviceInfo,
}: Readonly<{ deviceInfo: Device }>) {
  return (
    <AlertDialog>
      <SimpleTooltip content={mobileClientTooltip}>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="icon">
            <IoPhonePortraitOutline className="h-5 w-5" />
            <span className="sr-only">{mobileClientTooltip}</span>
          </Button>
        </AlertDialogTrigger>
      </SimpleTooltip>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Mobile-Optimized Client</AlertDialogTitle>
          <AlertDialogDescription>
            <p className="shadcn-p">
              Opening the mobile-optimized client will open a new tab isolated
              from this page.
            </p>
            <p className="shadcn-p">
              This mobile-optimized client supports installation as{" "}
              <a
                href={"https://web.dev/explore/progressive-web-apps"}
                className={"shadcn-link"}
              >
                Progressive Web App (PWA)
              </a>
              , which provides a more immersive experience free of your
              browser&apos;s menu bar.
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
