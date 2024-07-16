"use client";

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
import { useToast } from "@/components/ui/use-toast.ts";
import { clientSideRedirectWithToast } from "@/utils/toast-utils.ts";
import { Device } from "@prisma/client";
import React, { useMemo, useState } from "react";
import { HiOutlineTrash } from "react-icons/hi2";
import { LuLoader2 } from "react-icons/lu";

const deleteDeviceTooltip = "Delete Device";

export default function DeleteDeviceButton({
  deviceInfo,
}: Readonly<{ deviceInfo: Device }>) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleOpenChange = useMemo(
    () => (newIsOpen: boolean) => {
      if (!loading) {
        setOpen(newIsOpen);
      } else {
        setOpen(false);
      }
    },
    [loading],
  );

  const handleDelete = useMemo(
    () => async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      e.preventDefault();
      setLoading(true);
      const response = await fetch(`/api/devices/${deviceInfo.id}/`, {
        method: "DELETE",
      });
      if (response.ok) {
        clientSideRedirectWithToast(
          "/devices",
          `Device "${deviceInfo.name}" deleted successfully`,
        );
      } else {
        console.error("Failed to delete device", response);
        setLoading(false);
        toast({
          title: "Failed to delete device",
          description: "Please try again later.",
        });
      }
    },
    [deviceInfo.id, deviceInfo.name, toast],
  );

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <SimpleTooltip content={deleteDeviceTooltip}>
        <AlertDialogTrigger asChild>
          <Button variant="dghost" size="icon">
            <HiOutlineTrash className="h-5 w-5" />
            <span className="sr-only">{deleteDeviceTooltip}</span>
          </Button>
        </AlertDialogTrigger>
      </SimpleTooltip>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you would like to delete this device?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action is immediately irreversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={loading}
            // @ts-expect-error -- for some reason, destructive isn't on the props of this type
            variant="destructive"
            className="bg-red-500 hover:bg-red-600 text-white"
            onClick={handleDelete}
          >
            Delete
            {loading && <LuLoader2 className="ml-2 h-4 w-4 animate-spin" />}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
