import prisma from "%/database/prisma.ts";
import createStripeClient from "@/utils/stripe/server";
import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

interface WebhookResponse {
  received?: boolean;
  error?: string;
}

export async function POST(
  req: NextRequest,
): Promise<NextResponse<WebhookResponse>> {
  const stripe = await createStripeClient();
  const body = await req.text();
  const sig = req.headers.get("stripe-signature") as string;

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );

    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionCreatedOrUpdated(
          event.data.object as Stripe.Subscription,
        );
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription,
        );
        break;
      // Add more event types as needed
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    Sentry.captureException(err);
    return NextResponse.json({ error: "Webhook Error" }, { status: 400 });
  }
}

async function handleSubscriptionCreatedOrUpdated(
  subscription: Stripe.Subscription,
) {
  const {
    id,
    customer,
    status,
    items,
    current_period_start,
    current_period_end,
  } = subscription;

  const stripeCustomerId =
    typeof customer === "string" ? customer : customer.id;

  try {
    // First, ensure the StripeCustomer exists
    const stripeCustomer = await prisma.stripeCustomer.findUnique({
      where: { stripeCustomerId: stripeCustomerId },
    });

    if (!stripeCustomer) {
      throw new Error(
        `StripeCustomer not found for Stripe customer ID: ${stripeCustomerId}`,
      );
    }

    // Now create or update the subscription
    await prisma.subscription.upsert({
      where: { stripeSubscriptionId: id },
      update: {
        status,
        stripePriceId: items.data[0].price.id,
        currentPeriodStart: new Date(current_period_start * 1000),
        currentPeriodEnd: new Date(current_period_end * 1000),
      },
      create: {
        stripeSubscriptionId: id,
        stripePriceId: items.data[0].price.id,
        status,
        currentPeriodStart: new Date(current_period_start * 1000),
        currentPeriodEnd: new Date(current_period_end * 1000),
        customer: {
          connect: { stripeCustomerId: stripeCustomerId },
        },
      },
    });

    console.log(
      `Subscription ${id} created or updated for customer ${stripeCustomerId}`,
    );
  } catch (error) {
    console.error("Error updating subscription in database:", error);
    Sentry.captureException(error);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const { id } = subscription;

  try {
    await prisma.subscription.update({
      where: { stripeSubscriptionId: id },
      data: { status: "canceled" },
    });

    console.log(`Subscription ${id} marked as canceled`);
  } catch (error) {
    console.error("Error marking subscription as canceled in database:", error);
    Sentry.captureException(error);
  }
}
