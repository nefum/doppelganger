"use server";

import prisma from "%/database/prisma.ts";
import { getDeviceForId } from "%/device-info/device-info.ts";
import { deviceApiEndpoint } from "%/endpoint-regex.ts";
import { destroyDevice } from "@/utils/redroid/deployment.ts";
import { createClient } from "@/utils/supabase/server.ts";
import { DeviceState } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest): Promise<NextResponse> {
  const id = req.nextUrl.pathname.match(deviceApiEndpoint)![1];

  const deviceInfo = await getDeviceForId(id);

  if (deviceInfo === null) {
    return NextResponse.json({}, { status: 404 });
  }

  const supabaseClient = createClient();
  const {
    data: { user },
  } = await supabaseClient.auth.getUser();

  if (!user) {
    return NextResponse.json({}, { status: 401 });
  }

  if (user.id !== deviceInfo.ownerId) {
    return NextResponse.json({}, { status: 404 });
  }

  if (deviceInfo.lastState === DeviceState.SUSPENDED) {
    return NextResponse.json({}, { status: 403 });
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

  return NextResponse.json({}, { status: 200 });
}
