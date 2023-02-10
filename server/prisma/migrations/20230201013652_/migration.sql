/*
  Warnings:

  - You are about to drop the column `banId` on the `ban_history` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ban_history" DROP CONSTRAINT "ban_history_banId_fkey";

-- AlterTable
ALTER TABLE "ban_history" DROP COLUMN "banId",
ADD COLUMN     "userBanType" TEXT,
ADD COLUMN     "userBannedUntil" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "ban_history" ADD FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
