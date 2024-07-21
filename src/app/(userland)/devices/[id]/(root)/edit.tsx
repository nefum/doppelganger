"use client";

import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog.tsx";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form.tsx";
import { Input } from "@/components/ui/input.tsx";
import { SimpleTooltip } from "@/components/ui/tooltip.tsx";
import { useToast } from "@/components/ui/use-toast.ts";
import { clientSideReloadWithToast } from "@/utils/toast-utils.ts";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Device } from "@prisma/client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { LuLoader2 } from "react-icons/lu";
import { TbEdit } from "react-icons/tb";
import { z } from "zod";

const formSchema = z.object({
  newName: z.string(),
});

const changeDeviceNameTooltip = "Change Device Name";

export default function EditDeviceButton({
  device,
}: Readonly<{ device: Device }>) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newName: device.name,
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    const response = await fetch(`/api/devices/${device.id}/rename`, {
      method: "PUT",
      body: JSON.stringify({ name: values.newName }),
    });

    let responseJson: { error?: string };
    try {
      responseJson = await response.json();
    } catch (e) {
      console.error("Failed to parse response", e);
      setIsLoading(false);
      toast({
        title: "Failed to edit device",
        description: "Please try again later.",
      });
      return;
    }

    if (response.ok) {
      clientSideReloadWithToast({
        title: "Device edited successfully",
      });
    } else {
      console.error("Failed to start device", response);
      setIsLoading(false);
      toast({
        title: "Failed to edit device",
        description: responseJson.error ?? "Please try again later.",
      });
    }
  }

  return (
    <Dialog>
      <SimpleTooltip content={changeDeviceNameTooltip}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon">
            <TbEdit className="h-5 w-5" />
            <span className="sr-only">{changeDeviceNameTooltip}</span>
          </Button>
        </DialogTrigger>
      </SimpleTooltip>
      <DialogContent>
        <DialogTitle>Change Device Name</DialogTitle>
        <DialogDescription>
          You can change the name of your device here. It may take a few moments
          to update across the platform.
        </DialogDescription>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="newName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                Submit New Name
                {isLoading && (
                  <LuLoader2 className={"ml-2 h-5 w-5 animate-spin"} />
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
