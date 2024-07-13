declare module "@cycjimmy/jsmpeg-player" {
  import { Player as JSMpegPlayer } from "jsmpeg";

  export class VideoElement {
    constructor(videoWrapper: never, url: string, options: any);
    play(): void;
    pause(): void;
    stop(): void;
    destroy(): void;

    static readonly player: typeof JSMpegPlayer;
  }

  export const Player = JSMpegPlayer;
}
