/*
  Warnings:

  - You are about to drop the column `owner_email` on the `devices` table. All the data in the column will be lost.
  - Added the required column `owner` to the `devices` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "devices_owner_email_id_idx";

-- AlterTable
ALTER TABLE "devices" DROP COLUMN "owner_email",
ADD COLUMN     "owner" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "devices_owner_id_idx" ON "devices"("owner", "id");
