import { MAX_DEVICES_FREE, MAX_DEVICES_PRO } from "@/constants.ts";

export enum SubscriptionStatus {
  PRO = "PRO",
  PLUS = "PLUS",
  INACTIVE = "INACTIVE",
}

export async function getSubscriptionStatus(
  userId: string,
): Promise<SubscriptionStatus> {
  return userId === "4d7a801f-130a-438f-b013-31e738693fad"
    ? SubscriptionStatus.PRO
    : SubscriptionStatus.INACTIVE; // TODO
}

export function getMaxDeviceCount(
  subscriptionStatus: SubscriptionStatus,
): number {
  switch (subscriptionStatus) {
    case SubscriptionStatus.PRO:
      return MAX_DEVICES_PRO;
    default:
      return MAX_DEVICES_FREE;
  }
}
