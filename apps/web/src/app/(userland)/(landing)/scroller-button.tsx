"use client";

import { Button } from "@/components/ui/button.tsx";

export default function ScrollerButton() {
  return (
    <Button
      variant="secondary"
      onClick={() => {
        // scroll down 1 secton smoothly
        window.scrollTo({
          top: window.innerHeight,
          behavior: "smooth",
        });
      }}
    >
      Learn more
    </Button>
  );
}
