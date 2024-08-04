import { PLUS_STRIPE_PRODUCT, PRO_STRIPE_PRODUCT } from "%/constants.ts";
import { getPrisma } from "%/database/prisma.ts";
import { SubscriptionStatus } from "@/utils/subscriptions";
import "server-only";

export async function getSubscriptionStatus(
  userId: string,
): Promise<SubscriptionStatus> {
  const prisma = getPrisma();

  try {
    // Find the StripeCustomer associated with the Supabase user
    const stripeCustomer = await prisma.stripeCustomer.findUnique({
      where: { supabaseUserId: userId },
      include: { Subscription: true },
    });

    if (!stripeCustomer || stripeCustomer.Subscription.length === 0) {
      return SubscriptionStatus.FREE;
    }

    // Find the most recent active subscription
    const activeSubscription = stripeCustomer.Subscription.filter((sub) =>
      ["active", "trialing"].includes(sub.status),
    ).sort(
      (a, b) => b.currentPeriodEnd.getTime() - a.currentPeriodEnd.getTime(),
    )[0];

    if (!activeSubscription) {
      return SubscriptionStatus.FREE;
    }

    // Map Stripe price ID to SubscriptionStatus
    // You'll need to replace these with your actual Stripe price IDs
    switch (activeSubscription.stripePriceId) {
      case PLUS_STRIPE_PRODUCT:
        return SubscriptionStatus.PLUS;
      case PRO_STRIPE_PRODUCT:
        return SubscriptionStatus.PRO;
      default:
        return SubscriptionStatus.FREE;
    }
  } catch (error) {
    console.error("Error fetching subscription status:", error);
    return SubscriptionStatus.FREE; // Default to FREE on error
  }
}
