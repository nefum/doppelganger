import { loadStripe, Stripe } from "@stripe/stripe-js";
import "client-only";

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE) {
  throw new Error("NEXT_PUBLIC_STRIPE_PUBLISHABLE is not set");
}

export default async function createClient(): Promise<Stripe | null> {
  return await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE!);
}
