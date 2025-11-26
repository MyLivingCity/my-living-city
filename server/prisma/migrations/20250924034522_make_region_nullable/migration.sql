-- DropForeignKey
ALTER TABLE "subgroup" DROP CONSTRAINT "subgroup_region_id_fkey";

-- AlterTable
ALTER TABLE "subgroup" ALTER COLUMN "region_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "subgroup" ADD CONSTRAINT "subgroup_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "segment"("seg_id") ON DELETE SET NULL ON UPDATE CASCADE;
