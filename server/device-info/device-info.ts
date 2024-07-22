import prisma from "%/database/prisma";
import { Device } from "@prisma/client";

export async function getDeviceForId(id: string): Promise<Device | null> {
  if (id.endsWith("staging") && process.env.NODE_ENV === "production") {
    console.warn("Tried to access staging/debug device in production");
    return null;
  }

  return prisma.device.findUnique({
    where: {
      id,
    },
  });
}
