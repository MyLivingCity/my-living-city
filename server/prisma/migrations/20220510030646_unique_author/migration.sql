/*
  Warnings:

  - A unique constraint covering the columns `[author_id]` on the table `collaborator` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "collaborator.author_id_unique" ON "collaborator"("author_id");
