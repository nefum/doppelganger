import "server-only";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET) {
  throw new Error("STRIPE_SECRET is not set");
}

export default async function createClient(): Promise<Stripe> {
  return new Stripe(process.env.STRIPE_SECRET!, {
    apiVersion: "2024-06-20",
    appInfo: {
      name: "Doppelganger",
      // version: '1.0.0', // no way to provide verison
    },
  });
}
