/*
  Warnings:

  - You are about to drop the column `proposal_id` on the `idea_address` table. All the data in the column will be lost.
  - You are about to drop the column `proposal_id` on the `idea_comment` table. All the data in the column will be lost.
  - You are about to drop the column `proposal_id` on the `idea_geo` table. All the data in the column will be lost.
  - You are about to drop the column `proposal_id` on the `idea_rating` table. All the data in the column will be lost.
  - You are about to drop the column `active` on the `proposal` table. All the data in the column will be lost.
  - You are about to drop the column `arts_impact` on the `proposal` table. All the data in the column will be lost.
  - You are about to drop the column `author_id` on the `proposal` table. All the data in the column will be lost.
  - You are about to drop the column `category_id` on the `proposal` table. All the data in the column will be lost.
  - You are about to drop the column `champion_id` on the `proposal` table. All the data in the column will be lost.
  - You are about to drop the column `community_impact` on the `proposal` table. All the data in the column will be lost.
  - You are about to drop the column `energy_impact` on the `proposal` table. All the data in the column will be lost.
  - You are about to drop the column `image_path` on the `proposal` table. All the data in the column will be lost.
  - You are about to drop the column `manufacturing_impact` on the `proposal` table. All the data in the column will be lost.
  - You are about to drop the column `nature_impact` on the `proposal` table. All the data in the column will be lost.
  - You are about to drop the column `segment_id` on the `proposal` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `proposal` table. All the data in the column will be lost.
  - You are about to drop the column `sub_segment_id` on the `proposal` table. All the data in the column will be lost.
  - You are about to drop the column `super_segment_id` on the `proposal` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `proposal` table. All the data in the column will be lost.
  - You are about to drop the column `userType` on the `proposal` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[idea_id]` on the table `proposal` will be added. If there are existing duplicate values, this will fail.
  - Made the column `idea_id` on table `idea_address` required. This step will fail if there are existing NULL values in that column.
  - Made the column `idea_id` on table `idea_comment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `idea_id` on table `idea_geo` required. This step will fail if there are existing NULL values in that column.
  - Made the column `idea_id` on table `idea_rating` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `idea_id` to the `proposal` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "idea_address" DROP CONSTRAINT "idea_address_proposal_id_fkey";

-- DropForeignKey
ALTER TABLE "idea_comment" DROP CONSTRAINT "idea_comment_proposal_id_fkey";

-- DropForeignKey
ALTER TABLE "idea_geo" DROP CONSTRAINT "idea_geo_proposal_id_fkey";

-- DropForeignKey
ALTER TABLE "idea_rating" DROP CONSTRAINT "idea_rating_proposal_id_fkey";

-- DropForeignKey
ALTER TABLE "proposal" DROP CONSTRAINT "proposal_author_id_fkey";

-- DropForeignKey
ALTER TABLE "proposal" DROP CONSTRAINT "proposal_category_id_fkey";

-- DropForeignKey
ALTER TABLE "proposal" DROP CONSTRAINT "proposal_champion_id_fkey";

-- DropForeignKey
ALTER TABLE "proposal" DROP CONSTRAINT "proposal_segment_id_fkey";

-- DropForeignKey
ALTER TABLE "proposal" DROP CONSTRAINT "proposal_sub_segment_id_fkey";

-- DropForeignKey
ALTER TABLE "proposal" DROP CONSTRAINT "proposal_super_segment_id_fkey";

-- DropIndex
DROP INDEX "idea_address_proposal_id_unique";

-- DropIndex
DROP INDEX "idea_geo_proposal_id_unique";

-- AlterTable
ALTER TABLE "idea_address" DROP COLUMN "proposal_id",
ALTER COLUMN "idea_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "idea_comment" DROP COLUMN "proposal_id",
ALTER COLUMN "idea_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "idea_geo" DROP COLUMN "proposal_id",
ALTER COLUMN "idea_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "idea_rating" DROP COLUMN "proposal_id",
ALTER COLUMN "idea_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "proposal" DROP COLUMN "active",
DROP COLUMN "arts_impact",
DROP COLUMN "author_id",
DROP COLUMN "category_id",
DROP COLUMN "champion_id",
DROP COLUMN "community_impact",
DROP COLUMN "energy_impact",
DROP COLUMN "image_path",
DROP COLUMN "manufacturing_impact",
DROP COLUMN "nature_impact",
DROP COLUMN "segment_id",
DROP COLUMN "state",
DROP COLUMN "sub_segment_id",
DROP COLUMN "super_segment_id",
DROP COLUMN "title",
DROP COLUMN "userType",
ADD COLUMN     "idea_id" INTEGER NOT NULL,
ALTER COLUMN "description" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "proposal_idea_id_unique" ON "proposal"("idea_id");

-- AddForeignKey
ALTER TABLE "proposal" ADD FOREIGN KEY ("idea_id") REFERENCES "idea"("id") ON DELETE CASCADE ON UPDATE CASCADE;
