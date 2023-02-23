-- AlterEnum
-- ALTER TYPE "user_type" ADD VALUE 'SUPER_ADMIN';

-- DropForeignKey
ALTER TABLE "UserSegments" DROP CONSTRAINT "UserSegments_user_id_fkey";

-- DropForeignKey
ALTER TABLE "advertisement" DROP CONSTRAINT "advertisement_owner_id_fkey";

-- DropForeignKey
ALTER TABLE "collaborator" DROP CONSTRAINT "collaborator_author_id_fkey";

-- DropForeignKey
ALTER TABLE "collaborator" DROP CONSTRAINT "collaborator_proposal_id_fkey";

-- DropForeignKey
ALTER TABLE "donors" DROP CONSTRAINT "donors_author_id_fkey";

-- DropForeignKey
ALTER TABLE "donors" DROP CONSTRAINT "donors_proposal_id_fkey";

-- DropForeignKey
ALTER TABLE "idea" DROP CONSTRAINT "idea_author_id_fkey";

-- DropForeignKey
ALTER TABLE "idea" DROP CONSTRAINT "idea_category_id_fkey";

-- DropForeignKey
ALTER TABLE "idea" DROP CONSTRAINT "idea_segment_id_fkey";

-- DropForeignKey
ALTER TABLE "idea" DROP CONSTRAINT "idea_sub_segment_id_fkey";

-- DropForeignKey
ALTER TABLE "idea" DROP CONSTRAINT "idea_super_segment_id_fkey";

-- DropForeignKey
ALTER TABLE "idea_address" DROP CONSTRAINT "idea_address_idea_id_fkey";

-- DropForeignKey
ALTER TABLE "idea_comment" DROP CONSTRAINT "idea_comment_author_id_fkey";

-- DropForeignKey
ALTER TABLE "idea_comment" DROP CONSTRAINT "idea_comment_idea_id_fkey";

-- DropForeignKey
ALTER TABLE "idea_comment" DROP CONSTRAINT "idea_comment_user_segment_id_fkey";

-- DropForeignKey
ALTER TABLE "idea_geo" DROP CONSTRAINT "idea_geo_idea_id_fkey";

-- DropForeignKey
ALTER TABLE "idea_rating" DROP CONSTRAINT "idea_rating_author_id_fkey";

-- DropForeignKey
ALTER TABLE "idea_rating" DROP CONSTRAINT "idea_rating_idea_id_fkey";

-- DropForeignKey
ALTER TABLE "project" DROP CONSTRAINT "project_idea_id_fkey";

-- DropForeignKey
ALTER TABLE "proposal" DROP CONSTRAINT "proposal_idea_id_fkey";

-- DropForeignKey
ALTER TABLE "segment" DROP CONSTRAINT "segment_superSegId_fkey";

-- DropForeignKey
ALTER TABLE "segmentRequest" DROP CONSTRAINT "segmentRequest_user_id_fkey";

-- DropForeignKey
ALTER TABLE "sub_segment" DROP CONSTRAINT "sub_segment_seg_id_fkey";

-- DropForeignKey
ALTER TABLE "user_address" DROP CONSTRAINT "user_address_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_geo" DROP CONSTRAINT "user_geo_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_idea_follow" DROP CONSTRAINT "user_idea_follow_idea_id_fkey";

-- DropForeignKey
ALTER TABLE "user_idea_follow" DROP CONSTRAINT "user_idea_follow_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_reach" DROP CONSTRAINT "user_reach_segId_fkey";

-- DropForeignKey
ALTER TABLE "user_reach" DROP CONSTRAINT "user_reach_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_stripe" DROP CONSTRAINT "user_stripe_userId_fkey";

-- DropForeignKey
ALTER TABLE "volunteer" DROP CONSTRAINT "volunteer_author_id_fkey";

-- DropForeignKey
ALTER TABLE "volunteer" DROP CONSTRAINT "volunteer_proposal_id_fkey";

-- AlterTable
ALTER TABLE "idea_comment" ADD COLUMN     "banned_comment" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "comment_flag_num" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "has_flagged" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "total_flagged" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Ban" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ban_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "banned_until" TIMESTAMP(3) NOT NULL,
    "ban_message" TEXT,

    CONSTRAINT "Ban_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "user_geo" ADD CONSTRAINT "user_geo_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_address" ADD CONSTRAINT "user_address_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ban" ADD CONSTRAINT "Ban_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSegments" ADD CONSTRAINT "UserSegments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "idea_geo" ADD CONSTRAINT "idea_geo_idea_id_fkey" FOREIGN KEY ("idea_id") REFERENCES "idea"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "idea_address" ADD CONSTRAINT "idea_address_idea_id_fkey" FOREIGN KEY ("idea_id") REFERENCES "idea"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collaborator" ADD CONSTRAINT "collaborator_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collaborator" ADD CONSTRAINT "collaborator_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "proposal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "volunteer" ADD CONSTRAINT "volunteer_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "volunteer" ADD CONSTRAINT "volunteer_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "proposal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donors" ADD CONSTRAINT "donors_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donors" ADD CONSTRAINT "donors_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "proposal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "idea" ADD CONSTRAINT "idea_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "idea" ADD CONSTRAINT "idea_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "idea" ADD CONSTRAINT "idea_super_segment_id_fkey" FOREIGN KEY ("super_segment_id") REFERENCES "super_segment"("super_seg_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "idea" ADD CONSTRAINT "idea_segment_id_fkey" FOREIGN KEY ("segment_id") REFERENCES "segment"("seg_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "idea" ADD CONSTRAINT "idea_sub_segment_id_fkey" FOREIGN KEY ("sub_segment_id") REFERENCES "sub_segment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposal" ADD CONSTRAINT "proposal_idea_id_fkey" FOREIGN KEY ("idea_id") REFERENCES "idea"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_idea_id_fkey" FOREIGN KEY ("idea_id") REFERENCES "idea"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "idea_rating" ADD CONSTRAINT "idea_rating_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "idea_rating" ADD CONSTRAINT "idea_rating_idea_id_fkey" FOREIGN KEY ("idea_id") REFERENCES "idea"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "idea_comment" ADD CONSTRAINT "idea_comment_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "idea_comment" ADD CONSTRAINT "idea_comment_user_segment_id_fkey" FOREIGN KEY ("user_segment_id") REFERENCES "UserSegments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "idea_comment" ADD CONSTRAINT "idea_comment_idea_id_fkey" FOREIGN KEY ("idea_id") REFERENCES "idea"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "advertisement" ADD CONSTRAINT "advertisement_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "segment" ADD CONSTRAINT "segment_superSegId_fkey" FOREIGN KEY ("superSegId") REFERENCES "super_segment"("super_seg_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_reach" ADD CONSTRAINT "user_reach_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_reach" ADD CONSTRAINT "user_reach_segId_fkey" FOREIGN KEY ("segId") REFERENCES "segment"("seg_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_idea_follow" ADD CONSTRAINT "user_idea_follow_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_idea_follow" ADD CONSTRAINT "user_idea_follow_idea_id_fkey" FOREIGN KEY ("idea_id") REFERENCES "idea"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_segment" ADD CONSTRAINT "sub_segment_seg_id_fkey" FOREIGN KEY ("seg_id") REFERENCES "segment"("seg_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "segmentRequest" ADD CONSTRAINT "segmentRequest_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_stripe" ADD CONSTRAINT "user_stripe_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "UserSegments.user_id_unique" RENAME TO "UserSegments_user_id_key";

-- RenameIndex
ALTER INDEX "category.title_unique" RENAME TO "category_title_key";

-- RenameIndex
ALTER INDEX "collaborator_unique" RENAME TO "collaborator_proposal_id_author_id_key";

-- RenameIndex
ALTER INDEX "donor_unique" RENAME TO "donors_proposal_id_author_id_key";

-- RenameIndex
ALTER INDEX "idea_address.idea_id_unique" RENAME TO "idea_address_idea_id_key";

-- RenameIndex
ALTER INDEX "idea_geo.idea_id_unique" RENAME TO "idea_geo_idea_id_key";

-- RenameIndex
ALTER INDEX "project.idea_id_unique" RENAME TO "project_idea_id_key";

-- RenameIndex
ALTER INDEX "proposal.idea_id_unique" RENAME TO "proposal_idea_id_key";

-- RenameIndex
ALTER INDEX "user.email_unique" RENAME TO "user_email_key";

-- RenameIndex
ALTER INDEX "user_address.user_id_unique" RENAME TO "user_address_user_id_key";

-- RenameIndex
ALTER INDEX "user_geo.user_id_unique" RENAME TO "user_geo_user_id_key";

-- RenameIndex
ALTER INDEX "user_idea_follow_unique" RENAME TO "user_idea_follow_user_id_idea_id_key";

-- RenameIndex
ALTER INDEX "user_reach_unique" RENAME TO "user_reach_user_id_segId_key";

-- RenameIndex
ALTER INDEX "user_stripe_userId_unique" RENAME TO "user_stripe_userId_key";

-- RenameIndex
ALTER INDEX "volunteer_unique" RENAME TO "volunteer_proposal_id_author_id_key";
