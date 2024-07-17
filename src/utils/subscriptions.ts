import { MAX_DEVICES_FREE, MAX_DEVICES_PREMIUM } from "@/app/constants.ts";

export enum SubscriptionStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export async function getSubscriptionStatus(
  userId: string,
): Promise<SubscriptionStatus> {
  return userId === "4d7a801f-130a-438f-b013-31e738693fad"
    ? SubscriptionStatus.ACTIVE
    : SubscriptionStatus.INACTIVE; // TODO
}

export function getMaxDeviceCount(
  subscriptionStatus: SubscriptionStatus,
): number {
  return subscriptionStatus === SubscriptionStatus.ACTIVE
    ? MAX_DEVICES_PREMIUM
    : MAX_DEVICES_FREE;
}
