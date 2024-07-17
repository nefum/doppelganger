import { URL_BASE } from "@/app/constants.ts";
import { ThemeProvider } from "@/components/theme-provider.tsx";
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
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // https://ui.shadcn.com/docs/dark-mode/next
    <html lang="en" suppressHydrationWarning>
      <body
        className={clsx(
          "antialiased",
          inter.className,
          fontHeading.variable,
          fontBody.variable,
        )}
      >
        <link
          rel="apple-touch-icon"
          href="/apple-icon?<generated>"
          type="image/<generated>"
          sizes="<generated>"
        />
        <link
          rel="icon"
          href="/icon?<generated>"
          type="image/<generated>"
          sizes="<generated>"
        />
        <TooltipProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <main>{children}</main>
            <Suspense>
              <Toaster />
            </Suspense>
            <GoogleAnalytics gaId="G-KN7ZDR3JD9" />
          </ThemeProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
