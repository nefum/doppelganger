import { Card } from "@/components/ui/card";
import { clsx } from "clsx";
import { PARENT_DIV_CLASSES } from "@/components/device-cards/device-card-snapshot-client";

export function DeviceCardSkeleton() {
  return (
    <Card className="w-full max-w-sm animate-pulse">
      <div className="grid grid-cols-[1fr_200px] gap-6 p-4">
        <div className="space-y-4">
          <div className="space-y-1">
            <div className="h-6 bg-gray-300 rounded-md w-3/4"></div>{" "}
            {/* Placeholder for device name */}
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-gray-300"></div>{" "}
              {/* Placeholder for device state indicator */}
              <div className="h-4 bg-gray-300 rounded-md w-1/4"></div>{" "}
              {/* Placeholder for device state text */}
            </div>
          </div>
          <div className="space-y-1">
            <div className="h-4 bg-gray-300 rounded-md w-1/2"></div>{" "}
            {/* Placeholder for battery */}
          </div>
          <div className="space-y-1">
            <div className="h-4 bg-gray-300 rounded-md w-1/2"></div>{" "}
            {/* Placeholder for storage */}
          </div>
        </div>
        <div
          className={clsx(PARENT_DIV_CLASSES, "bg-gray-300 rounded-lg")}
        ></div>{" "}
        {/* Placeholder for device snapshot */}
      </div>
    </Card>
  );
}
