"use client";

import { Button } from "@/components/ui/button.tsx";
import { useToast } from "@/components/ui/use-toast.ts";
import { LuCopy } from "react-icons/lu";

export default function CopyButton({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  const { toast } = useToast();
  return (
    <Button
      variant="ghost"
      onClick={() =>
        navigator.clipboard
          .writeText(value)
          .then(() =>
            toast({
              title: "Copied successfully!",
            }),
          )
          .catch(() =>
            toast({
              title: "Failed to copy",
              description: "Please try again later.",
            }),
          )
      }
    >
      <LuCopy className={className} />
    </Button>
  );
}
