import { PopulatedPage } from "@/app/(userland)/devices/multiview/server-page.tsx";
import { MultiviewSkeleton } from "@/app/(userland)/devices/multiview/skeleton.tsx";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<MultiviewSkeleton />}>
      <PopulatedPage />
    </Suspense>
  );
}
