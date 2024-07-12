/*
  Warnings:

  - The values [ON,OFF] on the enum `DeviceState` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "DeviceState_new" AS ENUM ('USABLE', 'SUSPENDED', 'UNAVAILABLE');
ALTER TABLE "devices" ALTER COLUMN "last_state" DROP DEFAULT;
ALTER TABLE "devices" ALTER COLUMN "last_state" TYPE "DeviceState_new" USING ("last_state"::text::"DeviceState_new");
ALTER TYPE "DeviceState" RENAME TO "DeviceState_old";
ALTER TYPE "DeviceState_new" RENAME TO "DeviceState";
DROP TYPE "DeviceState_old";
ALTER TABLE "devices" ALTER COLUMN "last_state" SET DEFAULT 'USABLE';
COMMIT;

-- AlterTable
ALTER TABLE "devices" ALTER COLUMN "last_state" SET DEFAULT 'USABLE';
