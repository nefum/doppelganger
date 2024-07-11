import prisma from "%/database/prisma.ts";
import { getDeviceForId } from "%/device-info/device-info.ts";
import { deviceApiEndpoint } from "%/endpoint-regex.ts";
import { bringDownDevice } from "@/app/utils/redroid/deployment.ts";
import { createClient } from "@/utils/supabase/server.ts";
import { DeviceState } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest): Promise<NextResponse> {
  const supabaseClient = createClient();
  const {
    data: { user },
  } = await supabaseClient.auth.getUser();

  if (!user) {
    return NextResponse.json({}, { status: 401 });
  }

  const id = req.nextUrl.pathname.match(deviceApiEndpoint)![1];
  const device = await getDeviceForId(id);

  if (!device) {
    return NextResponse.json({}, { status: 404 });
  }

  if (device.lastState === DeviceState.OFF) {
    return NextResponse.json({}, { status: 400 });
  }

  await bringDownDevice(device.id);

  await prisma.device.update({
    where: {
      id: device.id,
    },
    data: {
      lastState: DeviceState.OFF,
    },
  });

  return NextResponse.json({}, { status: 200 });
}
