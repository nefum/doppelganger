import { Button } from "@/components/ui/button.tsx";
import { SimpleTooltip } from "@/components/ui/tooltip.tsx";
import { Device } from "@prisma/client";
import Link from "next/link";
import { LuExternalLink } from "react-icons/lu";

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
