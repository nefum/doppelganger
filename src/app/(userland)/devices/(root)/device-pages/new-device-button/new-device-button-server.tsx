"use server";

import NewDeviceDialogClient from "@/app/(userland)/devices/(root)/device-pages/new-device-form/new-device-form.tsx";
import { getSubscriptionStatus } from "@/app/utils/subscriptions.ts";
import { createClient } from "@/utils/supabase/server.ts";

export async function NewDeviceButtonServer() {
  const supabaseClient = createClient();
  const {
    data: { user },
  } = await supabaseClient.auth.getUser();
  // user will never be null here
  const subscriptionStatus = await getSubscriptionStatus(user!.id);
  const emailVerified = !!user!.email_confirmed_at;

  return (
    <NewDeviceDialogClient
      emailVerified={emailVerified}
      subscriptionStatus={subscriptionStatus}
    />
  );
}
