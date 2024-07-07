/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  // https://nextjs.org/docs/messages/swc-disabled // we use the babel.config.json for our server
  experimental: {
    forceSwcTransforms: true,
  },
  // https://nextjs.org/docs/pages/api-reference/next-config-js/reactStrictMode
  reactStrictMode: false,
};

export default nextConfig;
