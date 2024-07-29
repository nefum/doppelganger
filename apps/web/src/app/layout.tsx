import { BASE_ORIGIN, TAGLINE } from "%/constants.ts";
import GoogleOneTap from "@/components/google/google-one-tap.tsx";
import GoogleSigninHandlerProvider from "@/components/google/google-signin-handler-provider.tsx";
import { NonceProvider } from "@/components/google/nonce-provider.tsx";
import OneSignalProvider from "@/components/onesignal/one-signal-provider.tsx";
import ProviderComposer from "@/components/providers.tsx";
import { ThemeProvider } from "@/components/theme-provider.tsx";
import { Toaster } from "@/components/ui/toaster.tsx";
import { TooltipProvider } from "@/components/ui/tooltip.tsx";
import { GoogleAnalytics } from "@next/third-parties/google";
import { clsx } from "clsx";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import { ProgressBarProvider } from "react-transition-progress";
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
  description: TAGLINE,
  metadataBase: new URL(BASE_ORIGIN),
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    url: BASE_ORIGIN,
    title: "Doppelganger",
    description: TAGLINE,
    siteName: "Doppelganger",
    images: [
      {
        url: new URL("/mockup.png", BASE_ORIGIN).toString(),
      },
    ],
  },
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
            [OneSignalProvider],
            [ProgressBarProvider],
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
        {/*no need for a cookie consent manager yet, we only do business in the us*/}
        <GoogleAnalytics gaId="G-KN7ZDR3JD9" />
      </body>
    </html>
  );
}
