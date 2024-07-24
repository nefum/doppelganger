"use client";

import { Button } from "@/components/ui/button.tsx";
import Link from "next/link";
import { TbBoxMultiple } from "react-icons/tb";
import { useMediaQuery } from "usehooks-ts";

export default function MultiviewButtonClient() {
  const isSmallScreen = useMediaQuery("(max-width: 768px)");

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
