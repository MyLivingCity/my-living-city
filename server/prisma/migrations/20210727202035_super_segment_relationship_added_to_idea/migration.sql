/*
  Warnings:

  - Added the required column `super_segment_id` to the `idea` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "idea" ADD COLUMN     "super_segment_id" INTEGER NOT NULL,
ALTER COLUMN "segment_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "idea" ADD FOREIGN KEY ("super_segment_id") REFERENCES "super_segment"("super_seg_id") ON DELETE CASCADE ON UPDATE CASCADE;
