import { getDeviceForId } from "%/device-info/device-info.ts";
import { deviceApiEndpoint } from "%/endpoint-regex.ts";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// @RequiredArgsConstructor
//     private static class JsonableNotification {
//         private final @NotNull String packageName;
//         private final @NotNull String appName;
//         private final long postTimeUnixMillis;
//         private final @Nullable String title;
//         private final @Nullable String text;
//         private final @Nullable String subText;
//         private final @Nullable String summaryText;
//         private final @Nullable String bigText;
//         private final @NotNull String[] textLines;
//         private final @NotNull String category;
//         private final int priority;
//         private final int actionCount;
//         private final @Nullable String appIconDataUrl;
//         private final @Nullable String smallIconDataUrl;
//         private final @Nullable String largeIconDataUrl;
//     }

const incomingNotificationSchema = z.object({
  packageName: z.string(),
  appName: z.string(),
  postTimeUnixMillis: z.number(),
  title: z.string().optional(),
  text: z.string().optional(),
  subText: z.string().optional(),
  summaryText: z.string().optional(),
  bigText: z.string().optional(),
  textLines: z.array(z.string()),
  category: z.string(),
  priority: z.number(),
  actionCount: z.number(),
  appIconDataUrl: z.string().optional(),
  smallIconDataUrl: z.string().optional(),
  largeIconDataUrl: z.string().optional(),
});

export function getDataForUnixTimeMillis(unixTimeMillis: number): Date {
  return new Date(unixTimeMillis);
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const id = req.nextUrl.pathname.match(deviceApiEndpoint)![1];
  const device = await getDeviceForId(id);
  const secret = req.headers.get("X-Doppelganger-Secret");

  if (!device) {
    // its whatever that this can expose unknown devices
    return NextResponse.json({}, { status: 404 });
  }

  if (!secret || device.redroidSecret !== secret) {
    return NextResponse.json({}, { status: 401 });
  }

  let notificationBody: unknown;
  try {
    notificationBody = await req.json();
  } catch (e: any) {
    return NextResponse.json(
      {
        error: "JSON body could not be parsed",
      },
      { status: 400 },
    );
  }
  const { success: parseSuccess, data: notification } =
    await incomingNotificationSchema.spa(notificationBody);

  if (!parseSuccess) {
    return NextResponse.json(
      {
        error: "Invalid notification body",
      },
      { status: 400 },
    );
  }

  // TODO: Implement sending the notification to the device

  return NextResponse.json(
    {
      success: true,
    },
    { status: 200 },
  );
}
