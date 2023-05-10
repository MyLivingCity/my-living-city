-- CreateTable
CREATE TABLE "segment" (
    "seg_id" SERIAL NOT NULL,
    "country" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "segment_name" TEXT NOT NULL,
    "super_segment_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("seg_id")
);

-- CreateTable
CREATE TABLE "sub_segment" (
    "id" SERIAL NOT NULL,
    "seg_id" INTEGER NOT NULL,
    "sub_segment_name" TEXT NOT NULL,
    "lat" DECIMAL(65,30),
    "lon" DECIMAL(65,30),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "sub_segment" ADD FOREIGN KEY ("seg_id") REFERENCES "segment"("seg_id") ON DELETE CASCADE ON UPDATE CASCADE;
