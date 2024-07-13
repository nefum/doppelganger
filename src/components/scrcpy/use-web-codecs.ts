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

async function loadWebCodecsPolyfill(): Promise<void> {
  let isWebCodecsProvided = true;

  for (const api of webCodecsApis) {
    if (!(api in window)) {
      isWebCodecsProvided = false;
      break;
    }
  }

  if (isWebCodecsProvided) {
    return; // no need to polyfill
  }

  console.log("Browser does not fully support WebCodecs, loading polyfill...");

  const libAvWrapper = LibAV.LibAV();

  try {
    // Load and initialize the polyfill
    await LibAVWebCodecs.load({
      polyfill: true, // This will add the polyfill to the global object
      LibAV: libAvWrapper,
    });

    console.log("WebCodecs polyfill loaded successfully");
  } catch (error) {
    console.error("Failed to load WebCodecs polyfill:", error);
    // throw error; // Re-throw the error so it can be caught by the caller if needed
    // the show must go on, we can try to continue without the polyfill
  }
}

export default function useWebCodecs(): boolean {
  const [ready, setReady] = useState(false);

  // Load the WebCodecs polyfill
  useEffect(() => {
    loadWebCodecsPolyfill().then(() => {
      setReady(true);
    });
  });

  return ready;
}
