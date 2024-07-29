"use client";

import { Button } from "@/components/ui/button.tsx";
import { TbBoxMultiple } from "react-icons/tb";
import { Link } from "react-transition-progress/next";
import { useMediaQuery } from "usehooks-ts";

export default function MultiviewButtonClient() {
  // this is ssr'd
  const isSmallScreen = useMediaQuery("(max-width: 768px)", {
    defaultValue: true,
    initializeWithValue: false,
  });

  if (isSmallScreen) {
    return null;
  }

  return (
    <Button variant="secondary" asChild>
      <Link href="/devices/multiview">
        <TbBoxMultiple className="mr-2 h-4 w-4" />
        Open Multiview
      </Link>
    </Button>
  );
}
