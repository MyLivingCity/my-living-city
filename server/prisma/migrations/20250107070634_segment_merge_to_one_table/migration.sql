/*
  Warnings:

  - You are about to drop the column `home_seg_handle` on the `UserSegments` table. All the data in the column will be lost.
  - You are about to drop the column `home_segment_id` on the `UserSegments` table. All the data in the column will be lost.
  - You are about to drop the column `home_segment_name` on the `UserSegments` table. All the data in the column will be lost.
  - You are about to drop the column `home_sub_segment` on the `UserSegments` table. All the data in the column will be lost.
  - You are about to drop the column `home_sub_segment_name` on the `UserSegments` table. All the data in the column will be lost.
  - You are about to drop the column `home_super_segment_id` on the `UserSegments` table. All the data in the column will be lost.
  - You are about to drop the column `home_super_segment_name` on the `UserSegments` table. All the data in the column will be lost.
  - You are about to drop the column `school_seg_handle` on the `UserSegments` table. All the data in the column will be lost.
  - You are about to drop the column `school_segment_id` on the `UserSegments` table. All the data in the column will be lost.
  - You are about to drop the column `school_segment_name` on the `UserSegments` table. All the data in the column will be lost.
  - You are about to drop the column `school_sub_segment` on the `UserSegments` table. All the data in the column will be lost.
  - You are about to drop the column `school_sub_segment_name` on the `UserSegments` table. All the data in the column will be lost.
  - You are about to drop the column `school_super_segment_id` on the `UserSegments` table. All the data in the column will be lost.
  - You are about to drop the column `school_super_segment_name` on the `UserSegments` table. All the data in the column will be lost.
  - You are about to drop the column `work_seg_handle` on the `UserSegments` table. All the data in the column will be lost.
  - You are about to drop the column `work_segment_id` on the `UserSegments` table. All the data in the column will be lost.
  - You are about to drop the column `work_segment_name` on the `UserSegments` table. All the data in the column will be lost.
  - You are about to drop the column `work_sub_segment` on the `UserSegments` table. All the data in the column will be lost.
  - You are about to drop the column `work_sub_segment_name` on the `UserSegments` table. All the data in the column will be lost.
  - You are about to drop the column `work_super_segment_id` on the `UserSegments` table. All the data in the column will be lost.
  - You are about to drop the column `work_super_segment_name` on the `UserSegments` table. All the data in the column will be lost.
  - You are about to drop the column `segment_id` on the `idea` table. All the data in the column will be lost.
  - You are about to drop the column `sub_segment_id` on the `idea` table. All the data in the column will be lost.
  - You are about to drop the column `super_segment_id` on the `idea` table. All the data in the column will be lost.
  - You are about to drop the column `superSegId` on the `segment` table. All the data in the column will be lost.
  - You are about to drop the column `super_segment_name` on the `segment` table. All the data in the column will be lost.
  - You are about to drop the `sub_segment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `super_segment` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `segmentHandle` to the `UserSegments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `segmentId` to the `UserSegments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_segment_relationship_type` to the `UserSegments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `segmentIdeaId` to the `idea` table without a default value. This is not possible if the table is not empty.
  - Added the required column `parentId` to the `segment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `segmentType` to the `segment` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "user_segment_relationship_type" AS ENUM ('HOME', 'WORK', 'SCHOOL');

-- CreateEnum
CREATE TYPE "SegmentType" AS ENUM ('segment', 'superSegment', 'subSegment');

-- DropForeignKey
ALTER TABLE "UserSegments" DROP CONSTRAINT "UserSegments_home_segment_id_fkey";

-- DropForeignKey
ALTER TABLE "UserSegments" DROP CONSTRAINT "UserSegments_home_sub_segment_fkey";

-- DropForeignKey
ALTER TABLE "UserSegments" DROP CONSTRAINT "UserSegments_home_super_segment_id_fkey";

-- DropForeignKey
ALTER TABLE "UserSegments" DROP CONSTRAINT "UserSegments_school_segment_id_fkey";

-- DropForeignKey
ALTER TABLE "UserSegments" DROP CONSTRAINT "UserSegments_school_sub_segment_fkey";

-- DropForeignKey
ALTER TABLE "UserSegments" DROP CONSTRAINT "UserSegments_school_super_segment_id_fkey";

-- DropForeignKey
ALTER TABLE "UserSegments" DROP CONSTRAINT "UserSegments_work_segment_id_fkey";

-- DropForeignKey
ALTER TABLE "UserSegments" DROP CONSTRAINT "UserSegments_work_sub_segment_fkey";

-- DropForeignKey
ALTER TABLE "UserSegments" DROP CONSTRAINT "UserSegments_work_super_segment_id_fkey";

-- DropForeignKey
ALTER TABLE "idea" DROP CONSTRAINT "idea_segment_id_fkey";

-- DropForeignKey
ALTER TABLE "idea" DROP CONSTRAINT "idea_sub_segment_id_fkey";

-- DropForeignKey
ALTER TABLE "idea" DROP CONSTRAINT "idea_super_segment_id_fkey";

-- DropForeignKey
ALTER TABLE "segment" DROP CONSTRAINT "segment_superSegId_fkey";

-- DropForeignKey
ALTER TABLE "sub_segment" DROP CONSTRAINT "sub_segment_seg_id_fkey";

-- AlterTable
ALTER TABLE "UserSegments" DROP COLUMN "home_seg_handle",
DROP COLUMN "home_segment_id",
DROP COLUMN "home_segment_name",
DROP COLUMN "home_sub_segment",
DROP COLUMN "home_sub_segment_name",
DROP COLUMN "home_super_segment_id",
DROP COLUMN "home_super_segment_name",
DROP COLUMN "school_seg_handle",
DROP COLUMN "school_segment_id",
DROP COLUMN "school_segment_name",
DROP COLUMN "school_sub_segment",
DROP COLUMN "school_sub_segment_name",
DROP COLUMN "school_super_segment_id",
DROP COLUMN "school_super_segment_name",
DROP COLUMN "work_seg_handle",
DROP COLUMN "work_segment_id",
DROP COLUMN "work_segment_name",
DROP COLUMN "work_sub_segment",
DROP COLUMN "work_sub_segment_name",
DROP COLUMN "work_super_segment_id",
DROP COLUMN "work_super_segment_name",
ADD COLUMN     "segmentHandle" TEXT NOT NULL,
ADD COLUMN     "segmentId" INTEGER NOT NULL,
ADD COLUMN     "user_segment_relationship_type" "user_segment_relationship_type" NOT NULL;

-- AlterTable
ALTER TABLE "idea" DROP COLUMN "segment_id",
DROP COLUMN "sub_segment_id",
DROP COLUMN "super_segment_id",
ADD COLUMN     "segmentIdeaId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "segment" DROP COLUMN "superSegId",
DROP COLUMN "super_segment_name",
ADD COLUMN     "lat" DECIMAL(65,30),
ADD COLUMN     "lon" DECIMAL(65,30),
ADD COLUMN     "parentId" INTEGER NOT NULL,
ADD COLUMN     "radius" DECIMAL(65,30),
ADD COLUMN     "segmentType" "SegmentType" NOT NULL;

-- DropTable
DROP TABLE "sub_segment";

-- DropTable
DROP TABLE "super_segment";

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
ALTER TABLE "UserSegments" ADD CONSTRAINT "UserSegments_segmentId_fkey" FOREIGN KEY ("segmentId") REFERENCES "segment"("seg_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "segment" ADD CONSTRAINT "segment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "segment"("seg_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_IdeaToSegments" ADD CONSTRAINT "_IdeaToSegments_A_fkey" FOREIGN KEY ("A") REFERENCES "idea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_IdeaToSegments" ADD CONSTRAINT "_IdeaToSegments_B_fkey" FOREIGN KEY ("B") REFERENCES "segment"("seg_id") ON DELETE CASCADE ON UPDATE CASCADE;
