/*
  Warnings:

  - A unique constraint covering the columns `[user_id]` on the table `UserSegments` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UserSegments_user_id_unique" ON "UserSegments"("user_id");
