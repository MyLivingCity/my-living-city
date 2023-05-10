-- AlterTable
ALTER TABLE "idea_comment" ADD COLUMN     "super_segment_id" INTEGER,
ADD COLUMN     "sub_segment_id" INTEGER,
ALTER COLUMN "segment_id" DROP NOT NULL;
