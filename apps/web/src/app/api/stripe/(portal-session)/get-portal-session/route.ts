import { BASE_ORIGIN } from "%/constants.ts";
import { getPrisma } from "%/database/prisma.ts";
import createStripeClient from "@/utils/stripe/server.ts";
import { createClient } from "@/utils/supabase/server.ts";
import { getQueryForToast } from "@/utils/toast-utils.ts";
import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  const prisma = getPrisma();

  try {
    const supabase = createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      Sentry.captureException(userError);
      return NextResponse.redirect(
        new URL(
          `/login${getQueryForToast({
            title: "Sign in",
            description:
              "Something went wrong. Please sign in to edit your subscription.",
          })}&next=${encodeURIComponent("/api/stripe/get-portal-session")}`,
          BASE_ORIGIN,
        ),
      );
    }

    if (!user) {
      return NextResponse.redirect(
        new URL(
          `/login${getQueryForToast({
            title: "Sign in",
            description: "Please sign in to edit your subscription.",
          })}&next=${encodeURIComponent("/api/stripe/get-portal-session")}`,
          BASE_ORIGIN,
        ),
      );
    }

    if (!user.email_confirmed_at) {
      return NextResponse.redirect(
        new URL(
          `/user${getQueryForToast({
            title: "Email Confirmation Required",
            description: "Please confirm your email before proceeding.",
          })}`,
          BASE_ORIGIN,
        ),
      );
    }

    const stripe = await createStripeClient();

    let stripeCustomer = await prisma.stripeCustomer.findUnique({
      where: { supabaseUserId: user.id },
    });

    if (!stripeCustomer) {
      return NextResponse.redirect(
        new URL(
          `/user${getQueryForToast({
            title: "Stripe Customer Not Found",
            description:
              "No associated Stripe customer found for your account. Do you have a subscription? Subscribe today!",
          })}`,
          BASE_ORIGIN,
        ),
      );
    }

    try {
      const stripeCustomerData = await stripe.customers.retrieve(
        stripeCustomer.stripeCustomerId,
      );

      if (stripeCustomerData.deleted) {
        return NextResponse.redirect(
          new URL(
            `/user${getQueryForToast({
              title: "Stripe Customer Error",
              description:
                "Your Stripe customer account no longer exists. Please contact support to unsubscribe",
            })}`,
            BASE_ORIGIN,
          ),
        );
      }

      if (stripeCustomerData.email !== user.email) {
        await stripe.customers.update(stripeCustomer.stripeCustomerId, {
          email: user.email,
        });
      }
    } catch (error) {
      Sentry.captureException(error);
      return NextResponse.redirect(
        new URL(
          `/user${getQueryForToast({
            title: "Stripe Error",
            description: "Please try again later",
          })}`,
          BASE_ORIGIN,
        ),
      );
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: stripeCustomer.stripeCustomerId,
      return_url: new URL("/user", BASE_ORIGIN).toString(),
    });

    return NextResponse.redirect(portalSession.url);
  } catch (error) {
    console.error("Error creating portal session:", error);
    Sentry.captureException(error);
    return NextResponse.redirect(
      new URL(
        `/user${getQueryForToast({
          title: "Internal Server Error",
          description: "An unexpected error occurred. Please try again later.",
        })}`,
        BASE_ORIGIN,
      ),
    );
  }
}
