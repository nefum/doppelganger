"use client";

import allSampleDeviceSpecs, {
  defaultSampleDeviceSpecs,
  SampleDeviceSpecs,
} from "%/device-info/device-specs.ts";
import allRedroidImages, {
  defaultRedroidImage,
  RedroidImage,
} from "%/device-info/redroid-images.ts";
import NewDeviceButtonClient from "@/app/(userland)/devices/(root)/device-pages/new-device-button/new-device-button-client.tsx";
import {
  isFreeTierCompatible,
  newDeviceFormSchema,
} from "@/app/(userland)/devices/(root)/device-pages/new-device-form/new-device-form-schema.ts";
import { FREE_MAX_FPS, MIN_FPS, PREMIUM_MAX_FPS } from "@/app/constants.ts";
import { Button } from "@/components/ui/button.tsx";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog.tsx";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form.tsx";
import { Input } from "@/components/ui/input.tsx";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover.tsx";
import { Slider } from "@/components/ui/slider.tsx";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip.tsx";
import {
  type toast as baseToast,
  useToast,
} from "@/components/ui/use-toast.ts";
import { cn } from "@/lib/utils.ts";
import { SubscriptionStatus } from "@/utils/subscriptions.ts";
import { clientSideRedirectWithToast } from "@/utils/toast-utils.ts";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown } from "lucide-react";
import { ReactNode, useMemo, useState } from "react";
import { ControllerRenderProps, useForm, UseFormReturn } from "react-hook-form";
import { LuCrown, LuInfo, LuLoader2, LuSettings } from "react-icons/lu";
import { TbCashBanknoteOff } from "react-icons/tb";
import { useMediaQuery } from "usehooks-ts";
import { z } from "zod";

type formType = z.infer<typeof newDeviceFormSchema>;

// https://ui.shadcn.com/docs/components/combobox#:~:text=%2B%20Set%20status-,Form,-Preview
interface RedroidImageComboboxProps {
  field: ControllerRenderProps<formType, keyof formType>;
  form: UseFormReturn<formType>;
  userIsPremium: boolean;
}

interface RedroidImageCommandItemProps {
  image: RedroidImage;
  userIsPremium: boolean;
  toast: typeof baseToast;
  form: UseFormReturn<formType>;
  field: ControllerRenderProps<formType, keyof formType>;
}

function RedroidImageCommandItem({
  image,
  userIsPremium,
  toast,
  form,
  field,
}: Readonly<RedroidImageCommandItemProps>): ReactNode {
  return (
    <CommandItem
      key={image.name}
      value={image.name}
      onSelect={() => {
        if (image.premium && !userIsPremium) {
          toast({
            title: "Premium Required",
            description:
              "You need premium to use this device type. Please select another device type or upgrade to premium.",
          });
          return;
        }
        form.setValue("redroidImage", image.imageName);
      }}
    >
      <Check
        className={cn(
          "mr-2 h-4 w-4",
          image.imageName === field.value ? "opacity-100" : "opacity-0",
        )}
      />
      {(image.premium && <LuCrown className="mr-2 h-4 w-4" />) || (
        <TbCashBanknoteOff className="mr-2 h-4 w-4" />
      )}
      {image.name}
    </CommandItem>
  );
}

function RedroidImageCombobox({
  field,
  form,
  userIsPremium,
}: Readonly<RedroidImageComboboxProps>): ReactNode {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-inline">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-[500px] justify-between"
            >
              {field.value
                ? allRedroidImages.find(
                    (image) => image.imageName === field.value,
                  )?.name
                : "Select Device Type"}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent className="w-[500px] p-0">
          <Command>
            <CommandInput placeholder="Search device types..." />
            <CommandList>
              <CommandEmpty>No device type found.</CommandEmpty>
              <CommandGroup heading="Premium">
                {allRedroidImages
                  .filter((image) => image.usable && image.premium)
                  .map((image) => (
                    <RedroidImageCommandItem
                      key={image.imageName}
                      image={image}
                      userIsPremium={userIsPremium}
                      toast={toast}
                      form={form}
                      field={field}
                    />
                  ))}
              </CommandGroup>
              <CommandGroup heading="Free">
                {allRedroidImages
                  .filter((image) => image.usable && !image.premium)
                  .map((image) => (
                    <RedroidImageCommandItem
                      key={image.imageName}
                      image={image}
                      userIsPremium={userIsPremium}
                      toast={toast}
                      form={form}
                      field={field}
                    />
                  ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {/* if an image is selected, we will show it's blurb here */}
      {field.value && (
        <Tooltip>
          <TooltipTrigger>
            <LuInfo
              onClick={(e) => {
                e.preventDefault();
              }}
              className="ml-2 h-4 w-4"
            />
          </TooltipTrigger>
          <TooltipContent className="italic max-w-[80vw]">
            <h6 className="text-md font-semibold">
              Selected:{" "}
              {
                allRedroidImages.find(
                  (image) => image.imageName === field.value,
                )?.name
              }
            </h6>
            <p className="text-sm text-muted-foreground">
              {
                allRedroidImages.find(
                  (image) => image.imageName === field.value,
                )?.description
              }
            </p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}

interface NewDeviceFormProps {
  subscriptionStatus: SubscriptionStatus;
  dialogCanClose: boolean;
  setDialogCanClose: (canClose: boolean) => void;
  footerComponentType: typeof DrawerFooter | typeof DialogFooter;
}

function DeviceSpecsPresetCombobox({
  form,
}: Readonly<{ form: UseFormReturn<formType> }>): ReactNode {
  const [open, setOpen] = useState(false);
  const [presetValue, setPresetValue] = useState<SampleDeviceSpecs>(
    defaultSampleDeviceSpecs,
  );

  return (
    <div className="flex flex-inline">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-[100%] justify-between"
            >
              {presetValue.name}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput placeholder="Search presets..." />
            <CommandList>
              <CommandEmpty>No device type found.</CommandEmpty>
              <CommandGroup>
                {allSampleDeviceSpecs.map((preset) => (
                  <CommandItem
                    key={preset.name}
                    value={preset.name}
                    onSelect={() => {
                      form.setValue("width", preset.width);
                      form.setValue("height", preset.height);
                      form.setValue("dpi", preset.dpi);
                      setPresetValue(preset);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        preset === presetValue ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {preset.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

function AdvancedSettings({
  form,
  disabled,
}: Readonly<{
  form: UseFormReturn<formType>;
  disabled: boolean;
}>): ReactNode {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="secondary" disabled={disabled}>
          Advanced
          <LuSettings className="ml-2 h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <p className="shadcn-p">
          These settings allow you to customize the form-factor of your Device.
          You may set values manually, or choose a preset based on an existing
          design.
        </p>
        <div className="mt-2">
          <DeviceSpecsPresetCombobox form={form} />
        </div>
        <div className="mt-2 flex flex-row">
          <div>
            <FormField
              control={form.control}
              name={"width"}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Width</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormDescription>
                    The width of the device screen in pixels.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="ml-2">
            <FormField
              control={form.control}
              name={"height"}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Height</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormDescription>
                    The height of the device screen in pixels.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="ml-2">
            <FormField
              control={form.control}
              name={"dpi"}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>DPI</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormDescription>
                    The DPI of the device screen.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// https://ui.shadcn.com/docs/components/form
function NewDeviceForm({
  subscriptionStatus,
  dialogCanClose,
  setDialogCanClose,
  footerComponentType: FooterComp,
}: Readonly<NewDeviceFormProps>): ReactNode {
  const form = useForm<formType>({
    resolver: zodResolver(newDeviceFormSchema),
    defaultValues: {
      deviceName: "My Device",
      redroidImage: defaultRedroidImage.imageName,
      fps: FREE_MAX_FPS,
      width: defaultSampleDeviceSpecs.width,
      height: defaultSampleDeviceSpecs.height,
      dpi: defaultSampleDeviceSpecs.dpi,
    },
  });
  const { toast } = useToast();
  const userIsPremium = subscriptionStatus === SubscriptionStatus.ACTIVE;
  const maxFps = userIsPremium ? PREMIUM_MAX_FPS : FREE_MAX_FPS;

  const onSubmit = useMemo(
    () => async (values: formType) => {
      if (!userIsPremium) {
        const freeTierCompatible = isFreeTierCompatible(values);
        if (!freeTierCompatible) {
          toast({
            title: "Premium Required",
            description: "You need premium to create this device.",
          });
          return;
        }
      }

      setDialogCanClose(false);

      let result: Response;
      let resultJson: { id?: string; error?: string };
      try {
        result = await fetch("/api/devices", {
          method: "POST",
          body: JSON.stringify(values),
          headers: {
            "Content-Type": "application/json",
          },
        });
        resultJson = await result.json();
      } catch (e) {
        console.error("Failed to create device", e);
        toast({
          title: "Failed to create device",
          description: "An unknown error occurred; please contact support",
        });
        setDialogCanClose(true);
        return;
      }

      if (result.ok) {
        const deviceId = resultJson.id!;
        clientSideRedirectWithToast(`/devices/${deviceId}`, {
          title: `Device "${values.deviceName}" created successfully`,
          description:
            "It may be up to 5 minutes before you can connect to your device for the first time. " +
            "Subsequent starts will be faster. " +
            "In the meantime, you may complete the setup of your device.",
        });
      } else {
        console.error("Failed to create device", result);
        toast({
          title: "Failed to create device",
          description: resultJson.error ?? "An unknown error occurred",
        });
        setDialogCanClose(true);
      }
    },
    [setDialogCanClose, toast, userIsPremium],
  );

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, console.error)}
        className="space-y-8"
      >
        <FormField
          control={form.control}
          name={"deviceName"}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Device Name</FormLabel>
              <FormControl>
                <Input placeholder={"My Device"} {...field} />
              </FormControl>
              <FormDescription>
                The name of your device. This will be displayed in the
                dashboard.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={"redroidImage"}
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Device Type</FormLabel>
              <RedroidImageCombobox
                field={field}
                form={form}
                userIsPremium={userIsPremium}
              />
              <FormDescription>
                The type of device you want to create. Hover over the info icon
                to review important notes. This cannot be changed once the
                device is created.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={"fps"}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Frames Per Second</FormLabel>
              <FormControl>
                <div className="flex items-center space-x-4">
                  <Slider
                    defaultValue={[field.value]}
                    min={MIN_FPS}
                    max={maxFps}
                    step={5}
                    onValueChange={([value]) => field.onChange(value)}
                  />
                  <Input
                    disabled
                    type="number"
                    className="w-20"
                    value={field.value}
                  />
                </div>
              </FormControl>
              <FormDescription>
                Higher FPS will use more of the limited resources provided to
                your device and may result in a slower experience.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FooterComp>
          <AdvancedSettings form={form} disabled={!dialogCanClose} />
          <Button type="submit" disabled={!dialogCanClose}>
            Create (this WILL take a while!)
            {!dialogCanClose && (
              <LuLoader2 className="ml-2 h-4 w-4 animate-spin" />
            )}
          </Button>
        </FooterComp>
      </form>
    </Form>
  );
}

interface NewDeviceDialogClientProps {
  emailVerified: boolean;
  subscriptionStatus: SubscriptionStatus;
}

export default function NewDeviceDialogClient({
  emailVerified,
  subscriptionStatus,
}: Readonly<NewDeviceDialogClientProps>) {
  const [open, setOpen] = useState(false);
  const [dialogCanClose, setDialogCanClose] = useState(true);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  function onOpenChange(newOpen: boolean) {
    if (newOpen || dialogCanClose) {
      setOpen(newOpen);
    }
  }

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTrigger>
          <NewDeviceButtonClient
            emailVerified={emailVerified}
            subscriptionStatus={subscriptionStatus}
          />
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Device</DialogTitle>
            <DialogDescription>
              Create a new device to use for your apps.
            </DialogDescription>
          </DialogHeader>
          <NewDeviceForm
            subscriptionStatus={subscriptionStatus}
            dialogCanClose={dialogCanClose}
            setDialogCanClose={setDialogCanClose}
            footerComponentType={DialogFooter}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerTrigger>
        <NewDeviceButtonClient
          emailVerified={emailVerified}
          subscriptionStatus={subscriptionStatus}
        />
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DialogTitle>Create New Device</DialogTitle>
            <DrawerDescription>
              Create a new device to use for your apps.
            </DrawerDescription>
          </DrawerHeader>
          <div className="gap-2 p-4">
            <NewDeviceForm
              subscriptionStatus={subscriptionStatus}
              dialogCanClose={dialogCanClose}
              setDialogCanClose={setDialogCanClose}
              footerComponentType={DrawerFooter}
            />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
