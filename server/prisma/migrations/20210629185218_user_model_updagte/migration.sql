/*
  Warnings:

  - You are about to drop the column `user_segment_id` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `user_home_subsegment_id` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `user_school_subsegment_id` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `user_work_subsegment_id` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `segmentsSegId` on the `user` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "user" DROP CONSTRAINT "user_segmentsSegId_fkey";

-- AlterTable
ALTER TABLE "user" DROP COLUMN "user_segment_id",
DROP COLUMN "user_home_subsegment_id",
DROP COLUMN "user_school_subsegment_id",
DROP COLUMN "user_work_subsegment_id",
DROP COLUMN "segmentsSegId";
