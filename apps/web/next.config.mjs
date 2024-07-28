// @ts-check
import withMdxFactory from "@next/mdx";
import { withSentryConfig } from "@sentry/nextjs";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkToc from "remark-toc";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // for sentry profiling
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Document-Policy",
            value: "js-profiling",
          },
        ],
      },
    ];
  },
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
  output: "standalone",
  experimental: {
    // do not disable it
    forceSwcTransforms: true,
    // ignore sentry utils from server action bundling
    serverComponentsExternalPackages: [
      // we load these in our server functions, if i ever split this won't be required
      "@sentry/node",
      "@sentry/utils",
    ],
    // coding assistance for routes
    typedRoutes: true,
  },
  // https://nextjs.org/docs/pages/api-reference/next-config-js/reactStrictMode
  reactStrictMode: true,
  // https://nextjs.org/docs/app/api-reference/next-config-js/webpack
  // https://webpack.js.org/loaders/node-loader/
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.module.rules = [
        {
          test: /\.node$/,
          loader: "node-loader",
        },
        ...config.module.rules,
      ];
    }
    config.module.rules = [
      {
        test: /\.svg$/,
        loader: "svg-inline-loader",
      },
      ...config.module.rules,
    ];
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
  },
};

const sentryConfig = withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  org: "nefum",
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

  env: {
    NODE_ENV: process.env.NODE_ENV,
  },
});

const mdxConfig = withMdxFactory({
  extension: /\.(md|mdx)$/,
  options: {
    remarkPlugins: [remarkGfm, remarkToc, remarkFrontmatter],
    rehypePlugins: [],
  },
})(sentryConfig);

export default mdxConfig;
