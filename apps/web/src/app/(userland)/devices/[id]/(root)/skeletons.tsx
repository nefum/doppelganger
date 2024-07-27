import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardHeader } from "@/components/ui/card.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Power, PowerOff } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";

export function DeviceBreadcrumbSkeleton({
  deviceId,
}: Readonly<{ deviceId: string }>): ReactNode {
  return (
    <Breadcrumb className="mb-6">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/devices">My Devices</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href={`/devices/${deviceId}`}>
              <Skeleton className="h-4 w-32" />
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export function DeviceChecklistItemSkeleton() {
  return (
    <div className="flex items-center space-x-2">
      <Skeleton className="h-4 w-4" />
      <Skeleton className="h-4 w-32" />
    </div>
  );
}

export function DeviceChecklistSkeleton() {
  return (
    <Card className="mb-6">
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <DeviceChecklistItemSkeleton key={item} />
          ))}
          <Skeleton className="h-10 w-64 ml-6" />
        </div>
      </CardContent>
    </Card>
  );
}

export function StatItemSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-2 w-full" />
      <Skeleton className="h-4 w-16 ml-auto" />
    </div>
  );
}

export function DeviceStatsSkeleton() {
  return (
    <Card className="mb-6">
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent className="space-y-4">
        {[1, 2, 3].map((item) => (
          <StatItemSkeleton key={item} />
        ))}
      </CardContent>
    </Card>
  );
}

export function DeviceAlertsSkeleton() {
  return (
    <>
      <Skeleton className="h-24 mb-6" />
      <Skeleton className="h-24" />
    </>
  );
}

export function DeviceScreenshotSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-40" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[600px] w-full" />
        <div className="mt-4 space-x-4">
          <Skeleton className="h-10 w-32 inline-block" />
          <Skeleton className="h-10 w-32 inline-block" />
        </div>
      </CardContent>
    </Card>
  );
}

export function DevicePowerStateButtonsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="animate-pulse">
        <Button className="w-full" disabled>
          <Power className="mr-2 h-4 w-4" />
          Start Device
        </Button>
      </div>
      <div className="animate-pulse">
        <Button variant="destructive" className="w-full" disabled>
          <PowerOff className="mr-2 h-4 w-4" />
          Stop Device
        </Button>
      </div>
    </div>
  );
}

export function DeviceConnectButtonSkeleton() {
  return (
    <div className="animate-pulse mb-6">
      <Button className="w-full" disabled>
        Connect to Device
      </Button>
    </div>
  );
}
