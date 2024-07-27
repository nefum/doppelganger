import { AdbDevice } from "%/adb/adb-device.ts";
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
    const screencapConnection = await adbDevice.adbDeviceClient.screencap();
    // stream the bytes straight from device to response
    // it is not a perfect fit into ReadableStream, but it defines all of the methods that are needed
    return new NextResponse(screencapConnection as unknown as ReadableStream, {
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