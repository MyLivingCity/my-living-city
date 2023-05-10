/*
  Warnings:

  - Added the required column `superSegId` to the `segment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "segment" ADD COLUMN     "superSegId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "super_segment" (
    "super_seg_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("super_seg_id")
);

-- AddForeignKey
ALTER TABLE "segment" ADD FOREIGN KEY ("superSegId") REFERENCES "super_segment"("super_seg_id") ON DELETE CASCADE ON UPDATE CASCADE;
