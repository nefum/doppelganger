export enum SubscriptionStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export async function getSubscriptionStatus(
  userId: string,
): Promise<SubscriptionStatus> {
  return SubscriptionStatus.INACTIVE; // TODO
}
