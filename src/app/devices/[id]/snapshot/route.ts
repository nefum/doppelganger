import {NextRequest, NextResponse} from "next/server";
import {getDeviceIdFromUrl, getDeviceInfoForId} from "../../../../../server/device-info/device-info";
import getSnapshotOfKasmVNCDevice from "@/app/devices/[id]/snapshot/snapshot";

export async function GET(request: NextRequest) {
  // we need to connect to /devices/[id]/kasmvnc with RFB and then take a screenshot using node-canvas (jsdom has a node-canvas integ.)

  const id = getDeviceIdFromUrl(request.nextUrl);
  if (!id) {
    return NextResponse.json(
      {
        error: "Bad Request"
      },
      {
        status: 400
      }
    )
  }

  const deviceInfo = getDeviceInfoForId(id);
  if (!deviceInfo) {
    return NextResponse.json(
      {
        error: "Device not found"
      },
      {
        status: 404
      }
    )
  }

  // TODO: check authorization for device

  try {
    const outerCanvasOutput = await getSnapshotOfKasmVNCDevice(deviceInfo, request);

    // now that we have the outer canvas output, we need to turn it into bytes and send a response with the content type png
    const base64 = outerCanvasOutput.split(",")[1];
    const buffer = Buffer.from(base64, "base64");
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "image/png"
      }
    });
  } catch (e: any) {
    return NextResponse.json(
      {
        error: "Internal Server Error"
      },
      {
        status: 500
      }
    )
  }
}
