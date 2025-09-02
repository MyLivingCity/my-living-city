/*
  Warnings:

  - The `region_id` column on the `subgroup` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `segment_id` column on the `subgroup` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `sub_segment_id` column on the `subgroup` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "subgroup" DROP COLUMN "region_id",
ADD COLUMN     "region_id" INTEGER,
DROP COLUMN "segment_id",
ADD COLUMN     "segment_id" INTEGER,
DROP COLUMN "sub_segment_id",
ADD COLUMN     "sub_segment_id" INTEGER;

-- AddForeignKey
ALTER TABLE "subgroup" ADD CONSTRAINT "subgroup_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "segment"("seg_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subgroup" ADD CONSTRAINT "subgroup_segment_id_fkey" FOREIGN KEY ("segment_id") REFERENCES "segment"("seg_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subgroup" ADD CONSTRAINT "subgroup_sub_segment_id_fkey" FOREIGN KEY ("sub_segment_id") REFERENCES "segment"("seg_id") ON DELETE SET NULL ON UPDATE CASCADE;
