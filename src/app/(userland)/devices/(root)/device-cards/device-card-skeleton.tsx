import { Card } from "@/components/ui/card.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";

export function DeviceCardSkeleton() {
  return (
    <div className="w-full xs:max-w-[400px] p-3">
      <Card className="w-full max-w-md">
        <div className="grid grid-cols-[1fr_200px] gap-6 p-4">
          <div className="space-y-4">
            <div className="space-y-1">
              <Skeleton className="h-6 sm:w-12 md:w-22 lg:w-32" />
              <div className="flex items-center gap-2 text-muted-foreground">
                <Skeleton className="h-2 w-2 rounded-full" />
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
            <div className="space-y-1">
              <Skeleton className="h-4 w-10 lg:w-20" />
              <Skeleton className="h-4 w-8 lg:w-16" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
          <Skeleton className="rounded-lg object-cover aspect-[2/4]" />
        </div>
      </Card>
    </div>
  );
}
