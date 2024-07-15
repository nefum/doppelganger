import { waitForAdbServerToBeReady } from "%/adb/scrcpy.ts";
import prisma from "%/database/prisma.ts";
import { getAdbUdidForDevice } from "%/device-info/device-info.ts";
import { newDeviceFormSchema } from "@/app/(userland)/devices/(root)/device-pages/new-device-form/new-device-form-schema.ts";
import { bringUpDevice, initializeDevice } from "@/utils/redroid/deployment.ts";
import { getRedroidImage } from "@/utils/redroid/redroid-images.ts";
import { createClient } from "@/utils/supabase/server.ts";
import { Device } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const supabaseClient = createClient();
  const {
    data: { user },
  } = await supabaseClient.auth.getUser();

  if (!user || !user.email_confirmed_at) {
    return NextResponse.json({}, { status: 401 });
  }

  const requestJson = await req.json();

  const {
    success: parseSuccess,
    data,
    error,
  } = await newDeviceFormSchema.safeParseAsync(requestJson);

  if (!parseSuccess) {
    return NextResponse.json(
      { error: "Invalid request", details: error },
      { status: 400 },
    );
  }

  const { deviceName, redroidImage, fps, width, height, dpi } = data!;
  const specs = { width, height, dpi };

  const device = await initializeDevice(
    user.id,
    deviceName,
    getRedroidImage(redroidImage)!,
    fps,
    specs,
  );

  await prisma.device.create({
    data: {
      ...device,
    },
  });

  const fullDevice: Device | null = await prisma.device.findUnique({
    where: {
      id: device.id,
    },
  });

  await bringUpDevice(device.id);
  await waitForAdbServerToBeReady(getAdbUdidForDevice(fullDevice!));

  return NextResponse.json({}, { status: 201 });
}
