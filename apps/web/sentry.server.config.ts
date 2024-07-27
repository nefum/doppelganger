// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

Sentry.init({
  dsn: "https://c16d073a0fdaea2761e0f3f26ad856e7@o4506961510596608.ingest.us.sentry.io/4507558058721280",
  enabled: process.env.NODE_ENV === "production",

  integrations: [
    // Add our Profiling integration
    nodeProfilingIntegration(),
    Sentry.anrIntegration({ captureStackTrace: true }),
  ],

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1,

  // Set sampling rate for profiling
  // This is relative to tracesSampleRate
  profilesSampleRate: 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: process.env.NODE_ENV === 'development',
});
