import { Button } from "@/components/ui/button.tsx";
import { SimpleTooltip } from "@/components/ui/tooltip.tsx";
import { Device } from "@prisma/client";
import { LuExternalLink } from "react-icons/lu";
import { Link } from "react-transition-progress/next";

const deviceInfoPageButtonTooltip = "Open Device Info";

export default function DeviceInfoPageButton({
  deviceInfo,
}: Readonly<{ deviceInfo: Device }>) {
  return (
    <SimpleTooltip content={deviceInfoPageButtonTooltip}>
      <Button variant="ghost" size="icon" asChild>
        <Link href={`/devices/${deviceInfo.id}`}>
          <LuExternalLink className="h-5 w-5" />
          <span className="sr-only">{deviceInfoPageButtonTooltip}</span>
        </Link>
      </Button>
    </SimpleTooltip>
  );
}
