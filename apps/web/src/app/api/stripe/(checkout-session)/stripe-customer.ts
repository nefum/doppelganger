import prisma from "%/database/prisma.ts";
import createStripeClient from "@/utils/stripe/server.ts";
import * as Sentry from "@sentry/nextjs";

export async function createStripeCustomer(
  email: string,
  supabaseUserId: string,
) {
  const stripe = await createStripeClient();

  try {
    const customer = await stripe.customers.create({
      email: email,
      metadata: { supabaseUserId: supabaseUserId },
    });

    // If a record already exists, update it. Otherwise, create a new one.
    return await prisma.stripeCustomer.upsert({
      where: { supabaseUserId: supabaseUserId },
      update: { stripeCustomerId: customer.id },
      create: {
        supabaseUserId: supabaseUserId,
        stripeCustomerId: customer.id,
      },
    });
  } catch (error) {
    Sentry.captureException(error);
    throw new Error("Failed to create Stripe customer");
  }
}
