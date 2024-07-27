export default function MobileFail({ reason }: Readonly<{ reason: string }>) {
  return (
    <div>
      <h1>Failed to connect</h1>
      <p>{reason}</p>
    </div>
  );
}
