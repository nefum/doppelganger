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
