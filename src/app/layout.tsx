import { BASE_ORIGIN } from "@/app/constants.ts";
import GoogleOneTap from "@/components/google/google-one-tap.tsx";
import GoogleSigninHandlerProvider from "@/components/google/google-signin-handler-provider.tsx";
import { NonceProvider } from "@/components/google/nonce-provider.tsx";
import ProviderComposer from "@/components/providers.tsx";
import { ThemeProvider } from "@/components/theme-provider.tsx";
import { Toaster } from "@/components/ui/toaster.tsx";
import { TooltipProvider } from "@/components/ui/tooltip.tsx";
import { GoogleAnalytics } from "@next/third-parties/google";
import { clsx } from "clsx";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
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
  metadataBase: new URL(BASE_ORIGIN),
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
        <ProviderComposer
          providers={[
            [TooltipProvider],
            [NonceProvider],
            [
              ThemeProvider,
              {
                attribute: "class",
                defaultTheme: "system",
                enableSystem: true,
                disableTransitionOnChange: true,
              },
            ],
            [GoogleSigninHandlerProvider],
          ]}
        >
          <main>{children}</main>
          <Suspense>
            <GoogleOneTap />
          </Suspense>
          <Suspense>
            <Toaster />
          </Suspense>
        </ProviderComposer>
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="lazyOnload"
          async
        />
        <GoogleAnalytics gaId="G-KN7ZDR3JD9" />
      </body>
    </html>
  );
}
