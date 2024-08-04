import { BASE_ORIGIN } from "%/constants.ts";
import { getPrisma } from "%/database/prisma.ts";
import { createStripeCustomer } from "@/app/api/stripe/(checkout-session)/stripe-customer.ts";
import createStripeClient from "@/utils/stripe/server.ts";
import { createClient } from "@/utils/supabase/server.ts";
import { getQueryForToast } from "@/utils/toast-utils.ts";
import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const prisma = getPrisma();

  try {
    const supabase = createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    // Get priceId from query parameter
    const priceId = req.nextUrl.searchParams.get("priceId");
    if (!priceId) {
      return NextResponse.redirect(
        new URL(
          `/subscribe${getQueryForToast({
            title: "Invalid Request",
            description: "No price ID provided. Please try again.",
          })}`,
          BASE_ORIGIN,
        ),
      );
    }

    if (userError) {
      Sentry.captureException(userError);
      return NextResponse.redirect(
        new URL(
          `/login${getQueryForToast({
            title: "Sign in",
            description: "Please sign in to start your subscription.",
          })}&next=${encodeURIComponent(`/api/stripe/get-checkout-session?priceId=${priceId}`)}`,
          BASE_ORIGIN,
        ),
      );
    }

    if (!user) {
      return NextResponse.redirect(
        new URL(
          `/login${getQueryForToast({
            title: "Sign in",
            description: "Please sign in to start your subscription.",
          })}&next=${encodeURIComponent(`/api/stripe/get-checkout-session?priceId=${priceId}`)}`,
          BASE_ORIGIN,
        ),
      );
    }

    if (!user.email_confirmed_at) {
      return NextResponse.redirect(
        new URL(
          `/user${getQueryForToast({
            title: "Email Confirmation Required",
            description: "Please confirm your email before subscribing.",
          })}`,
          BASE_ORIGIN,
        ),
      );
    }

    const stripe = await createStripeClient();

    let stripeCustomer = await prisma.stripeCustomer.findUnique({
      where: { supabaseUserId: user.id },
    });

    if (stripeCustomer) {
      try {
        const stripeCustomerData = await stripe.customers.retrieve(
          stripeCustomer.stripeCustomerId,
        );

        if (stripeCustomerData.deleted) {
          throw new Error("Stripe customer was deleted");
        }

        if (stripeCustomerData.email !== user.email) {
          await stripe.customers.update(stripeCustomer.stripeCustomerId, {
            email: user.email,
          });
        }
      } catch (error) {
        Sentry.captureException(error);
        console.log(
          "Error retrieving Stripe customer, creating a new one:",
          error,
        );
        stripeCustomer = await createStripeCustomer(user.email!, user.id);
      }
    } else {
      stripeCustomer = await createStripeCustomer(user.email!, user.id);
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer: stripeCustomer.stripeCustomerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: new URL(
        `/devices${getQueryForToast({
          title: "Success",
          description:
            "Your subscription was successful! Welcome to Doppelganger Premium!",
        })}`,
        BASE_ORIGIN,
      ).toString(),
      cancel_url: new URL(
        `/subscribe${getQueryForToast({
          title: "Canceled",
          description:
            "Your signup was cancelled. Would you like to tell us why? ",
        })}`,
        BASE_ORIGIN,
      ).toString(),
    });

    return NextResponse.redirect(session.url!);
  } catch (error) {
    console.error("Error creating checkout session:", error);
    Sentry.captureException(error);
    return NextResponse.redirect(
      new URL(
        `/subscribe${getQueryForToast({
          title: "Error",
          description: "An unexpected error occurred. Please try again later.",
        })}`,
        BASE_ORIGIN,
      ),
    );
  }
}
