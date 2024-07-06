-- AlterTable
ALTER TABLE "devices" ADD COLUMN     "adb_hostname" TEXT NOT NULL DEFAULT 'localhost',
ADD COLUMN     "device_hostname" TEXT NOT NULL DEFAULT 'localhost',
ADD COLUMN     "device_tls" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "basic_auth_username" DROP NOT NULL,
ALTER COLUMN "basic_auth_username" DROP DEFAULT,
ALTER COLUMN "basic_auth_password" DROP NOT NULL;
