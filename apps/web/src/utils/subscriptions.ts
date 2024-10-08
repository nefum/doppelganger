import {
  FREE_MAX_FPS,
  MAX_DEVICES_FREE,
  MAX_DEVICES_PLUS,
  MAX_DEVICES_PRO,
  PLUS_MAX_FPS,
  PRO_MAX_FPS,
} from "%/constants.ts";

export enum SubscriptionStatus {
  PRO = "PRO",
  PLUS = "PLUS",
  FREE = "FREE",
}

export function getMaxDeviceCount(
  subscriptionStatus: SubscriptionStatus,
): number {
  switch (subscriptionStatus) {
    case SubscriptionStatus.PRO:
      return MAX_DEVICES_PRO;
    case SubscriptionStatus.PLUS:
      return MAX_DEVICES_PLUS;
    default:
      return MAX_DEVICES_FREE;
  }
}

export function getMaxFps(subscriptionStatus: SubscriptionStatus): number {
  switch (subscriptionStatus) {
    case SubscriptionStatus.PRO:
      return PRO_MAX_FPS;
    case SubscriptionStatus.PLUS:
      return PLUS_MAX_FPS;
    default:
    case SubscriptionStatus.FREE:
      return FREE_MAX_FPS;
  }
}
