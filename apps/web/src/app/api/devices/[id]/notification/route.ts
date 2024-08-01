import { BASE_ORIGIN } from "%/constants.ts";
import { getDeviceForId } from "%/device-info/device-info.ts";
import { deviceApiEndpoint } from "%/endpoint-regex.ts";
import getStaticUrlForImageDataUrl from "@/app/api/render/path.ts";
import { getDeviceIsActive } from "@/utils/devices.ts";
import getOneSignalClient from "@/utils/onesignal/onesignal-server.ts";
import * as OneSignal from "@onesignal/node-onesignal";
import { Device } from "@prisma/client";
import * as Sentry from "@sentry/node";
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

// any packages that start with these strings will not be broadcasted
const doNotBroadcastPackages = [
  "com.android",
  "com.google.android.gms", // This device isn’t Play Protect certified: Google apps and services can’t run on this device
  "com.rom1v.sndcpy", // sndcpy
  "xyz.regulad.pheidippides",
  "org.fdroid", // tends to just spam
];

function getSizeBytesOfString(str: string): number {
  return new TextEncoder().encode(str).length;
}

function createOneSignalNotifciationForIncomingNotification(
  device: Device,
  incomingNotification: z.infer<typeof incomingNotificationSchema>,
): OneSignal.Notification {
  const destinationNotification = new OneSignal.Notification();
  destinationNotification.app_id = process.env.ONESIGNAL_APP_ID!;
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

  // size limit of 1024 bytes for all images

  // if a line is commented out, it's probably android-only
  if (largeIconStaticUrl && getSizeBytesOfString(largeIconStaticUrl) < 1024) {
    destinationNotification.big_picture = largeIconStaticUrl;
    destinationNotification.adm_big_picture = largeIconStaticUrl;
    destinationNotification.chrome_big_picture = largeIconStaticUrl;
    destinationNotification.huawei_big_picture = largeIconStaticUrl;
    destinationNotification.large_icon = largeIconStaticUrl;
    destinationNotification.adm_large_icon = largeIconStaticUrl;
    destinationNotification.chrome_web_image = largeIconStaticUrl;
  }

  if (smallIconStaticUrl && getSizeBytesOfString(smallIconStaticUrl) < 1024) {
    destinationNotification.small_icon = smallIconStaticUrl;
    destinationNotification.adm_small_icon = smallIconStaticUrl;
    destinationNotification.chrome_web_badge = smallIconStaticUrl;
  }

  if (appIconStaticUrl && getSizeBytesOfString(appIconStaticUrl) < 1024) {
    destinationNotification.chrome_web_icon = appIconStaticUrl;
    destinationNotification.firefox_icon = appIconStaticUrl;
  }

  destinationNotification.web_url = `${BASE_ORIGIN}/devices/${device.id}`;

  destinationNotification.ios_badge_type = "Increase";
  destinationNotification.ios_badge_count = 1;
  return destinationNotification;
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

  let deviceIsActive: boolean;
  try {
    deviceIsActive = getDeviceIsActive(device);
  } catch (e: unknown) {
    console.error("error checking if device is active, assuming it isn't", e);
    Sentry.captureException(e);
    deviceIsActive = false;
  }

  // we shouldn't send notiifications for system packages or if the device is active
  const shouldSend =
    !doNotBroadcastPackages
      .map((badPkg) => {
        return incomingNotification.packageName.trim().startsWith(badPkg);
      })
      .some((isBad) => isBad) && !deviceIsActive;

  if (shouldSend) {
    const destinationNotification =
      createOneSignalNotifciationForIncomingNotification(
        device,
        incomingNotification,
      );

    const oneSignalClient = getOneSignalClient();
    await oneSignalClient.createNotification(destinationNotification);
  }

  return NextResponse.json(
    {
      success: true,
    },
    { status: 200 },
  );
}
