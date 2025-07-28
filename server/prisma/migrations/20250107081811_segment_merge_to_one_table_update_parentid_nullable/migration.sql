-- DropForeignKey
ALTER TABLE "segment" DROP CONSTRAINT "segment_parentId_fkey";

-- AlterTable
ALTER TABLE "segment" ALTER COLUMN "parentId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "segment" ADD CONSTRAINT "segment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "segment"("seg_id") ON DELETE SET NULL ON UPDATE CASCADE;
