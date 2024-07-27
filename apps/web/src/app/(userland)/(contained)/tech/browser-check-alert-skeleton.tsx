import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

export default function BrowserCheckAlertSkeleton() {
  return (
    <Alert>
      <Skeleton className="h-4 w-4 mr-2" />
      <AlertTitle>
        <Skeleton className="h-4 w-40" />
      </AlertTitle>
      <AlertDescription>
        <Skeleton className="h-4 w-64 mt-2" />
      </AlertDescription>
    </Alert>
  );
}
