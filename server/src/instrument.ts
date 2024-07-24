import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

// Ensure to call this before importing any other modules!
Sentry.init({
  dsn: "https://710be47ec5a69191ec82397c11089305@o4506961510596608.ingest.us.sentry.io/4507657370337280",
  enabled: process.env.NODE_ENV === "production",

  integrations: [
    // Add our Profiling integration
    nodeProfilingIntegration(),
    Sentry.anrIntegration({ captureStackTrace: true }),
  ],

  // Add Tracing by setting tracesSampleRate
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,

  // Set sampling rate for profiling
  // This is relative to tracesSampleRate
  profilesSampleRate: 1.0,
});
