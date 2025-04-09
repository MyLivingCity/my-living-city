/*
  Warnings:

  - You are about to drop the `idea_segment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "idea_segment" DROP CONSTRAINT "idea_segment_idea_id_fkey";

-- DropForeignKey
ALTER TABLE "idea_segment" DROP CONSTRAINT "idea_segment_segmentId_fkey";

-- DropTable
DROP TABLE "idea_segment";

-- CreateTable
CREATE TABLE "_IdeaToSegments" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_IdeaToSegments_AB_unique" ON "_IdeaToSegments"("A", "B");

-- CreateIndex
CREATE INDEX "_IdeaToSegments_B_index" ON "_IdeaToSegments"("B");

-- AddForeignKey
ALTER TABLE "_IdeaToSegments" ADD CONSTRAINT "_IdeaToSegments_A_fkey" FOREIGN KEY ("A") REFERENCES "idea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_IdeaToSegments" ADD CONSTRAINT "_IdeaToSegments_B_fkey" FOREIGN KEY ("B") REFERENCES "segment"("seg_id") ON DELETE CASCADE ON UPDATE CASCADE;
