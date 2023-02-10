/*
  Warnings:

  - A unique constraint covering the columns `[id,userId,ideaId]` on the table `quarantine_notifications` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "user_idea_quarantine_unique";

-- CreateIndex
CREATE UNIQUE INDEX "user_idea_quarantine_unique" ON "quarantine_notifications"("id", "userId", "ideaId");
