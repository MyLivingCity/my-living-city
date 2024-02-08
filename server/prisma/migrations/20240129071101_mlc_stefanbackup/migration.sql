-- DropForeignKey
ALTER TABLE "FeedbackRating" DROP CONSTRAINT "FeedbackRating_author_id_fkey";

-- DropForeignKey
ALTER TABLE "FeedbackRating" DROP CONSTRAINT "FeedbackRating_proposal_id_fkey";

-- DropForeignKey
ALTER TABLE "bad_posting_behavior" DROP CONSTRAINT "bad_posting_behavior_user_id_fkey";

-- DropForeignKey
ALTER TABLE "ban_comment" DROP CONSTRAINT "ban_comment_comment_id_fkey";

-- DropForeignKey
ALTER TABLE "ban_history" DROP CONSTRAINT "ban_history_userId_fkey";

-- DropForeignKey
ALTER TABLE "ban_post" DROP CONSTRAINT "ban_post_post_id_fkey";

-- DropForeignKey
ALTER TABLE "ban_user" DROP CONSTRAINT "ban_user_user_id_fkey";

-- DropForeignKey
ALTER TABLE "false_flagging_behavior" DROP CONSTRAINT "false_flagging_behavior_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public_community_business_profile" DROP CONSTRAINT "public_community_business_profile_userId_fkey";

-- DropForeignKey
ALTER TABLE "public_municipal_profile" DROP CONSTRAINT "public_municipal_profile_userId_fkey";

-- DropForeignKey
ALTER TABLE "quarantine_notifications" DROP CONSTRAINT "quarantine_notifications_ideaId_ideaTitle_fkey";

-- DropForeignKey
ALTER TABLE "quarantine_notifications" DROP CONSTRAINT "quarantine_notifications_userId_fkey";

-- DropForeignKey
ALTER TABLE "school_details" DROP CONSTRAINT "school_details_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_idea_endorse" DROP CONSTRAINT "user_idea_endorse_idea_id_fkey";

-- DropForeignKey
ALTER TABLE "user_idea_endorse" DROP CONSTRAINT "user_idea_endorse_user_id_fkey";

-- DropForeignKey
ALTER TABLE "work_details" DROP CONSTRAINT "work_details_user_id_fkey";

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "adminmod_email" TEXT;

-- AddForeignKey
ALTER TABLE "ban_user" ADD CONSTRAINT "ban_user_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ban_post" ADD CONSTRAINT "ban_post_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "idea"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ban_comment" ADD CONSTRAINT "ban_comment_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "idea_comment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedbackRating" ADD CONSTRAINT "FeedbackRating_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedbackRating" ADD CONSTRAINT "FeedbackRating_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "proposal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_idea_endorse" ADD CONSTRAINT "user_idea_endorse_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_idea_endorse" ADD CONSTRAINT "user_idea_endorse_idea_id_fkey" FOREIGN KEY ("idea_id") REFERENCES "idea"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quarantine_notifications" ADD CONSTRAINT "quarantine_notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quarantine_notifications" ADD CONSTRAINT "quarantine_notifications_ideaId_ideaTitle_fkey" FOREIGN KEY ("ideaId", "ideaTitle") REFERENCES "idea"("id", "title") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ban_history" ADD CONSTRAINT "ban_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public_community_business_profile" ADD CONSTRAINT "public_community_business_profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public_municipal_profile" ADD CONSTRAINT "public_municipal_profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "false_flagging_behavior" ADD CONSTRAINT "false_flagging_behavior_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bad_posting_behavior" ADD CONSTRAINT "bad_posting_behavior_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_details" ADD CONSTRAINT "school_details_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_details" ADD CONSTRAINT "work_details_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "UserSegments.user_id_unique" RENAME TO "UserSegments_user_id_key";

-- RenameIndex
ALTER INDEX "category.title_unique" RENAME TO "category_title_key";

-- RenameIndex
ALTER INDEX "collaborator_unique" RENAME TO "collaborator_proposal_id_author_id_key";

-- RenameIndex
ALTER INDEX "donor_unique" RENAME TO "donors_proposal_id_author_id_key";

-- RenameIndex
ALTER INDEX "idea.id_title_unique" RENAME TO "idea_id_title_key";

-- RenameIndex
ALTER INDEX "idea_address.idea_id_unique" RENAME TO "idea_address_idea_id_key";

-- RenameIndex
ALTER INDEX "idea_geo.idea_id_unique" RENAME TO "idea_geo_idea_id_key";

-- RenameIndex
ALTER INDEX "project.idea_id_unique" RENAME TO "project_idea_id_key";

-- RenameIndex
ALTER INDEX "proposal.idea_id_unique" RENAME TO "proposal_idea_id_key";

-- RenameIndex
ALTER INDEX "user_idea_quarantine_unique" RENAME TO "quarantine_notifications_id_userId_ideaId_key";

-- RenameIndex
ALTER INDEX "user.email_unique" RENAME TO "user_email_key";

-- RenameIndex
ALTER INDEX "user_address.user_id_unique" RENAME TO "user_address_user_id_key";

-- RenameIndex
ALTER INDEX "user_geo.user_id_unique" RENAME TO "user_geo_user_id_key";

-- RenameIndex
ALTER INDEX "user_idea_endorse_unique" RENAME TO "user_idea_endorse_user_id_idea_id_key";

-- RenameIndex
ALTER INDEX "user_idea_follow_unique" RENAME TO "user_idea_follow_user_id_idea_id_key";

-- RenameIndex
ALTER INDEX "user_reach_unique" RENAME TO "user_reach_user_id_segId_key";

-- RenameIndex
ALTER INDEX "user_stripe.userId_unique" RENAME TO "user_stripe_userId_key";

-- RenameIndex
ALTER INDEX "volunteer_unique" RENAME TO "volunteer_proposal_id_author_id_key";
