import { getPrisma } from "%/database/prisma.ts";
import { WebSocket as WsWebSocket } from "ws";

const UPDATE_DB_INTERVAL = 60_000; // 60s

export async function updateDeviceLastConnected(
  deviceId: string,
): Promise<void> {
  const prisma = getPrisma();

  await prisma.device.update({
    where: {
      id: deviceId,
    },
    data: {
      lastConnectedAt: new Date(),
    },
  });
}

export async function refreshStreamingDevice(
  ws: WsWebSocket,
  targetWs: WsWebSocket,
  deviceId: string,
): Promise<void> {
  if (ws.readyState !== ws.OPEN || targetWs.readyState !== targetWs.OPEN) {
    return;
  }

  await updateDeviceLastConnected(deviceId);
}

export function attachUpdateListener(
  ws: WsWebSocket,
  targetWs: WsWebSocket,
  deviceId: string,
): void {
  // now that the proxy is established and piping in the background, we can write to the db that the device is streaming
  // only write this for video streaming (scrcpy & kasmvnc)

  // setInterval runs it repeatedly
  const refreshInterval = setInterval(
    refreshStreamingDevice,
    UPDATE_DB_INTERVAL,
    ws,
    targetWs,
    deviceId,
  );
  ws.on("close", () => {
    clearInterval(refreshInterval);
  });
}
