import prisma from "%/database/prisma.ts";
import { bringDownDevice, getIsDeviceRunning } from "%/docker/device-state.ts";
import { BASE_ORIGIN, FREE_TIER_IDLE_TIME_MS } from "@/constants.ts";
import {
  getSubscriptionStatus,
  SubscriptionStatus,
} from "@/utils/subscriptions.ts";
import * as OneSignal from "@onesignal/node-onesignal";
import { Device } from "@prisma/client";
import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";

// fsr ci tries to ssr this route, but it is cron
export const dynamic = "force-dynamic";

async function sendDeviceDeletedNotification(device: Device): Promise<void> {
  const destinationNotification = new OneSignal.Notification();
  destinationNotification.app_id = process.env.ONESIGNAL_APP_ID!;
  destinationNotification.include_aliases = { external_id: [device.ownerId] };
  destinationNotification.target_channel = "push";

  // prompt the user to upgrade
  destinationNotification.headings = {
    en: "Your device has been shut down!",
  };
  destinationNotification.contents = {
    en: "Upgrade to Pro to run your device in the background.",
  };
  destinationNotification.priority = 10;
  destinationNotification.web_url = `${BASE_ORIGIN}/subscribe`;
}

async function shutdownAbandonedDevice(device: Device): Promise<void> {
  const deviceRunning = await getIsDeviceRunning(device);

  if (!deviceRunning) {
    return; // no need to process
  }

  const lastConnectedAt = device.lastConnectedAt ?? new Date();

  const shutdownTime = lastConnectedAt.getTime() + FREE_TIER_IDLE_TIME_MS;

  if (Date.now() < shutdownTime) {
    return; // not yet time to shutdown
  }

  // shutdown the device
  await bringDownDevice(device.id);

  // todo: if i migrate to serverless, do I need to wait for these to be sent out?
  sendDeviceDeletedNotification(device).catch((e) => {
    console.error("Failed to send device deleted notification", e);
    Sentry.captureException(e);
  });
}

async function handleOwner(ownerId: string, devices: Device[]): Promise<void> {
  const subscriptionStatus = await getSubscriptionStatus(ownerId);

  if (
    subscriptionStatus === SubscriptionStatus.PRO ||
    subscriptionStatus === SubscriptionStatus.PLUS
  ) {
    // do nothing, their devices are allowed to run in the background
    return;
  }

  const devicePromises = devices.map((device) =>
    shutdownAbandonedDevice(device),
  );

  await Promise.all(devicePromises);
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const allDevices = await prisma.device.findMany({
    where: {
      id:
        process.env.NODE_ENV === "production"
          ? { not: { endsWith: "staging" } }
          : { endsWith: "staging" },
    },
  });

  // group the devices by ownerId
  const devicesByOwner = allDevices.reduce(
    (acc, device) => {
      if (!acc[device.ownerId]) {
        acc[device.ownerId] = [];
      }
      acc[device.ownerId].push(device);
      return acc;
    },
    {} as Record<string, Device[]>,
  );

  // handle each owner
  const devicePromises = Object.keys(devicesByOwner).map((ownerId) =>
    handleOwner(ownerId, devicesByOwner[ownerId]),
  );

  await Promise.all(devicePromises);

  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}
