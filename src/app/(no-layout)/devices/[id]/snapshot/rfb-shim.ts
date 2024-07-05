// https://github.com/regulad/react-kasmvnc/blob/8b0c13060936c3d0455363442523ded19a36f6f8/src/lib/VncScreen.tsx
import MouseButtonMapper, {
  XVNC_BUTTONS,
} from "@/noVNC/core/mousebuttonmapper";
import type RFB from "@/noVNC/core/rfb";
import { DeviceInfo } from "../../../../../../server/device-info/device-info";
import { getWsWebSocketOptionForKasmVNC } from "../../../../../../server/kasmvnc/wsconnect"; // refers to window on import

function createDefaultMouseButtonMapper(): MouseButtonMapper {
  const mouseButtonMapper = new MouseButtonMapper();

  mouseButtonMapper.set(0, XVNC_BUTTONS.LEFT_BUTTON);
  mouseButtonMapper.set(1, XVNC_BUTTONS.MIDDLE_BUTTON);
  mouseButtonMapper.set(2, XVNC_BUTTONS.RIGHT_BUTTON);
  mouseButtonMapper.set(3, XVNC_BUTTONS.BACK_BUTTON);
  mouseButtonMapper.set(4, XVNC_BUTTONS.FORWARD_BUTTON);

  return mouseButtonMapper;
}

// https://github.com/regulad/react-kasmvnc/blob/8b0c13060936c3d0455363442523ded19a36f6f8/src/lib/VncScreen.tsx
export default async function createRfb(
  screen: HTMLDivElement,
  keyboardInput: HTMLTextAreaElement,
  target: string,
  deviceInfo: DeviceInfo,
): Promise<RFB> {
  // have to import it here because it makes a call to window
  const RuntimeRFB = (await import("@/noVNC/core/rfb"))
    .default as unknown as typeof RFB;

  const parsedTargetUrl = new URL(deviceInfo.url);
  const webSocketOpts = getWsWebSocketOptionForKasmVNC(
    parsedTargetUrl,
    deviceInfo.insecure,
    deviceInfo.basicAuth,
  );

  const _rfb = new RuntimeRFB(
    screen,
    keyboardInput,
    target,
    {},
    true,
    webSocketOpts,
  );

  _rfb.viewOnly = false;
  _rfb.focusOnClick = false;
  _rfb.clipViewport = false;
  _rfb.dragViewport = false;
  _rfb.resizeSession = false;
  _rfb.scaleViewport = false;
  _rfb.showDotCursor = false;
  _rfb.background = "";
  _rfb.qualityLevel = 6;
  _rfb.compressionLevel = 2;

  _rfb.dynamicQualityMin = NaN;
  _rfb.dynamicQualityMax = NaN;
  _rfb.jpegVideoQuality = NaN;
  _rfb.webpVideoQuality = NaN;
  _rfb.videoArea = NaN;
  _rfb.videoTime = NaN;
  _rfb.videoOutTime = NaN;
  _rfb.videoScaling = NaN;
  _rfb.treatLossless = NaN;
  _rfb.maxVideoResolutionX = NaN;
  _rfb.maxVideoResolutionY = NaN;
  _rfb.frameRate = NaN;
  // @ts-ignore -- idleDisconnect is a property
  _rfb.idleDisconnect = false;
  _rfb.pointerRelative = false;
  _rfb.videoQuality = NaN;
  _rfb.antiAliasing = NaN;
  // @ts-ignore -- clipboardUp is a property
  _rfb.clipboardUp = true;
  // @ts-ignore -- clipboardDown is a property
  _rfb.clipboardDown = true;
  // @ts-ignore -- clipboardSeamless is a property
  _rfb.clipboardSeamless = true;
  _rfb.keyboard.enableIME = false;
  // @ts-ignore -- clipboardBinary is a property
  _rfb.clipboardBinary = false; // supportsBinaryClipboard();
  _rfb.enableWebRTC = false;
  _rfb.mouseButtonMapper = createDefaultMouseButtonMapper();
  _rfb.enableQOI = false;

  return _rfb;
}
