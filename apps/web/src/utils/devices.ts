import { DEVICE_ACTIVE_TIMEOUT } from "%/constants.ts";
import prisma from "%/database/prisma.ts";
import { Device } from "@prisma/client";
import { User } from "@supabase/supabase-js";

export function getDevicesForUser(user: User): Promise<Device[]> {
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
  const lastConnectedAt = device.lastConnectedAt;
  if (!lastConnectedAt) {
    return false;
  }
  const shutdownTime = lastConnectedAt.getTime() + DEVICE_ACTIVE_TIMEOUT;
  return Date.now() < shutdownTime;
}
