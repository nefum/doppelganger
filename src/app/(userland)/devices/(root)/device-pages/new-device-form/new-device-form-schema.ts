import { getRedroidImage } from "%/device-info/redroid-images.ts";
import { FREE_MAX_FPS, MIN_FPS, PREMIUM_MAX_FPS } from "@/constants.ts";
import { z } from "zod";

export const newDeviceFormSchema = z.object({
  deviceName: z.string().min(3).max(100),
  redroidImage: z.string().refine((imageName) => {
    const image = getRedroidImage(imageName);
    return image && image.usable;
  }),
  fps: z.number().int().min(MIN_FPS).max(PREMIUM_MAX_FPS),
  width: z
    .number()
    .int()
    .min(500)
    .max(4000)
    .refine((width) => {
      return width % 2 === 0;
    }),
  height: z
    .number()
    .int()
    .min(500)
    .max(4000)
    .refine((height) => {
      return height % 2 === 0;
    }),
  dpi: z.number().int().min(100).max(1000),
});

export function isFreeTierCompatible(
  deviceForm: z.infer<typeof newDeviceFormSchema>,
): boolean {
  newDeviceFormSchema.parse(deviceForm);
  return (
    deviceForm.fps <= FREE_MAX_FPS &&
    !getRedroidImage(deviceForm.redroidImage)!.premium
  );
}
