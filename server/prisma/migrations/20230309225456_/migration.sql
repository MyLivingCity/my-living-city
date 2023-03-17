/*
  Warnings:

  - Added the required column `feedback_id` to the `FeedbackRating` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FeedbackRating" ADD COLUMN     "feedback_id" INTEGER NOT NULL;
