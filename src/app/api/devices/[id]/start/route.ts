import { getDeviceForId } from "%/device-info/device-info.ts";
import { bringUpDevice, getIsDeviceRunning } from "%/docker/device-state.ts";
import { deviceApiEndpoint } from "%/endpoint-regex.ts";
import { createClient } from "@/utils/supabase/server.ts";
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

  if (await getIsDeviceRunning(device)) {
    return NextResponse.json(
      {
        error: `Device ${device.id} is already running`,
      },
      { status: 400 },
    );
  }

  await bringUpDevice(device);

  return NextResponse.json(
    {
      success: true,
    },
    { status: 200 },
  );
}
