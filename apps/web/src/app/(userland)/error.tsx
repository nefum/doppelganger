"use client"; // Error components must be Client Components

import { Button } from "@/components/ui/button.tsx";
import * as Sentry from "@sentry/nextjs";
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
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="container">
      <h2 className="shadcn-h2 shadcn-h">Something went wrong!</h2>
      <p className="shadcn-p">
        An error occurred while showing you this page. That&apos;s all we know.
        Please reach out to support if this keeps happening.
      </p>
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
