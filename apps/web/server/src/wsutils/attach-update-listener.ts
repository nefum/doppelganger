import { getPrisma } from "%/database/prisma.ts";
import { WebSocket as WsWebSocket } from "ws";

const UPDATE_DB_INTERVAL = 60_000; // 60s

export function attachUpdateListener(
  ws: WsWebSocket,
  targetWs: WsWebSocket,
  deviceId: string,
): void {
  const prisma = getPrisma();

  // now that the proxy is established and piping in the background, we can write to the db that the device is streaming
  // only write this for video streaming (scrcpy & kasmvnc)
  async function refreshDeviceStreamingStatus() {
    if (ws.readyState !== ws.OPEN || targetWs.readyState !== targetWs.OPEN) {
      return;
    }
    await prisma.device.update({
      where: {
        id: deviceId,
      },
      data: {
        lastConnectedAt: new Date(),
      },
    });
  }

  // setInterval runs it repeatedly
  const refreshInterval = setInterval(
    refreshDeviceStreamingStatus,
    UPDATE_DB_INTERVAL,
  );
  ws.on("close", () => {
    clearInterval(refreshInterval);
  });
}
