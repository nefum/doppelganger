import { DeviceCardPage } from "@/components/device-cards/device-card-page";
import { getDeviceInfoForId } from "../../../../server/device-info/device-info";
import { DeviceCard } from "@/components/device-cards/device-card";

export default function Page() {
  const clientDevices = [getDeviceInfoForId("staging")!]; // todo

  return (
    <DeviceCardPage>
      {clientDevices.map((deviceInfo) => (
        <DeviceCard key={deviceInfo.id} deviceInfo={deviceInfo} />
      ))}
    </DeviceCardPage>
  );
}
