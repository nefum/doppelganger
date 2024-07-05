"use client";

import IosFail from "@/app/components/ios-fail";
import ISpinner from "@/app/components/ispinner";

import {
  VncScreen as KasmVNCScreen,
  VncScreenHandle as KasmVNCScreenHandle,
} from "react-kasmvnc";
import type {
  KasmVNCRFBOptions as KasmVNCExtraRFBOptions,
  Props as KasmVNCScreenProps,
  // @ts-expect-error -- the types are exported wrong
} from "react-kasmvnc/dist/types/lib/VncScreen";
// @ts-expect-error -- the types are exported wrong
import type { RFB as KasmVNCRFB } from "react-kasmvnc/dist/types/noVNC/core/rfb";
import { useEffect, useRef, useState } from "react";

// https://github.com/regulad/novnc-nofrills/blob/1d7b38a1f5d0d5ee665b4eca3f8921d4040f7709/src/App.tsx
export default function IosClient() {
  const ref = useRef<KasmVNCScreenHandle>(null);
  const [isFailed, setIsFailed] = useState<boolean>(false);
  const [failureReason, setFailureReason] = useState<string>("");
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    // the url will be the same url but kasmvnc instead of ios
    // ie. /devices/[id]/ios -> /devices/[id]/kasmvnc
    const url = new URL(window.location.href);
    url.pathname = url.pathname.replace(/\/ios$/, "/kasmvnc");
    url.protocol = url.protocol.replace("http", "ws");
    setUrl(url.toString());
  }, []);

  // other configs
  const viewOnly = undefined;
  const focusOnClick = undefined;
  const retryDuration = undefined;
  const resizeSession = undefined;
  const showDotCursor = undefined;
  const background = undefined;
  const qualityLevel = undefined;
  const compressionLevel = undefined;
  const extraProps: Partial<KasmVNCScreenProps> = {
    viewOnly: viewOnly === "true",
    focusOnClick: focusOnClick === "true",
    retryDuration: retryDuration ? parseInt(retryDuration) : undefined,
    resizeSession: resizeSession === "true",
    showDotCursor: showDotCursor === "true",
    background: background,
    qualityLevel: qualityLevel ? parseInt(qualityLevel) : undefined,
    compressionLevel: compressionLevel ? parseInt(compressionLevel) : undefined,
  };

  // kasm configs
  const dynamicQualityMin = undefined;
  const dynamicQualityMax = undefined;
  const jpegVideoQuality = undefined;
  const webpVideoQuality = undefined;
  const maxVideoResolutionX = undefined;
  const maxVideoResolutionY = undefined;
  const frameRate = undefined;
  const idleDisconnect = undefined;
  const pointerRelative = undefined;
  const videoQuality = undefined;
  const antiAliasing = undefined;

  const kasmExtraProps: Partial<KasmVNCExtraRFBOptions> = {
    dynamicQualityMin: dynamicQualityMin
      ? parseInt(dynamicQualityMin)
      : undefined,
    dynamicQualityMax: dynamicQualityMax
      ? parseInt(dynamicQualityMax)
      : undefined,
    jpegVideoQuality: jpegVideoQuality ? parseInt(jpegVideoQuality) : undefined,
    webpVideoQuality: webpVideoQuality ? parseInt(webpVideoQuality) : undefined,
    maxVideoResolutionX: maxVideoResolutionX
      ? parseInt(maxVideoResolutionX)
      : undefined,
    maxVideoResolutionY: maxVideoResolutionY
      ? parseInt(maxVideoResolutionY)
      : undefined,
    frameRate: frameRate ? parseInt(frameRate) : undefined,
    idleDisconnect: idleDisconnect === "true",
    pointerRelative: pointerRelative === "true",
    videoQuality: videoQuality ? parseInt(videoQuality) : undefined,
    antiAliasing: antiAliasing ? parseInt(antiAliasing) : undefined,
  };

  function fail(reason: string) {
    setIsFailed(true);
    setFailureReason(reason);
  }

  if (isFailed) {
    return <IosFail reason={failureReason} />;
  }

  function Screen() {
    return (
      <KasmVNCScreen
        ref={ref}
        url={url}
        scaleViewport
        clipViewport
        dragViewport={false}
        {...extraProps}
        kasmOptions={{
          clipboardSeamless: true,
          enableWebRTC: true, // doesn't hurt; just allow it (will probably fail)
          ...kasmExtraProps,
        }}
        loadingUI={<ISpinner large />}
        background="rgba(0, 0, 0, 0)"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
        }}
        // this completely breaks the connection; i have no idea why
        // onDisconnect={(rfb?: RFB) => {
        //   console.log("Disconnected", rfb);
        //   fail('Disconnected (cannot reconnect)');
        // }}
        onSecurityFailure={(rfb?: KasmVNCRFB) => {
          console.log("Security failure", rfb);
          const reason: string | null = rfb?.detail?.reason;
          const status: number | null = rfb?.detail?.status;
          fail(`Security failure (status: ${status}, reason: ${reason})`);
        }}
        onDesktopName={(rfb?: KasmVNCRFB) => {
          const name: string | null = rfb?.detail?.name;
          console.log("Desktop name changed", rfb);
          // change the tab name
          if (name) {
            document.title = name;
          }
        }}
      />
    );
  }

  return (url && <Screen />) || <ISpinner large />;
}
