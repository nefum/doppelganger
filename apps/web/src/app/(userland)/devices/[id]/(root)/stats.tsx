"use server";

// DeviceStats Components
import { getDeviceForId } from "%/device-info/device-info.ts";
import { StatItemSkeleton } from "@/app/(userland)/devices/[id]/(root)/skeletons.tsx";
import NotFound from "@/app/not-found.tsx";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Progress } from "@/components/ui/progress.tsx";
import {
  getCpuUsage,
  getMemoryUsedBytes,
  getStorageUsedBytes,
} from "@/utils/redroid/stats.ts";
import { createClient } from "@/utils/supabase/server.ts";
import { Device } from "@prisma/client";
import { Cpu, HardDrive, MemoryStick } from "lucide-react";
import { ElementType, Suspense } from "react";

function StatItem({
  icon: Icon,
  label,
  value,
  max,
  unit,
}: Readonly<{
  icon: ElementType;
  label: string;
  value: number;
  max: number;
  unit: string;
}>) {
  return (
    <div className="space-y-2">
      <div className="flex items-center">
        <Icon className="mr-2 h-4 w-4" />
        <span>{label}</span>
      </div>
      <Progress value={(value / max) * 100} className="w-full" />
      <div className="text-sm text-right">
        {value}
        {unit} / {max}
        {unit}
      </div>
    </div>
  );
}

async function StorageStats({ device }: Readonly<{ device: Device }>) {
  const [usedBytes, maxBytes] = await getStorageUsedBytes(device);
  const usedGb = Math.round(usedBytes / 1024 / 1024 / 1024);
  const maxGb = Math.round(maxBytes / 1024 / 1024 / 1024);
  return (
    <StatItem
      icon={HardDrive}
      label="Storage"
      value={usedGb}
      max={maxGb}
      unit="GB"
    />
  );
}

async function MemoryStats({ device }: Readonly<{ device: Device }>) {
  const [usedBytes, maxBytes] = await getMemoryUsedBytes(device);
  const usedGb = Math.round(usedBytes / 1024 / 1024 / 1024);
  const maxGb = Math.round(maxBytes / 1024 / 1024 / 1024);
  return (
    <StatItem
      icon={MemoryStick}
      label="RAM"
      value={usedGb}
      max={maxGb}
      unit="GB"
    />
  );
}

async function CPUStats({ device }: Readonly<{ device: Device }>) {
  const [usedCpus, maxCpus] = await getCpuUsage(device);
  const usedCpuPercentage = Math.round((usedCpus / maxCpus) * 100);
  // we don't give the users the number of CPUs
  return (
    <StatItem
      icon={Cpu}
      label="CPU Usage"
      value={usedCpuPercentage}
      max={100}
      unit="%"
    />
  );
}

export async function DeviceStats({
  deviceId,
}: Readonly<{ deviceId: string }>) {
  // the layout never helped us
  const device = await getDeviceForId(deviceId);
  if (!device) {
    return <NotFound />;
  }
  const supabaseClient = createClient();
  const {
    data: { user },
  } = await supabaseClient.auth.getUser();
  if (!user || device.ownerId !== user.id) {
    return <NotFound />;
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Device Stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Suspense fallback={<StatItemSkeleton />}>
          <StorageStats device={device} />
        </Suspense>
        <Suspense fallback={<StatItemSkeleton />}>
          <MemoryStats device={device} />
        </Suspense>
        <Suspense fallback={<StatItemSkeleton />}>
          <CPUStats device={device} />
        </Suspense>
      </CardContent>
    </Card>
  );
}
