/*
  Warnings:

  - Added the required column `segment_id` to the `idea` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sub_segment_id` to the `idea` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "idea" ADD COLUMN     "segment_id" INTEGER NOT NULL,
ADD COLUMN     "sub_segment_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "idea" ADD FOREIGN KEY ("segment_id") REFERENCES "segment"("seg_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "idea" ADD FOREIGN KEY ("sub_segment_id") REFERENCES "sub_segment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
