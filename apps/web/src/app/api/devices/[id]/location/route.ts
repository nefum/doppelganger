import { AdbDevice, readFullStreamIntoBuffer } from "%/adb/adb-device.ts";
import { getDeviceForId } from "%/device-info/device-info.ts";
import { deviceApiEndpoint } from "%/endpoint-regex.ts";
import { createClient } from "@/utils/supabase/server.ts";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const locationSchema = z.object({
  latitude: z.number(), // decimal degrees
  longitude: z.number(), // decimal degrees
  altitude: z.number().nullable(), // meters above sea level
  accuracy: z.number(), // radius in meters
  altitudeAccuracy: z.number().nullable(), // +/- meters
  heading: z.number().nullable(), // 0 degrees represents true north, and the direction is determined clockwise (which means that east is 90 degrees and west is 270 degrees). // can be NaN
  speed: z.number().nullable(), // m/s
  timestamp: z.number(),
});

export type LocationPutSendType = z.infer<typeof locationSchema>;

export interface LocationPutReturnType {
  error?: string;
}

export async function PUT(
  req: NextRequest,
): Promise<NextResponse<LocationPutReturnType>> {
  const supabaseClient = createClient();
  const {
    data: { user },
  } = await supabaseClient.auth.getUser();

  if (!user) {
    return NextResponse.json({}, { status: 401 });
  }

  const id = req.nextUrl.pathname.match(deviceApiEndpoint)![1];
  const device = await getDeviceForId(id);

  if (!device || device.ownerId !== user.id) {
    return NextResponse.json({}, { status: 404 });
  }

  let bodyJson: unknown;
  try {
    bodyJson = await req.json();
  } catch (e) {
    return NextResponse.json({ error: "JSON parsing error" }, { status: 400 });
  }

  const { success, data: location, error } = await locationSchema.spa(bodyJson);

  if (!success) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const adbDevice = new AdbDevice(device);
  const adbDeviceClient = adbDevice.adbDeviceClient;
  const isEmulator = (await adbDeviceClient.getStateRuntime()) === "emulator";
  const locateInstalled = await adbDeviceClient.isInstalled(
    "xyz.regulad.pheidippides.locate",
  );

  // if we are on an emulator, instead of broadcasting a message to our client running on the device we can just run the geo fix command
  // need root to run geo fix
  if (isEmulator) {
    // geo fix longitude latitude [altitude] [satellites] [velocity]
    // Sends a simple GPS fix to the emulator. Specify longitude and latitude in decimal degrees. Use a number from 1 to 12 to specify the number of satellites to use to determine the position, and specify altitude in meters and velocity in knots.
    const { longitude, latitude, altitude, accuracy, speed } = location;

    // Calculate the number of satellites based on the accuracy value
    // The number of satellites is inversely proportional to the accuracy
    // Higher accuracy (lower value) means more satellites, up to a maximum of 12
    const satellites = Math.max(1, Math.min(12, Math.round(100 / accuracy)));

    const command = `geo fix ${longitude} ${latitude} ${altitude ?? 0} ${satellites} ${speed ?? 0}`;

    // root not required on emulators

    await adbDeviceClient.shell(command).then(readFullStreamIntoBuffer);
  } else if (locateInstalled) {
    // send the location to the client with the mock location provider

    const jsonLocation = JSON.stringify(location);

    const escapedJsonLocation = jsonLocation.replace(/"/g, '\\"');

    const command = `am start -n xyz.regulad.pheidippides.locate/.MockLocationActivity -e LOCATION_DATA "${escapedJsonLocation}"`;

    await adbDeviceClient.shell(command).then(readFullStreamIntoBuffer);
  }

  return NextResponse.json({}, { status: 200 });
}
