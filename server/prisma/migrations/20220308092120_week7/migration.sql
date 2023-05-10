/*
  Warnings:

  - You are about to drop the column `created_at` on the `proposal` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `proposal` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `proposal` table. All the data in the column will be lost.
  - Made the column `idea_id` on table `proposal` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "proposal" DROP COLUMN "created_at",
DROP COLUMN "description",
DROP COLUMN "updated_at",
ADD COLUMN     "testString" TEXT,
ALTER COLUMN "idea_id" SET NOT NULL;

-- CreateTable
CREATE TABLE "_collaborator" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_volunteer" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_donor" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_suggestion" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_feedback" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_other" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_collaborator_AB_unique" ON "_collaborator"("A", "B");

-- CreateIndex
CREATE INDEX "_collaborator_B_index" ON "_collaborator"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_volunteer_AB_unique" ON "_volunteer"("A", "B");

-- CreateIndex
CREATE INDEX "_volunteer_B_index" ON "_volunteer"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_donor_AB_unique" ON "_donor"("A", "B");

-- CreateIndex
CREATE INDEX "_donor_B_index" ON "_donor"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_suggestion_AB_unique" ON "_suggestion"("A", "B");

-- CreateIndex
CREATE INDEX "_suggestion_B_index" ON "_suggestion"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_feedback_AB_unique" ON "_feedback"("A", "B");

-- CreateIndex
CREATE INDEX "_feedback_B_index" ON "_feedback"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_other_AB_unique" ON "_other"("A", "B");

-- CreateIndex
CREATE INDEX "_other_B_index" ON "_other"("B");

-- AddForeignKey
ALTER TABLE "_collaborator" ADD FOREIGN KEY ("A") REFERENCES "proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_collaborator" ADD FOREIGN KEY ("B") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_volunteer" ADD FOREIGN KEY ("A") REFERENCES "proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_volunteer" ADD FOREIGN KEY ("B") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_donor" ADD FOREIGN KEY ("A") REFERENCES "proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_donor" ADD FOREIGN KEY ("B") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_suggestion" ADD FOREIGN KEY ("A") REFERENCES "proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_suggestion" ADD FOREIGN KEY ("B") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_feedback" ADD FOREIGN KEY ("A") REFERENCES "proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_feedback" ADD FOREIGN KEY ("B") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_other" ADD FOREIGN KEY ("A") REFERENCES "proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_other" ADD FOREIGN KEY ("B") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
