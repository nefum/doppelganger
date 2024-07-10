import {
  AlertDialog,
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
import { RxPencil2 } from "react-icons/rx";

const editDeviceTooltip = "Edit Device";

export default function EditDeviceButton({
  deviceInfo,
}: Readonly<{ deviceInfo: Device }>) {
  return (
    <AlertDialog>
      <SimpleTooltip content={editDeviceTooltip}>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="icon">
            <RxPencil2 className="h-5 w-5" />
            <span className="sr-only">{editDeviceTooltip}</span>
          </Button>
        </AlertDialogTrigger>
      </SimpleTooltip>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Editing devices is not yet implemented
          </AlertDialogTitle>
          <AlertDialogDescription>
            Please delete and create a new device instead.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
