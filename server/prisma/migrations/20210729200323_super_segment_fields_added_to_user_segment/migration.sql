-- AlterTable
ALTER TABLE "UserSegments" ADD COLUMN     "home_super_segment_id" INTEGER,
ADD COLUMN     "home_super_segment_name" TEXT,
ADD COLUMN     "work_super_segment_id" INTEGER,
ADD COLUMN     "work_super_segment_name" TEXT,
ADD COLUMN     "school_super_segment_id" INTEGER,
ADD COLUMN     "school_super_segment_name" TEXT;

-- AddForeignKey
ALTER TABLE "UserSegments" ADD FOREIGN KEY ("home_super_segment_id") REFERENCES "super_segment"("super_seg_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSegments" ADD FOREIGN KEY ("work_super_segment_id") REFERENCES "super_segment"("super_seg_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSegments" ADD FOREIGN KEY ("school_super_segment_id") REFERENCES "super_segment"("super_seg_id") ON DELETE SET NULL ON UPDATE CASCADE;
