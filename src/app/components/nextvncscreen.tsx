"use client";

import IosFail from "@/app/(no-layout)/devices/[id]/ios/ios-fail.tsx";
import ISpinner from "@/app/(no-layout)/devices/[id]/ios/ispinner.tsx";

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
import { DeviceInfo } from "../../../server/device-info/device-info.ts";

export interface ClientProps
  extends Partial<KasmVNCScreenProps | KasmVNCExtraRFBOptions> {
  thisPathname: string;
  deviceInfo: DeviceInfo;
  fullScreen?: boolean;
  viewOnly?: boolean;
  focusOnClick?: boolean;
  retryDuration?: number;
  resizeSession?: boolean;
  showDotCursor?: boolean;
  background?: string;
  qualityLevel?: number;
  compressionLevel?: number;
  dynamicQualityMin?: number;
  dynamicQualityMax?: number;
  jpegVideoQuality?: number;
  webpVideoQuality?: number;
  maxVideoResolutionX?: number;
  maxVideoResolutionY?: number;
  frameRate?: number;
  idleDisconnect?: boolean;
  pointerRelative?: boolean;
  videoQuality?: number;
  antiAliasing?: number;
}

// https://github.com/regulad/novnc-nofrills/blob/1d7b38a1f5d0d5ee665b4eca3f8921d4040f7709/src/App.tsx
export default function NextVNCScreen(clientProps: Readonly<ClientProps>) {
  const ref = useRef<KasmVNCScreenHandle>(null);
  const [isFailed, setIsFailed] = useState<boolean>(false);
  const [failureReason, setFailureReason] = useState<string>("");
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    // the url will be the same url but kasmvnc instead of ios
    // ie. /devices/[id]/ios -> /devices/[id]/kasmvnc
    const url = new URL(window.location.href);
    url.pathname = url.pathname.replace(
      clientProps.thisPathname,
      `/devices/${clientProps.deviceInfo.id}/kasmvnc`,
    );
    url.protocol = url.protocol.replace("http", "ws");
    setUrl(url.toString());
  }, [clientProps.deviceInfo.id, clientProps.thisPathname]);

  function fail(reason: string) {
    setIsFailed(true);
    setFailureReason(reason);
  }

  if (isFailed) {
    return <IosFail reason={failureReason} />;
  }

  function Screen() {
    if (!url) {
      return null;
    }

    const style = {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
    };

    return (
      <KasmVNCScreen
        ref={ref}
        url={url}
        scaleViewport
        clipViewport
        dragViewport={false}
        {...clientProps}
        kasmOptions={{
          clipboardSeamless: true,
          enableWebRTC: true, // doesn't hurt; just allow it (will probably fail)
          ...clientProps,
        }}
        loadingUI={<ISpinner large />}
        background="rgba(0, 0, 0, 0)"
        style={clientProps.fullScreen ? style : {}}
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
