import { getDeviceForId } from "%/device-info/device-info.ts";
import { deviceApiEndpoint } from "%/endpoint-regex.ts";
import getStaticUrlForImageDataUrl from "@/app/api/render/path.ts";
import { BASE_ORIGIN } from "@/constants.ts";
import {
  ONESIGNAL_APP_ID,
  oneSignalClient,
} from "@/utils/onesignal/onesignal-server.ts";
import * as OneSignal from "@onesignal/node-onesignal";
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
  category: z.string().optional(),
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
  const { success: parseSuccess, data: incomingNotification } =
    await incomingNotificationSchema.spa(notificationBody);

  if (!parseSuccess) {
    return NextResponse.json(
      {
        error: "Invalid notification body",
      },
      { status: 400 },
    );
  }

  const destinationNotification = new OneSignal.Notification();
  destinationNotification.app_id = ONESIGNAL_APP_ID;
  destinationNotification.include_aliases = { external_id: [device.ownerId] };
  destinationNotification.target_channel = "push";

  // wrap all fields of the incomingNotification
  destinationNotification.headings = {
    en: `${incomingNotification.appName} via ${device.name}`,
  };
  destinationNotification.contents = {
    en: incomingNotification.title
      ? `${incomingNotification.title}: ${incomingNotification.text || ""}`
      : incomingNotification.text || "",
  };
  destinationNotification.priority = incomingNotification.priority;
  if (incomingNotification.bigText) {
    destinationNotification.subtitle = { en: incomingNotification.bigText };
  }

  // image note: we can't provide a data url, so we need to provide a public url
  // to avoid holding anything on our servers and just doing compute instead, there is a url at /api/render?i=(uri data url) that can take the data url and return an image

  // three images from the android device: appIcon, smallIcon, largeIcon
  // large icon shows on right side of a notification
  const largeIconStaticUrl = incomingNotification?.largeIconDataUrl
    ? getStaticUrlForImageDataUrl(incomingNotification.largeIconDataUrl)
    : null;
  // small icon is what goes in the status bar
  const smallIconStaticUrl = incomingNotification.smallIconDataUrl
    ? getStaticUrlForImageDataUrl(incomingNotification.smallIconDataUrl)
    : null;
  const appIconStaticUrl = incomingNotification.appIconDataUrl
    ? getStaticUrlForImageDataUrl(incomingNotification.appIconDataUrl)
    : null;

  // if a line is commented out, it's probably android-only
  if (largeIconStaticUrl) {
    destinationNotification.big_picture = largeIconStaticUrl;
    destinationNotification.adm_big_picture = largeIconStaticUrl;
    destinationNotification.chrome_big_picture = largeIconStaticUrl;
    destinationNotification.huawei_big_picture = largeIconStaticUrl;
    destinationNotification.large_icon = largeIconStaticUrl;
    destinationNotification.adm_large_icon = largeIconStaticUrl;
    destinationNotification.chrome_web_image = largeIconStaticUrl;
  }

  if (smallIconStaticUrl) {
    destinationNotification.small_icon = smallIconStaticUrl;
    destinationNotification.adm_small_icon = smallIconStaticUrl;
    destinationNotification.chrome_web_badge = smallIconStaticUrl;
  }

  if (appIconStaticUrl) {
    destinationNotification.chrome_web_icon = appIconStaticUrl;
    destinationNotification.firefox_icon = appIconStaticUrl;
  }

  destinationNotification.web_url = `${BASE_ORIGIN}/devices/${device.id}`;

  destinationNotification.ios_badge_type = "Increase";
  destinationNotification.ios_badge_count = 1;

  await oneSignalClient.createNotification(destinationNotification);

  return NextResponse.json(
    {
      success: true,
    },
    { status: 200 },
  );
}
