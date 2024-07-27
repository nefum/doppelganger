-- CreateEnum
CREATE TYPE "DeviceState" AS ENUM ('ON', 'OFF', 'SUSPENDED', 'UNAVAILABLE');

-- CreateTable
CREATE TABLE "devices" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "owner_email" TEXT NOT NULL,
    "redroid_image" TEXT NOT NULL,
    "redroid_fps" INTEGER NOT NULL,
    "redroid_dpi" INTEGER NOT NULL,
    "redroid_width" INTEGER NOT NULL,
    "redroid_height" INTEGER NOT NULL,
    "adb_port" INTEGER NOT NULL DEFAULT 5555,
    "vnc_wss_path" TEXT NOT NULL DEFAULT 'websockify',
    "vnc_wss_port" INTEGER NOT NULL DEFAULT 6901,
    "audio_ws_port" INTEGER NOT NULL DEFAULT 4901,
    "basic_auth_username" TEXT NOT NULL DEFAULT 'kasm_user',
    "basic_auth_password" TEXT NOT NULL,
    "certificate_is_self_signed" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_state" "DeviceState" NOT NULL DEFAULT 'OFF',

    CONSTRAINT "devices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "devices_id_key" ON "devices"("id");

-- CreateIndex
CREATE INDEX "devices_owner_email_id_idx" ON "devices"("owner_email", "id");
