import { getRedroidImage } from "%/device-info/redroid-images.ts";
import { MIN_FPS } from "@/constants.ts";
import { z } from "zod";

export const newDeviceFormSchema = z
  .object({
    deviceName: z.string().min(3).max(100),
    redroidImage: z.string().refine((imageName) => {
      const image = getRedroidImage(imageName);
      return image && image.usable;
    }),
    fps: z.number().int().min(MIN_FPS),
    width: z
      .number()
      .int()
      .min(500)
      .refine((width) => {
        return width % 2 === 0;
      }),
    height: z
      .number()
      .int()
      .min(500)
      .refine((height) => {
        return height % 2 === 0;
      }),
    dpi: z.number().int().min(100).max(1000),
  })
  .refine(
    (data) => {
      const totalPixels = data.width * data.height;
      return totalPixels <= 3840 * 2160;
    },
    {
      message:
        "Too many pixels. The total number of pixels must be less than or equal to 3840x2160 (4K).",
    },
  );
