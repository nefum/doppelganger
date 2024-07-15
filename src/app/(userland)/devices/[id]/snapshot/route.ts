import { AdbDevice } from "%/adb/scrcpy.ts";
import { getDeviceForId } from "%/device-info/device-info.ts";
import { deviceEndpoint } from "%/endpoint-regex.ts";
import { createClient } from "@/utils/supabase/server.ts";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const id = req.nextUrl.pathname.match(deviceEndpoint)![1];

  const supabaseClient = createClient();
  const {
    data: { user },
  } = await supabaseClient.auth.getUser();

  if (!user) {
    // don't 401 because we are in userland
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const device = await getDeviceForId(id);

  if (!device) {
    return NextResponse.json({}, { status: 404 });
  }

  if (device.ownerId !== user.id) {
    // don't 403, we don't want to leak device existence
    return NextResponse.json({}, { status: 404 });
  }

  try {
    const adbDevice = new AdbDevice(device);
    await adbDevice.connect();
    const screencapConnection = await adbDevice.adbClient!.screencap();
    // stream the bytes straight from device to response
    return new NextResponse(screencapConnection, {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": "inline; filename=screenshot.png",
        "Cache-Control": "max-age=30", // 30 seconds, let preload work
      },
    });
  } catch (e: unknown) {
    // error if we try to get this while the device is offline
    return NextResponse.json({}, { status: 400 });
  }
}
