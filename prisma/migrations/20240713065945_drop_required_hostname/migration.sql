-- AlterTable
ALTER TABLE "devices" ALTER COLUMN "adb_hostname" DROP NOT NULL,
ALTER COLUMN "adb_hostname" DROP DEFAULT;
