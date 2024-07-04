import {NextRequest, NextResponse} from "next/server";
import {DeviceInfo, getDeviceIdFromUrl, getDeviceInfoForId} from "../../../../../server/device-info/device-info";

export async function GET(request: NextRequest): Promise<NextResponse<DeviceInfo> | Response> {
  // this will never get called directly; only by the custom server
  // return the device-info for the websoket proxy
  // first, get the id
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

  return NextResponse.json(deviceInfo);
}
