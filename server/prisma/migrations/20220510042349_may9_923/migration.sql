/*
  Warnings:

  - A unique constraint covering the columns `[proposal_id,author_id]` on the table `collaborator` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "collaborator.author_id_unique";

-- CreateIndex
CREATE UNIQUE INDEX "collaborator.proposal_id_author_id_unique" ON "collaborator"("proposal_id", "author_id");
