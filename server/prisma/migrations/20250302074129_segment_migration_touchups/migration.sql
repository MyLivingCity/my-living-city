/*
  Warnings:

  - You are about to drop the column `segment_id` on the `idea_comment` table. All the data in the column will be lost.
  - You are about to drop the column `sub_segment_id` on the `idea_comment` table. All the data in the column will be lost.
  - You are about to drop the column `super_segment_id` on the `idea_comment` table. All the data in the column will be lost.
  - The primary key for the `idea_segment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `idea_segment` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `user_handle` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `user_handle` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `UserSegment` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `user_segment_id` on the `idea_comment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "UserSegment" DROP CONSTRAINT "UserSegment_segmentId_fkey";

-- DropForeignKey
ALTER TABLE "UserSegment" DROP CONSTRAINT "UserSegment_user_id_fkey";

-- DropForeignKey
ALTER TABLE "idea_comment" DROP CONSTRAINT "idea_comment_user_segment_id_fkey";

-- DropIndex
DROP INDEX "idea_segment_idea_id_segmentId_key";

-- AlterTable
ALTER TABLE "idea_comment" DROP COLUMN "segment_id",
DROP COLUMN "sub_segment_id",
DROP COLUMN "super_segment_id",
DROP COLUMN "user_segment_id",
ADD COLUMN     "user_segment_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "idea_segment" DROP CONSTRAINT "idea_segment_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "idea_segment_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "user_handle" DROP CONSTRAINT "user_handle_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "user_handle_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "UserSegment";

-- CreateTable
CREATE TABLE "user_segment" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "user_segment_relationship_type" "user_segment_relationship_type" NOT NULL,
    "segmentId" INTEGER NOT NULL,

    CONSTRAINT "user_segment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "user_segment" ADD CONSTRAINT "user_segment_segmentId_fkey" FOREIGN KEY ("segmentId") REFERENCES "segment"("seg_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_segment" ADD CONSTRAINT "user_segment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "idea_comment" ADD CONSTRAINT "idea_comment_user_segment_id_fkey" FOREIGN KEY ("user_segment_id") REFERENCES "user_segment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
