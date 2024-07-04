import {NextRequest, NextResponse} from "next/server";
import {DeviceInfo, getDeviceIdFromUrl, getDeviceInfoForId} from "../../../../../server/device-info/device-info";

export async function GET(request: NextRequest): Promise<NextResponse<DeviceInfo> | Response> {
  // this will never get called directly; only by the custom server
  // return the device-info for the websoket proxy
  // first, get the id
  const id = getDeviceIdFromUrl(request.nextUrl);
  // 404 if the id is not found
  if (!id) {
    return NextResponse.error(); // can't even customize the status code
  }

  // TODO: check if user is authorized for device (e.g. user owns the device)

  const deviceInfo = getDeviceInfoForId(id);
  if (!deviceInfo) {
    return NextResponse.error();
  }

  return NextResponse.json(deviceInfo);
}
