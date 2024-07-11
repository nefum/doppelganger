export const authRequiredRoutesRegex: RegExp[] = [
  /*
   * All device paths, except
   * - /devices/:id/jsmpeg
   * - /devices/:id/kasmvnc
   * - /devices/:id/events
   * These are the WS endpoints; authentication will be done manually
   */
  /^\/devices(?!\/[^\/]+\/(jsmpeg|kasmvnc|events)).*$/,
];
export const MIN_FPS = 10;
export const MAX_DEVICES_FREE = 1;
export const MAX_DEVICES_PREMIUM = 3;
export const FREE_MAX_FPS = 30;
export const PREMIUM_MAX_FPS = 60;
