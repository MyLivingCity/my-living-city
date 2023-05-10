-- DropIndex
DROP INDEX "UserSegments_user_id_unique";

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "user_segment_id" INTEGER,
ADD COLUMN     "user_home_subsegment_id" INTEGER,
ADD COLUMN     "user_school_subsegment_id" INTEGER,
ADD COLUMN     "user_work_subsegment_id" INTEGER,
ADD COLUMN     "segmentsSegId" INTEGER;

-- AddForeignKey
ALTER TABLE "user" ADD FOREIGN KEY ("segmentsSegId") REFERENCES "segment"("seg_id") ON DELETE SET NULL ON UPDATE CASCADE;
