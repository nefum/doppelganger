declare module "jsmpeg" {
  import { RangeType } from "@/utils/types/range-type.ts";

  interface JSMpegOptions {
    canvas?: HTMLCanvasElement;
    loop?: boolean;
    autoplay?: boolean;
    audio?: boolean;
    video?: boolean;
    poster?: string;
    pauseWhenHidden?: boolean;
    disableGl?: boolean;
    disableWebAssembly?: boolean;
    preserveDrawingBuffer?: boolean;
    progressive?: boolean;
    throttled?: boolean;
    chunkSize?: number;
    decodeFirstFrame?: boolean;
    maxAudioLag?: number;
    videoBufferSize?: number;
    audioBufferSize?: number;
    onVideoDecode?: (decoder: any, time: number) => void;
    onAudioDecode?: (decoder: any, time: number) => void;
    onPlay?: (player: Player) => void;
    onPause?: (player: Player) => void;
    onEnded?: (player: Player) => void;
    onStalled?: (player: Player) => void;
    onSourceEstablished?: (source: string) => void;
    onSourceEnded?: (source: string) => void;
  }

  // https://github.com/phoboslab/jsmpeg?tab=readme-ov-file#jsmpegplayer-api
  export class Player {
    constructor(url: string, options: JSMpegOptions);
    play(): void;
    pause(): void;
    stop(): void;
    nextFrame(): void;
    get volume(): RangeType<0, 1>;
    set volume(level: RangeType<0, 1>);
    get currentTime(): number;
    set currentTime(time: number);
    paused: number;
    destroy(): void;
  }
}
