/*
  Warnings:

  - A unique constraint covering the columns `[proposal_id,author_id]` on the table `collaborator` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[proposal_id,author_id]` on the table `donors` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[proposal_id,author_id]` on the table `volunteer` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "collaborator_unique" ON "collaborator"("proposal_id", "author_id");

-- CreateIndex
CREATE UNIQUE INDEX "donor_unique" ON "donors"("proposal_id", "author_id");

-- CreateIndex
CREATE UNIQUE INDEX "volunteer_unique" ON "volunteer"("proposal_id", "author_id");
