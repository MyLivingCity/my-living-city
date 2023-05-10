/*
  Warnings:

  - Added the required column `user_segment_id` to the `idea_comment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `segment_id` to the `idea_comment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "idea_comment" ADD COLUMN     "user_segment_id" TEXT NOT NULL,
ADD COLUMN     "segment_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "idea_comment" ADD FOREIGN KEY ("user_segment_id") REFERENCES "UserSegments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
