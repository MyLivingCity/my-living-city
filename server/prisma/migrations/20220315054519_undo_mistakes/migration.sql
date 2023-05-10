/*
  Warnings:

  - You are about to drop the column `proposal_id` on the `idea_comment` table. All the data in the column will be lost.
  - You are about to drop the column `proposal_id` on the `idea_rating` table. All the data in the column will be lost.
  - Made the column `idea_id` on table `idea_comment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `idea_id` on table `idea_rating` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "idea_comment" DROP COLUMN "proposal_id",
ALTER COLUMN "idea_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "idea_rating" DROP COLUMN "proposal_id",
ALTER COLUMN "idea_id" SET NOT NULL;
