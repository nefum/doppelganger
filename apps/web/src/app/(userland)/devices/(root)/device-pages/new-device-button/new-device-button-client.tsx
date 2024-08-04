"use client";

import { NewDeviceButtonStatic } from "@/app/(userland)/devices/(root)/device-pages/new-device-button/new-device-button-static.tsx";
import { useToast } from "@/components/ui/use-toast.ts";
import React, { ReactNode } from "react";

import { SubscriptionStatus } from "@/utils/subscriptions.ts";

export default function NewDeviceButtonClient({
  emailVerified,
  subscriptionStatus,
}: Readonly<{
  emailVerified: boolean;
  subscriptionStatus: SubscriptionStatus;
}>): ReactNode {
  const { toast } = useToast();

  return (
    <NewDeviceButtonStatic
      onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        if (!emailVerified) {
          e.preventDefault();
          toast({
            title: "Email not verified",
            description:
              "Please verify your email address before creating a new device.",
          });
        }
      }}
    />
  );
}
