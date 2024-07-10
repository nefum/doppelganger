"use server";

import prisma from "%/database/prisma.ts";
import { getDeviceForId } from "%/device-info/device-info.ts";
import { anyDeviceEndpoint } from "%/endpoint-regex.ts";
import { destroyDevice } from "@/app/utils/redroid/deployment.ts";
import { createClient } from "@/utils/supabase/server.ts";
import { DeviceState } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest): Promise<NextResponse> {
  const id = req.nextUrl.pathname.match(anyDeviceEndpoint)![1];

  const deviceInfo = await getDeviceForId(id);

  if (deviceInfo === null) {
    return NextResponse.json({ error: "Device not found" }, { status: 404 });
  }

  const supabaseClient = createClient();
  const user = await supabaseClient.auth.getUser();
  const userEmail = user.data!.user!.email!;

  if (userEmail !== deviceInfo.ownerEmail) {
    return NextResponse.json({ error: "Device not found" }, { status: 404 });
  }

  if (deviceInfo.lastState === DeviceState.SUSPENDED) {
    return NextResponse.json(
      { error: "Device cannot be deleted, contact administration" },
      { status: 403 },
    );
  }

  await prisma.device.update({
    where: {
      id: id,
    },
    data: {
      lastState: DeviceState.UNAVAILABLE,
    },
  });

  await destroyDevice(id);

  await prisma.device.delete({
    where: {
      id: id,
    },
  });

  return NextResponse.json({ success: "Device deleted" }, { status: 200 });
}
