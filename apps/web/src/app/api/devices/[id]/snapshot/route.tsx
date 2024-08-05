import { AdbDevice } from "%/adb/adb-device.ts";
import { getDeviceForId } from "%/device-info/device-info.ts";
import { getIsDeviceRunning } from "%/docker/device-state.ts";
import { deviceApiEndpoint } from "%/endpoint-regex.ts";
import { createClient } from "@/utils/supabase/server.ts";
import { ImageResponse } from "next/og";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
): Promise<NextResponse | ImageResponse> {
  const id = req.nextUrl.pathname.match(deviceApiEndpoint)![1];

  const supabaseClient = createClient();
  const {
    data: { user },
  } = await supabaseClient.auth.getUser();

  if (!user) {
    return NextResponse.json({}, { status: 401 });
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
    const deviceIsUp = await getIsDeviceRunning(device);
    if (!deviceIsUp) {
      throw new Error("Device is down"); // skip to our backup plan
    }
    const adbDevice = new AdbDevice(device);
    const screencapConnection = await adbDevice.adbDeviceClient.screencap();
    const screencapStream = screencapConnection as unknown as ReadableStream;
    // stream the bytes straight from device to response
    // it is not a perfect fit into ReadableStream, but it defines all of the methods that are needed
    return new NextResponse(screencapStream, {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": "inline; filename=screenshot.png",
        "Cache-Control": "max-age=30", // 30 seconds, let preload work
      },
    });
  } catch (e: unknown) {
    // the screencap is unavailable (we already retried)
    return new ImageResponse(
      (
        // taken from /public/noconnect.svg
        <div
          style={{
            background: "white",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 100 100"
              width="500px"
              height="500px"
            >
              <rect x="35" y="30" width="30" height="40" rx="5" fill="gray" />
              <rect x="40" y="20" width="5" height="15" fill="gray" />
              <rect x="55" y="20" width="5" height="15" fill="gray" />
              <path
                d="M50 70 Q50 85 35 85"
                stroke="gray"
                strokeWidth="5"
                fill="none"
              />
              <line
                x1="25"
                y1="25"
                x2="75"
                y2="75"
                stroke="red"
                strokeWidth="5"
              />
            </svg>
            <p>Couldn&apos;t connect to {device.name}. Is it online?</p>
            <p>No se pudo conectar a {device.name}. ¿Está en línea?</p>
            <p>无法连接到 {device.name}。它在线吗？</p>
            <p>Kann nicht mit {device.name} verbinden. Ist es online?</p>
            <p>Non è possibile connettersi a {device.name}. È online?</p>
            <p>Не удается подключиться к {device.name}. Он в сети?</p>
          </div>
        </div>
      ),
      {
        width: device.redroidWidth,
        height: device.redroidHeight,
        headers: {
          "Cache-Control": "no-store, max-age=0",
          Pragma: "no-cache",
        },
      },
    );
  }
}
