/*
  Warnings:

  - A unique constraint covering the columns `[id,title]` on the table `idea` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `ideaTitle` to the `quarantine_notifications` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "quarantine_notifications" DROP CONSTRAINT "quarantine_notifications_ideaId_fkey";

-- AlterTable
ALTER TABLE "quarantine_notifications" ADD COLUMN     "ideaTitle" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "idea.id_title_unique" ON "idea"("id", "title");

-- AddForeignKey
ALTER TABLE "quarantine_notifications" ADD FOREIGN KEY ("ideaId", "ideaTitle") REFERENCES "idea"("id", "title") ON DELETE CASCADE ON UPDATE CASCADE;
