import prisma from "%/database/prisma.ts";
import { bringDownDevice, getIsDeviceRunning } from "%/docker/device-state.ts";
import { FREE_TIER_IDLE_TIME_MS } from "@/app/constants.ts";
import {
  getSubscriptionStatus,
  SubscriptionStatus,
} from "@/utils/subscriptions.ts";
import { Device } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

// fsr ci tries to ssr this route, but it is cron
export const dynamic = "force-dynamic";

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

  // todo: notify that the device was shut down automatically
}

async function handleOwner(ownerId: string, devices: Device[]): Promise<void> {
  const subscriptionStatus = await getSubscriptionStatus(ownerId);

  if (subscriptionStatus === SubscriptionStatus.ACTIVE) {
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
