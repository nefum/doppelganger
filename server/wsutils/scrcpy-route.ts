import { IncomingMessage } from "node:http";
import { WebSocket as WsWebSocket } from "ws";
import {
  getTargetWsScrcpyUrlForDevice,
  runScrcpyServerOnDevice,
} from "../adb/scrcpy";
import { getDeviceForId } from "../device-info/device-info";
import { bringUpDevice, getIsDeviceRunning } from "../docker/device-state";
import { scrcpyWsEndpoint } from "../endpoint-regex";
import { createClient } from "../supabase/ro-server";
import { attachUpdateListener } from "./attach-update-listener";
import { createWebSocketProxy } from "./wsproxy";

export async function handleDeviceStream(
  req: IncomingMessage,
  ws: WsWebSocket,
): Promise<void> {
  const pathname = req.url!;
  const deviceId = pathname.match(scrcpyWsEndpoint)![1];

  console.debug("ws connection received", req.url, deviceId);

  // check to see if this is a websocket connection

  const deviceInfo = await getDeviceForId(deviceId);

  const supabaseClient = createClient(req);
  const {
    data: { user },
  } = await supabaseClient.auth.getUser();

  // https://github.com/Luka967/websocket-close-codes#websocket-close-codes
  if (!user) {
    ws.close(3000);
    return;
  }

  if (!deviceInfo || deviceInfo.ownerId !== user.id) {
    ws.close(4404); // app: equiv to http 404
    return;
  }

  // now create a WebSocket proxy to the audio server at url

  let targetWs: WsWebSocket;

  try {
    if (!(await getIsDeviceRunning(deviceInfo))) {
      await bringUpDevice(deviceInfo.id); // might take a minute
    }
    await runScrcpyServerOnDevice(deviceInfo);
    const wsUrlString = getTargetWsScrcpyUrlForDevice(deviceInfo);
    const wsUrl = new URL(wsUrlString);
    targetWs = await createWebSocketProxy(wsUrl, req, ws);
  } catch (e) {
    console.error("error creating websocket proxy", e);
    ws.close(1014);
    return;
  }

  console.debug("ws proxy established", ws.readyState, targetWs.readyState);
  attachUpdateListener(ws, targetWs, deviceId);
}
