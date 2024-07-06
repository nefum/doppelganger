"use client";

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
import { ReactNode, useEffect, useRef, useState } from "react";
import { Device } from "@prisma/client";

export interface ClientProps
  extends Partial<KasmVNCScreenProps | KasmVNCExtraRFBOptions> {
  thisPathname: string;
  deviceInfo: Device;
  failComponent: ReactNode;
  loadingComponent: ReactNode;
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
export default function NextVNCScreen({
  failComponent,
  loadingComponent,
  ...clientProps
}: Readonly<ClientProps>) {
  const ref = useRef<KasmVNCScreenHandle>(null);
  const [isFailed, setIsFailed] = useState<boolean>(false);
  const [failureReason, setFailureReason] = useState<string>("");
  const [vncUrl, setVncUrl] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    // the url will be the same url but kasmvnc instead of ios
    // ie. /devices/[id]/ios -> /devices/[id]/kasmvnc
    const vncUrl = new URL(window.location.href);
    vncUrl.pathname = vncUrl.pathname.replace(
      clientProps.thisPathname,
      `/devices/${clientProps.deviceInfo.id}/kasmvnc`,
    );
    vncUrl.protocol = vncUrl.protocol.replace("http", "ws");
    setVncUrl(vncUrl.toString());

    // audio is a different endpoint
    const audioUrl = new URL(window.location.href);
    audioUrl.pathname = audioUrl.pathname.replace(
      clientProps.thisPathname,
      `/devices/${clientProps.deviceInfo.id}/jsmpeg`,
    );
    audioUrl.protocol = audioUrl.protocol.replace("http", "ws");
    setAudioUrl(audioUrl.toString());
  }, [clientProps.deviceInfo.id, clientProps.thisPathname]);

  function fail(reason: string) {
    setIsFailed(true);
    setFailureReason(reason);
  }

  if (isFailed) {
    return failComponent;
  }

  function Screen() {
    if (!vncUrl || !audioUrl) {
      return null;
    }

    const style = {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
    };

    // if i ever need to adjust the volume of the audio stream, run this command on the docker container running the vnc
    // sudo docker exec d31179134ece pactl set-sink-volume @DEFAULT_SINK@ 200
    return (
      <KasmVNCScreen
        ref={ref}
        url={vncUrl}
        audioUrl={audioUrl}
        scaleViewport
        clipViewport
        dragViewport={false}
        {...clientProps}
        kasmOptions={{
          clipboardSeamless: true,
          enableWebRTC: true, // doesn't hurt; just allow it (will probably fail)
          ...clientProps,
        }}
        loadingUI={loadingComponent}
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

  // note: strict mode can break this by making it load twice; ignore the logs in this case
  return (vncUrl && <Screen />) || loadingComponent;
}
