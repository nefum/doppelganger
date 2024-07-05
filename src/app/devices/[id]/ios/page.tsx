import dynamic from "next/dynamic";
import ISpinner from "@/app/components/ispinner";
// import "./ios-client.css";
// there is never a reason to manually hide the cursor because the cursor will not show in the WKWebView;
// the cursor we view is from

const IosClient = dynamic(() => import("./ios-client"), {
  ssr: false,
  loading: () => <ISpinner large />,
});

export default function Page() {
  return (
    <div className="flex justify-center items-center place-items-center h-screen w-screen">
      <IosClient />
    </div>
  );
}
