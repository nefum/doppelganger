import prisma from "%/database/prisma.ts";
import { newDeviceFormSchema } from "@/app/(userland)/devices/(root)/device-pages/new-device-form/new-device-form-schema.ts";
import { bringUpDevice, initializeDevice } from "@/utils/redroid/deployment.ts";
import { getRedroidImage } from "@/utils/redroid/redroid-images.ts";
import { createClient } from "@/utils/supabase/server.ts";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const supabaseClient = createClient();
  const {
    data: { user },
  } = await supabaseClient.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "You must be logged in to create a device" },
      { status: 401 },
    );
  }

  if (!user.email_confirmed_at) {
    return NextResponse.json(
      { error: "You must confirm your email before creating a device" },
      { status: 401 },
    );
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

  await bringUpDevice(device.id);

  return NextResponse.redirect("/devices");
}
