"use server";

import { NextRequest, NextResponse } from "next/server";
import {
  getDeviceForId,
  getDeviceIdFromUrl,
} from "%/device-info/device-info.ts";
import getSnapshotOfKasmVNCDevice from "@/app/(strict-mode)/(userland)/devices/[id]/snapshot/snapshot.ts";
import { createClient } from "@/utils/supabase/server.ts";

export async function GET(request: NextRequest) {
  // we need to connect to /devices/[id]/kasmvnc with RFB and then take a screenshot using node-canvas (jsdom has a node-canvas integ.)

  const id = getDeviceIdFromUrl(request.nextUrl);
  if (!id) {
    return NextResponse.json(
      {
        error: "Bad Request",
      },
      {
        status: 400,
      },
    );
  }

  const deviceInfo = await getDeviceForId(id);
  if (!deviceInfo) {
    return NextResponse.json(
      {
        error: "Device not found",
      },
      {
        status: 404,
      },
    );
  }

  const supabaseClient = createClient();
  const supabaseUser = await supabaseClient.auth.getUser();
  const userEmail = supabaseUser.data.user!.email!;
  if (deviceInfo.ownerEmail !== userEmail) {
    // don't even 401, 404 instead to hide the existence of the device
    return NextResponse.json(
      {
        error: "Device not found",
      },
      {
        status: 404,
      },
    );
  }

  try {
    const outerCanvasOutput = await getSnapshotOfKasmVNCDevice(deviceInfo);
    const mimeType = outerCanvasOutput
      .split(",")[0]
      .split(":")[1]
      .split(";")[0];
    const base64 = outerCanvasOutput.split(",")[1];
    const buffer = Buffer.from(base64, "base64");
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "max-age=10", // don't request a new snapshot every time; the screen won't change that much between 10 seconds and this route is expensive
        "Content-Disposition": `inline; filename=${deviceInfo.name}.png`,
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      {
        error: "Internal Server Error",
      },
      {
        status: 500,
      },
    );
  }
}
