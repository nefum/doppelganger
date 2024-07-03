import dynamic from "next/dynamic";
import ISpinner from "@/app/components/ispinner";
import "./ios-client.css";

const IosClient = dynamic(() => import("./ios-client"), {
  ssr: false,
  loading: () => <ISpinner large />,
})

export default function Page() {
  return (
    <div className="flex justify-center items-center place-items-center h-screen w-screen">
      <IosClient />
    </div>
  )
}
