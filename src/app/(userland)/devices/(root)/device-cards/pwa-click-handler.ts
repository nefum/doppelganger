import { checkPWA } from "@/utils/hooks/use-is-pwa.ts";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { MouseEvent as ReactMouseEvent } from "react";

export default function pwaClickHandler(
  router: AppRouterInstance,
  deviceInfo: { id: string },
  e: ReactMouseEvent<HTMLButtonElement, MouseEvent>,
): boolean {
  const isPWA = checkPWA();
  if (isPWA) {
    e.preventDefault();
    router.push(`/devices/${deviceInfo.id}/mobile`);
  }
  return isPWA;
}
