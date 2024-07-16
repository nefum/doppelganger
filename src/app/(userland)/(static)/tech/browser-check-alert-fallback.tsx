import dynamic from "next/dynamic";
import { Suspense } from "react";
import BrowserCheckAlertSkeleton from "./browser-check-alert-skeleton.tsx";

const BrowserCheckAlertContent = dynamic(
  () => import("./browser-check-alert.tsx"),
  {
    ssr: false,
    loading: () => <BrowserCheckAlertSkeleton />,
  },
);

export default function BrowserCheckAlertFallback() {
  return (
    <Suspense fallback={<BrowserCheckAlertSkeleton />}>
      <BrowserCheckAlertContent />
    </Suspense>
  );
}
