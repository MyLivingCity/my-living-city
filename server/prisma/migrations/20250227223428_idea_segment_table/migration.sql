/*
  Warnings:

  - You are about to drop the `_IdeaToSegments` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_IdeaToSegments" DROP CONSTRAINT "_IdeaToSegments_A_fkey";

-- DropForeignKey
ALTER TABLE "_IdeaToSegments" DROP CONSTRAINT "_IdeaToSegments_B_fkey";

-- DropTable
DROP TABLE "_IdeaToSegments";

-- CreateTable
CREATE TABLE "idea_segment" (
    "id" TEXT NOT NULL,
    "idea_id" INTEGER NOT NULL,
    "segmentId" INTEGER NOT NULL,

    CONSTRAINT "idea_segment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "idea_segment_idea_id_segmentId_key" ON "idea_segment"("idea_id", "segmentId");

-- AddForeignKey
ALTER TABLE "idea_segment" ADD CONSTRAINT "idea_segment_idea_id_fkey" FOREIGN KEY ("idea_id") REFERENCES "idea"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "idea_segment" ADD CONSTRAINT "idea_segment_segmentId_fkey" FOREIGN KEY ("segmentId") REFERENCES "segment"("seg_id") ON DELETE RESTRICT ON UPDATE CASCADE;
