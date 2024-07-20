import prisma from "%/database/prisma.ts";
import { getRedroidImage } from "%/device-info/redroid-images.ts";
import { bringUpDevice } from "%/docker/device-state.ts";
import { newDeviceFormSchema } from "@/app/(userland)/devices/(root)/device-pages/new-device-form/new-device-form-schema.ts";
import { getUsersDevices } from "@/utils/devices.ts";
import { initializeDevice } from "@/utils/redroid/deployment.ts";
import {
  getMaxDeviceCount,
  getSubscriptionStatus,
} from "@/utils/subscriptions.ts";
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

  // don't let the user create more devices than their subscription allows
  const existingDevices = await getUsersDevices(user);
  const subscriptionStatus = await getSubscriptionStatus(user.id);
  const maxDevices = getMaxDeviceCount(subscriptionStatus);
  if (existingDevices.length >= maxDevices) {
    return NextResponse.json(
      {
        error:
          "You have reached the maximum number of devices allowed for your subscription",
      },
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

  const fullDevice = (await prisma.device.findUnique({
    where: {
      id: device.id,
    },
  })) as Device;

  await bringUpDevice(fullDevice);

  // passing the whole device is not safe because there are columns in the device that users shouldn't be able to see
  // we can just send the id
  return NextResponse.json({ id: device.id }, { status: 201 });
}
