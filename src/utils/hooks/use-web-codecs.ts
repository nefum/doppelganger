import { useEffect, useState } from "react";
// @ts-expect-error -- incorrectly typed
import LibAV from "libav.js";
// @ts-expect-error -- incorrectly typed
import * as LibAVWebCodecs from "libavjs-webcodecs-polyfill";

// https://developer.mozilla.org/en-US/docs/Web/API/WebCodecs_API
const webCodecsApis = [
  "AudioDecoder",
  "VideoDecoder",
  "AudioEncoder",
  "VideoEncoder",
  "EncodedAudioChunk",
  "EncodedVideoChunk",
  "AudioData",
  "VideoFrame",
  "VideoColorSpace",
  "ImageDecoder",
  "ImageTrackList",
  "ImageTrack",
];

async function loadWebCodecsPolyfill(): Promise<boolean> {
  let isWebCodecsProvided = true;

  for (const api of webCodecsApis) {
    if (!(api in window)) {
      isWebCodecsProvided = false;
      break;
    }
  }

  if (isWebCodecsProvided) {
    return true;
  }

  console.warn("Browser does not fully support WebCodecs, loading polyfill...");

  try {
    const libAvWrapper = LibAV.LibAV();

    // Load and initialize the polyfill
    await LibAVWebCodecs.load({
      polyfill: true, // This will add the polyfill to the global object
      LibAV: libAvWrapper,
    });

    console.log("WebCodecs polyfill loaded successfully");

    return true;
  } catch (error) {
    console.error("Failed to load WebCodecs polyfill:", error);

    return false;

    // throw error; // Re-throw the error so it can be caught by the caller if needed
    // the show must go on, we can try to continue without the polyfill
  }
}

/**
 * Hook to check if the browser supports WebCodecs and load the polyfill if needed.
 * @returns Returns a tuple with two booleans: [ready, supportsWebCodecs].
 *          supportsWebCodecs will be true if the browser supports WebCodecs or the polyfill was loaded successfully.
 *          ready will be true when the polyfill has been loaded and the check is complete.
 */
export default function useWebCodecs(): [boolean, boolean | null] {
  const [ready, setReady] = useState(false);
  const [supportsWebCodecs, setSupportsWebCodecs] = useState<boolean | null>(
    null,
  );

  // Load the WebCodecs polyfill
  useEffect(() => {
    loadWebCodecsPolyfill().then((result) => {
      setReady(true);
      setSupportsWebCodecs(result);
    });
  });

  return [ready, supportsWebCodecs];
}
