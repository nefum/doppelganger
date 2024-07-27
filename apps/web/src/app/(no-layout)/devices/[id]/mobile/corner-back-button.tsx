"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CornerBackButton() {
  const router = useRouter();

  return (
    <Button
      variant="outline"
      className="z-[999] fixed opacity-50 left-0 bottom-0 p-2 rounded-none rounded-tr-xl bg-background text-primary hover:bg-primary/10 hover:text-primary border-primary border-t border-r border-l-transparent border-b-transparent"
      size="icon"
      onClick={() => router.back()}
    >
      <ArrowLeft className="h-6 w-6" />
    </Button>
  );
}
