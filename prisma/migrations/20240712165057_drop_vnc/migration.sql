/*
  Warnings:

  - You are about to drop the column `audio_ws_port` on the `devices` table. All the data in the column will be lost.
  - You are about to drop the column `basic_auth_password` on the `devices` table. All the data in the column will be lost.
  - You are about to drop the column `basic_auth_username` on the `devices` table. All the data in the column will be lost.
  - You are about to drop the column `certificate_is_self_signed` on the `devices` table. All the data in the column will be lost.
  - You are about to drop the column `device_hostname` on the `devices` table. All the data in the column will be lost.
  - You are about to drop the column `device_tls` on the `devices` table. All the data in the column will be lost.
  - You are about to drop the column `vnc_wss_path` on the `devices` table. All the data in the column will be lost.
  - You are about to drop the column `vnc_wss_port` on the `devices` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "devices" DROP COLUMN "audio_ws_port",
DROP COLUMN "basic_auth_password",
DROP COLUMN "basic_auth_username",
DROP COLUMN "certificate_is_self_signed",
DROP COLUMN "device_hostname",
DROP COLUMN "device_tls",
DROP COLUMN "vnc_wss_path",
DROP COLUMN "vnc_wss_port";
