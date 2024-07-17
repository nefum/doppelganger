import { URL_BASE } from "@/app/constants.ts";
import { Toaster } from "@/components/ui/toaster.tsx";
import { TooltipProvider } from "@/components/ui/tooltip.tsx";
import { GoogleAnalytics } from "@next/third-parties/google";
import { clsx } from "clsx";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const fontHeading = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-heading",
});

const fontBody = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Doppelganger",
    default: "Doppelganger",
  },
  description: "Free cloud-based Android phones for everyone",
  metadataBase: new URL(URL_BASE),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={clsx(
          "antialiased",
          inter.className,
          fontHeading.variable,
          fontBody.variable,
        )}
      >
        <main>
          <TooltipProvider>{children}</TooltipProvider>
        </main>
        <Suspense>
          <Toaster />
        </Suspense>
        <GoogleAnalytics gaId="G-KN7ZDR3JD9" />
      </body>
    </html>
  );
}
