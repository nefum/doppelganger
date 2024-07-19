"use server";

import prisma from "%/database/prisma.ts";
import { destroyDevice } from "%/docker/device-state.ts";
import { getUsersDevices } from "@/utils/devices.ts";
import { createClient } from "@/utils/supabase/server.ts";
import { Device, DeviceState } from "@prisma/client";

export default async function handleDeleteUser() {
  const supabaseClient = createClient();
  const {
    data: { user },
    error,
  } = await supabaseClient.auth.getUser();

  if (error) {
    console.error("Error fetching user:", error.message);
    throw error;
  }

  if (!user) {
    console.error("No user found");
    throw new Error("No user found");
  }

  // first, delete the devices that this user owns

  const devices = await getUsersDevices(user);

  async function deleteDevice(deviceToDelete: Device) {
    await prisma.device.update({
      where: {
        id: deviceToDelete.id,
      },
      data: {
        lastState: DeviceState.UNAVAILABLE,
      },
    });
    await destroyDevice(deviceToDelete.id);
    await prisma.device.delete({
      where: {
        id: deviceToDelete.id,
      },
    });
  }

  const deleteDevicePromises = devices.map(deleteDevice);

  await Promise.all(deleteDevicePromises);

  const { error: deleteError } = await supabaseClient.auth.admin.deleteUser(
    user!.id,
  );

  if (deleteError) {
    console.error("Error deleting user:", deleteError.message);
    throw deleteError;
  }
}
