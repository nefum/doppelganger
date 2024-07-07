import { ReactNode } from "react";
import Image from "next/image";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[400px] w-full space-y-6">
        <div className="flex justify-center">
          <Image
            src="/logo.svg"
            alt="Doppelganger Logo"
            width={100}
            height={100}
            className="h-12 w-auto"
          />
        </div>
        {children}
      </div>
    </main>
  );
}
