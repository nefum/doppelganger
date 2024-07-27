import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";

export default function NoDevicesCard() {
  // place a card exactly in the center of the screen, ignoring the style of parent elements
  return (
    <Card defaultValue="absolute">
      <CardHeader>
        <CardTitle>No Devices</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="shadcn-p">
          You don&apos;t have any devices yet. Click the button above to create
          a new device.
        </p>
      </CardContent>
    </Card>
  );
}
