/*
  Warnings:

  - You are about to drop the column `idea_id` on the `proposal` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[proposal_id]` on the table `idea_address` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[proposal_id]` on the table `idea_geo` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `author_id` to the `proposal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category_id` to the `proposal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `super_segment_id` to the `proposal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `proposal` table without a default value. This is not possible if the table is not empty.
  - Made the column `description` on table `proposal` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "proposal" DROP CONSTRAINT "proposal_idea_id_fkey";

-- DropIndex
DROP INDEX "proposal_idea_id_unique";

-- AlterTable
ALTER TABLE "idea_address" ADD COLUMN     "proposal_id" INTEGER,
ALTER COLUMN "idea_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "idea_comment" ADD COLUMN     "proposal_id" INTEGER,
ALTER COLUMN "idea_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "idea_geo" ADD COLUMN     "proposal_id" INTEGER,
ALTER COLUMN "idea_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "idea_rating" ADD COLUMN     "proposal_id" INTEGER,
ALTER COLUMN "idea_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "proposal" DROP COLUMN "idea_id",
ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "arts_impact" TEXT,
ADD COLUMN     "author_id" TEXT NOT NULL,
ADD COLUMN     "category_id" INTEGER NOT NULL,
ADD COLUMN     "champion_id" TEXT,
ADD COLUMN     "community_impact" TEXT,
ADD COLUMN     "energy_impact" TEXT,
ADD COLUMN     "image_path" TEXT,
ADD COLUMN     "manufacturing_impact" TEXT,
ADD COLUMN     "nature_impact" TEXT,
ADD COLUMN     "segment_id" INTEGER,
ADD COLUMN     "state" "idea_state" NOT NULL DEFAULT E'PROPOSAL',
ADD COLUMN     "sub_segment_id" INTEGER,
ADD COLUMN     "super_segment_id" INTEGER NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "userType" TEXT NOT NULL DEFAULT E'Resident',
ALTER COLUMN "description" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "idea_address_proposal_id_unique" ON "idea_address"("proposal_id");

-- CreateIndex
CREATE UNIQUE INDEX "idea_geo_proposal_id_unique" ON "idea_geo"("proposal_id");

-- AddForeignKey
ALTER TABLE "idea_geo" ADD FOREIGN KEY ("proposal_id") REFERENCES "proposal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "idea_address" ADD FOREIGN KEY ("proposal_id") REFERENCES "proposal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposal" ADD FOREIGN KEY ("author_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposal" ADD FOREIGN KEY ("champion_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposal" ADD FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposal" ADD FOREIGN KEY ("super_segment_id") REFERENCES "super_segment"("super_seg_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposal" ADD FOREIGN KEY ("segment_id") REFERENCES "segment"("seg_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposal" ADD FOREIGN KEY ("sub_segment_id") REFERENCES "sub_segment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "idea_rating" ADD FOREIGN KEY ("proposal_id") REFERENCES "proposal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "idea_comment" ADD FOREIGN KEY ("proposal_id") REFERENCES "proposal"("id") ON DELETE SET NULL ON UPDATE CASCADE;
