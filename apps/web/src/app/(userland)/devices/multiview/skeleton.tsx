import { Breadcrumbs } from "@/app/(userland)/devices/multiview/breadcrumbs.tsx";
import {
  DEFAULT_COLUMNS,
  DEFAULT_ROWS,
  MAX_SIZE,
} from "@/app/(userland)/devices/multiview/constants.ts";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Fragment } from "react";

export function MultiviewSkeleton() {
  // Default to 2 columns and 1 row for the skeleton
  const columns = DEFAULT_COLUMNS;
  const rows = DEFAULT_ROWS;

  const defaultColumnSize = 100 / columns;
  const defaultRowSize = 100 / rows;

  return (
    <div className="container mx-auto p-4">
      <Breadcrumbs />

      <div className="flex justify-between mb-4 space-x-4">
        <div>
          <Skeleton className="h-10 w-40" /> {/* Placeholder for title */}
        </div>
        <Skeleton className="h-10 w-32" />{" "}
        {/* Placeholder for Resize Grid button */}
      </div>

      <ResizablePanelGroup
        direction="vertical"
        className="min-h-[90vh] rounded-lg border"
      >
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <Fragment key={rowIndex}>
            <ResizablePanel
              defaultSize={defaultRowSize}
              minSize={100 / (MAX_SIZE + 1)}
            >
              <ResizablePanelGroup direction="horizontal">
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <Fragment key={colIndex}>
                    <ResizablePanel
                      defaultSize={defaultColumnSize}
                      minSize={100 / (MAX_SIZE + 1)}
                    >
                      <div className="h-full p-4 bg-gray-100">
                        <Skeleton className="h-8 w-full mb-4" />{" "}
                        {/* Placeholder for device name */}
                        <Skeleton className="h-40 w-full mb-4" />{" "}
                        {/* Placeholder for main content */}
                        <div className="flex justify-center space-x-2">
                          <Skeleton className="h-10 w-24" />{" "}
                          {/* Placeholder for button */}
                          <Skeleton className="h-10 w-24" />{" "}
                          {/* Placeholder for button */}
                        </div>
                      </div>
                    </ResizablePanel>
                    {colIndex < columns - 1 && <ResizableHandle withHandle />}
                  </Fragment>
                ))}
              </ResizablePanelGroup>
            </ResizablePanel>
            {rowIndex < rows - 1 && <ResizableHandle withHandle />}
          </Fragment>
        ))}
      </ResizablePanelGroup>
    </div>
  );
}
