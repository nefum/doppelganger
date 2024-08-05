export const TAGLINE = "Android, on any device.";
export const BASE_ORIGIN =
  process.env.NODE_ENV === "production"
    ? "https://doppelgangerhq.com"
    : `http://localhost:${process.env.PORT || 3000}`;

export const AUTH_REQUIRED_ROUTES_REGEX: RegExp[] = [
  /*
   * All device paths, except
   * - /devices/:id/jsmpeg
   * - /devices/:id/kasmvnc
   * - /devices/:id/scrcpy
   * - /devices/:id/events
   * These are the WS endpoints; authentication will be done manually
   */
  // no API endpoints!! we check those manually
  /^\/devices(?!\/[^\/]+\/(jsmpeg|scrcpy|kasmvnc|events)).*$/,
  // user management page
  /^\/user.*$/,
];
export const AUTHORIZED_USERS_FORBIDDEN_REGEX: RegExp[] = [
  /^\/login$/,
  /^\/signup$/,
  /^\/forgot-password$/,
];

export const MIN_FPS = 10;

export const MAX_DEVICES_FREE = 1;
export const MAX_DEVICES_PLUS = MAX_DEVICES_FREE;
export const MAX_DEVICES_PRO = 6;

export const FREE_MAX_FPS = 15; // 15 is pretty crap but suprisingly usable, incentive to push to premium
export const PLUS_MAX_FPS = 30; // 30 is pretty good, but not quite as good as pro
export const PRO_MAX_FPS = 60; // 60 will absolutely desimate the server, but without it there is not much incentive to upgrade

export const DEVICE_ACTIVE_TIMEOUT = 1_000 * 60 * 5; // 5 minutes

// from template/docker-compose.1.9.yml
export const VOLUME_SIZE_LIMIT_BYTES = 17_179_869_184; // 16 GiB
export const CPU_LIMIT_CPUS = 2.0;
export const MEMORY_LIMIT_BYTES = 2_147_483_648; // 2 GiB

export const PLUS_STRIPE_PRODUCT =
  process.env.NODE_ENV === "production"
    ? "price_1PjrjNJ5A6f1xaSscXx0SEBm"
    : "price_1PjrmsJ5A6f1xaSssdFx6I3Y";
export const PRO_STRIPE_PRODUCT =
  process.env.NODE_ENV === "production"
    ? "price_1PjrkeJ5A6f1xaSsYm8BjZDo"
    : "price_1PjrneJ5A6f1xaSsxL86tS6i";
