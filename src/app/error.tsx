"use client"; // Error components must be Client Components

import { Button } from "@/components/ui/button.tsx";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="container">
      <h2 className="shadcn-h2 shadcn-h">Something went wrong!</h2>
      <p className="shadcn-p">
        <Button
          onClick={
            // Attempt to recover by trying to re-render the segment
            () => reset()
          }
        >
          Try again
        </Button>
      </p>
    </div>
  );
}
