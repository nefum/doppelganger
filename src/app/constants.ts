export const URL_BASE = "https://www.doppelgangerhq.com";

export const AUTH_REQUIRED_ROUTES_REGEX: RegExp[] = [
  /*
   * All device paths, except
   * - /devices/:id/jsmpeg
   * - /devices/:id/kasmvnc
   * - /devices/:id/scrcpy
   * - /devices/:id/events
   * These are the WS endpoints; authentication will be done manually
   */
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
export const MAX_DEVICES_PREMIUM = 3;

export const FREE_MAX_FPS = 15;
export const PREMIUM_MAX_FPS = 60;
