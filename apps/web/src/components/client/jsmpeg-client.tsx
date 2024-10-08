import { Button } from "@/components/ui/button.tsx";
import { useToast } from "@/components/ui/use-toast.ts";
import useInteractedWithAtLeastOnce from "@/utils/hooks/use-interacted-with-at-least-once.ts";
import JSMpeg from "@cycjimmy/jsmpeg-player";
import type { Player } from "jsmpeg";
import { ReactNode, RefObject, useEffect, useRef } from "react";

const JSMpegVideoElement = JSMpeg.VideoElement;
const JSMpegPlayer = JSMpeg.Player || JSMpegVideoElement.player;

/**
 * A JSMpeg client that plays audio only. Useful for connecting to KasmVNC-based clients that expose audio over a WS compatible with JSMpeg.
 * @param containerRef A ref to the container housing the JSMpeg client, used to ensure that the page has been interacted with before playing audio
 * @param jsmpegWsUrlString The source URL for the JSMpeg audio stream
 * @constructor
 */
export default function JSMpegClient({
  containerRef,
  jsmpegWsUrlString,
}: Readonly<{
  containerRef: RefObject<HTMLElement>;
  jsmpegWsUrlString: string;
}>): ReactNode {
  const audioCanvasRef = useRef<HTMLCanvasElement>(null);
  const jsmpegPlayerRef = useRef<Player | null>();

  const { toast } = useToast();

  const interacted = useInteractedWithAtLeastOnce(containerRef);

  useEffect(() => {
    if (jsmpegPlayerRef.current || !audioCanvasRef.current) {
      return;
    }

    if (!interacted || !jsmpegWsUrlString) {
      return;
    }

    console.log("starting audio player");

    // we have the jsmpeg url and the user has interacted, we can attach the player
    const player = new JSMpegPlayer(jsmpegWsUrlString, {
      canvas: audioCanvasRef.current,
      audio: true,
      video: false,
      onEnded: () => {
        toast({
          title: "Audio Disconnected",
          description: (
            <Button onClick={() => window.location.reload()}>Reconnect</Button>
          ),
        });
      },
      onStalled: (player: Player) => {
        toast({
          title: "Audio Stalled; is your connection ok?",
          description: (
            <Button onClick={() => window.location.reload()}>Reconnect</Button>
          ),
        });
      },
    });

    jsmpegPlayerRef.current = player;

    return () => {
      player.destroy();
      jsmpegPlayerRef.current = null;
    };
  }, [interacted, jsmpegWsUrlString, toast]);

  return <canvas ref={audioCanvasRef} className="h-0 w-0" />;
}
