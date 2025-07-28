/*
  Warnings:

  - You are about to drop the `user_segment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "idea_comment" DROP CONSTRAINT "idea_comment_user_segment_id_fkey";

-- DropForeignKey
ALTER TABLE "user_segment" DROP CONSTRAINT "user_segment_segmentId_fkey";

-- DropForeignKey
ALTER TABLE "user_segment" DROP CONSTRAINT "user_segment_user_id_fkey";

-- DropTable
DROP TABLE "user_segment";

-- CreateTable
CREATE TABLE "UserSegments" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "user_segment_relationship_type" "user_segment_relationship_type" NOT NULL,
    "segmentId" INTEGER NOT NULL,

    CONSTRAINT "UserSegments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserSegments" ADD CONSTRAINT "UserSegments_segmentId_fkey" FOREIGN KEY ("segmentId") REFERENCES "segment"("seg_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSegments" ADD CONSTRAINT "UserSegments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "idea_comment" ADD CONSTRAINT "idea_comment_user_segment_id_fkey" FOREIGN KEY ("user_segment_id") REFERENCES "UserSegments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
