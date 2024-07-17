/**
 * This code was generated by v0 by Vercel.
 * @see https://v0.dev/t/i59yRolZFM7
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */

/** Add fonts into your Next.js project:

 import { Inter } from 'next/font/google'

 inter({
 subsets: ['latin'],
 display: 'swap',
 })

 To read more about using these font, please visit the Next.js documentation:
 - App Directory: https://nextjs.org/docs/app/building-your-application/optimizing/fonts
 - Pages Directory: https://nextjs.org/docs/pages/building-your-application/optimizing/fonts
 **/
import { NewDeviceButtonServer } from "@/app/(userland)/devices/(root)/device-pages/new-device-button/new-device-button-server.tsx";
import { NewDeviceButtonStatic } from "@/app/(userland)/devices/(root)/device-pages/new-device-button/new-device-button-static.tsx";
import { ReactNode, Suspense } from "react";

export function DeviceCardPage({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8 lg:justify-start">
        <h2 className="text-2xl font-semibold">My Devices</h2>
        <Suspense
          fallback={<NewDeviceButtonStatic className="animate-pulse" />}
        >
          <NewDeviceButtonServer />
        </Suspense>
      </div>
      <div className="flex flex-wrap justify-between -m-3">{children}</div>
    </div>
  );
}
