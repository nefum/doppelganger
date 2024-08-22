import { DEVICE_ACTIVE_TIMEOUT } from "%/constants.ts";
import { getPrisma } from "%/database/prisma.ts";
import fixDateFromPrisma from "@/app/api/cron/util.ts";
import { Device } from "@prisma/client";
import { User } from "@supabase/supabase-js";

export function getDevicesForUser(user: User): Promise<Device[]> {
  const prisma = getPrisma();

  return prisma.device.findMany({
    where: {
      ownerId: user.id,
      id:
        process.env.NODE_ENV === "production"
          ? {
              not: {
                endsWith: "staging",
              },
            }
          : {
              endsWith: "staging",
            },
    },
  });
}

export function getDeviceIsActive(device: Device): boolean {
  const lastConnectedDate =
    fixDateFromPrisma(device.lastConnectedAt) ?? new Date();

  const timestamp = lastConnectedDate.getTime();

  // Check if the conversion was successful
  if (isNaN(timestamp)) {
    throw new Error("Invalid lastConnectedAt value");
  }

  const shutdownTime = timestamp + DEVICE_ACTIVE_TIMEOUT;
  return Date.now() < shutdownTime;
}
