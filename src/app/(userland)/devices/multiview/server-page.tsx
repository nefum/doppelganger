"use server";

import { Multiview } from "@/app/(userland)/devices/multiview/client.tsx";
import styles from "@/components/center.module.css";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { getDevicesForUser } from "@/utils/devices.ts";
import {
  getSubscriptionStatus,
  SubscriptionStatus,
} from "@/utils/subscriptions.ts";
import { createClient } from "@/utils/supabase/server.ts";
import Link from "next/link";
import { LuArrowRight } from "react-icons/lu";
function NoPremiumCard() {
  return (
    <div className={styles.absolutelyCenteredItem}>
      <Card>
        <CardHeader>
          <CardTitle>Doppelganger Pro is required to use Multiview</CardTitle>
          <CardDescription>
            To create multiple devices and use Multiview, you must be subscribed
            to Doppelganger Pro. Learn more about Multiview and all other
            premium features at the link below.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4">
          <div className="flex space-x-2">
            <Button className="flex-1" asChild>
              <Link href="/multiview">
                Learn more about Multiview
                <LuArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button className="flex-1" asChild>
              <Link href="/premium">
                Learn more about Premium & Sign up
                <LuArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export async function PopulatedPage() {
  const supabaseClient = createClient();
  const {
    data: { user },
    error,
  } = await supabaseClient.auth.getUser();

  if (error) {
    throw error;
  }

  if (!user) {
    throw new Error("Unauthenticated");
  }

  const subscriptionStatus = await getSubscriptionStatus(user.id);

  if (subscriptionStatus !== SubscriptionStatus.PRO) {
    return <NoPremiumCard />;
  }

  const devices = await getDevicesForUser(user);

  return <Multiview devices={devices} />;
}
