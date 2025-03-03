/*
  Warnings:

  - You are about to drop the `UserSegments` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserSegments" DROP CONSTRAINT "UserSegments_segmentId_fkey";

-- DropForeignKey
ALTER TABLE "UserSegments" DROP CONSTRAINT "UserSegments_user_id_fkey";

-- DropForeignKey
ALTER TABLE "idea_comment" DROP CONSTRAINT "idea_comment_user_segment_id_fkey";

-- DropTable
DROP TABLE "UserSegments";

-- CreateTable
CREATE TABLE "user_handle" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "user_segment_relationship_type" "user_segment_relationship_type" NOT NULL,

    CONSTRAINT "user_handle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSegment" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "user_segment_relationship_type" "user_segment_relationship_type" NOT NULL,
    "segmentId" INTEGER NOT NULL,

    CONSTRAINT "UserSegment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_handle_user_id_user_segment_relationship_type_key" ON "user_handle"("user_id", "user_segment_relationship_type");

-- AddForeignKey
ALTER TABLE "user_handle" ADD CONSTRAINT "user_handle_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSegment" ADD CONSTRAINT "UserSegment_segmentId_fkey" FOREIGN KEY ("segmentId") REFERENCES "segment"("seg_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSegment" ADD CONSTRAINT "UserSegment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "idea_comment" ADD CONSTRAINT "idea_comment_user_segment_id_fkey" FOREIGN KEY ("user_segment_id") REFERENCES "UserSegment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
