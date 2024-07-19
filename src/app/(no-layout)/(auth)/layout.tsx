import { LogoBigHero } from "@/components/logo.tsx";
import Link from "next/link";
import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[400px] w-full space-y-6">
        <Link href={"/"}>
          <LogoBigHero className={"flex justify-center"} />
        </Link>
        {children}
      </div>
    </div>
  );
}
