"use client";

import { Button } from "@/components/ui/button.tsx";
import { LuCopy } from "react-icons/lu";

export default function CopyButton({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  return (
    <Button
      variant="ghost"
      onClick={() => navigator.clipboard.writeText(value)}
    >
      <LuCopy className={className} />
    </Button>
  );
}
