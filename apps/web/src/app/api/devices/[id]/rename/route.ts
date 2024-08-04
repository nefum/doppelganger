import { getPrisma } from "%/database/prisma.ts";
import { getDeviceForId } from "%/device-info/device-info.ts";
import { deviceApiEndpoint } from "%/endpoint-regex.ts";
import { createClient } from "@/utils/supabase/server.ts";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest): Promise<NextResponse> {
  const prisma = getPrisma();

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

  let reqJson: { name: string };
  try {
    reqJson = await req.json();
  } catch (e) {
    return NextResponse.json(
      {
        error: "Invalid JSON",
      },
      { status: 400 },
    );
  }

  if (!reqJson.name) {
    return NextResponse.json(
      {
        error: "Missing name",
      },
      { status: 400 },
    );
  }

  await prisma.device.update({
    where: {
      id: device.id,
    },
    data: {
      name: reqJson.name,
    },
  });

  return NextResponse.json(
    {
      success: true,
    },
    { status: 200 },
  );
}
