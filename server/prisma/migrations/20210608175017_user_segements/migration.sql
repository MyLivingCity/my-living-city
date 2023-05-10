-- CreateTable
CREATE TABLE "UserSegments" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "home_segment_id" INTEGER,
    "work_segment_id" INTEGER,
    "school_segment_id" INTEGER,
    "home_sub_segment" INTEGER,
    "work_sub_segment" INTEGER,
    "school_sub_segment" INTEGER,

    PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserSegments" ADD FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSegments" ADD FOREIGN KEY ("home_segment_id") REFERENCES "segment"("seg_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSegments" ADD FOREIGN KEY ("work_segment_id") REFERENCES "segment"("seg_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSegments" ADD FOREIGN KEY ("school_segment_id") REFERENCES "segment"("seg_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSegments" ADD FOREIGN KEY ("home_sub_segment") REFERENCES "sub_segment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSegments" ADD FOREIGN KEY ("work_sub_segment") REFERENCES "sub_segment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSegments" ADD FOREIGN KEY ("school_sub_segment") REFERENCES "sub_segment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
