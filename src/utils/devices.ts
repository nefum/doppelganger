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
