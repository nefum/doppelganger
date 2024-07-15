// @ts-check
import {withSentryConfig} from "@sentry/nextjs";
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  // https://nextjs.org/docs/messages/swc-disabled // we use the babel.config.json for our server
  experimental: {
    forceSwcTransforms: true,
  },
  // https://nextjs.org/docs/pages/api-reference/next-config-js/reactStrictMode
  reactStrictMode: true,
  // https://nextjs.org/docs/app/api-reference/next-config-js/webpack
  // https://webpack.js.org/loaders/node-loader/
  webpack: (config, {isServer}) => {
    if (isServer) {
      config.module.rules = [
        {
          test: /\.node$/,
          loader: "node-loader",
        },
        ...config.module.rules,
      ]
    }
    config.module.rules = [
      {
        test: /\.svg$/,
        loader: 'svg-inline-loader',
      },
      ...config.module.rules,
    ]
    return config;
  },
  // turbopack is too experimental; let's not use it
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true, // already checked by pre-commit, saves time in docker builds
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true, // already checked by pre-commit, saves time in docker builds
  }
};

export default withSentryConfig(nextConfig, {
// For all available options, see:
// https://github.com/getsentry/sentry-webpack-plugin#options

org: "regulad",
project: "doppelganger-front",

// Only print logs for uploading source maps in CI
silent: !process.env.CI,

// For all available options, see:
// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

// Upload a larger set of source maps for prettier stack traces (increases build time)
widenClientFileUpload: true,

// Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
// This can increase your server load as well as your hosting bill.
// Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
// side errors will fail.
tunnelRoute: "/monitoring",

// Hides source maps from generated client bundles
hideSourceMaps: true,

// Automatically tree-shake Sentry logger statements to reduce bundle size
disableLogger: true,

// Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
// See the following for more information:
// https://docs.sentry.io/product/crons/
// https://vercel.com/docs/cron-jobs
automaticVercelMonitors: true,
});
