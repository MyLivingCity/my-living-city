/*
  Warnings:

  - You are about to drop the column `testString` on the `proposal` table. All the data in the column will be lost.
  - You are about to drop the `_collaborator` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_donor` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_feedback` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_other` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_suggestion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_volunteer` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_collaborator" DROP CONSTRAINT "_collaborator_A_fkey";

-- DropForeignKey
ALTER TABLE "_collaborator" DROP CONSTRAINT "_collaborator_B_fkey";

-- DropForeignKey
ALTER TABLE "_donor" DROP CONSTRAINT "_donor_A_fkey";

-- DropForeignKey
ALTER TABLE "_donor" DROP CONSTRAINT "_donor_B_fkey";

-- DropForeignKey
ALTER TABLE "_feedback" DROP CONSTRAINT "_feedback_A_fkey";

-- DropForeignKey
ALTER TABLE "_feedback" DROP CONSTRAINT "_feedback_B_fkey";

-- DropForeignKey
ALTER TABLE "_other" DROP CONSTRAINT "_other_A_fkey";

-- DropForeignKey
ALTER TABLE "_other" DROP CONSTRAINT "_other_B_fkey";

-- DropForeignKey
ALTER TABLE "_suggestion" DROP CONSTRAINT "_suggestion_A_fkey";

-- DropForeignKey
ALTER TABLE "_suggestion" DROP CONSTRAINT "_suggestion_B_fkey";

-- DropForeignKey
ALTER TABLE "_volunteer" DROP CONSTRAINT "_volunteer_A_fkey";

-- DropForeignKey
ALTER TABLE "_volunteer" DROP CONSTRAINT "_volunteer_B_fkey";

-- AlterTable
ALTER TABLE "idea" ADD COLUMN     "supporting_proposal_id" INTEGER;

-- AlterTable
ALTER TABLE "proposal" DROP COLUMN "testString",
ADD COLUMN     "feedback_1" TEXT,
ADD COLUMN     "feedback_2" TEXT,
ADD COLUMN     "feedback_3" TEXT,
ADD COLUMN     "feedback_4" TEXT,
ADD COLUMN     "feedback_5" TEXT,
ADD COLUMN     "needCollaborators" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "needDonations" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "needFeedback" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "needSuggestions" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "needVolunteers" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "_collaborator";

-- DropTable
DROP TABLE "_donor";

-- DropTable
DROP TABLE "_feedback";

-- DropTable
DROP TABLE "_other";

-- DropTable
DROP TABLE "_suggestion";

-- DropTable
DROP TABLE "_volunteer";

-- CreateTable
CREATE TABLE "collaborator" (
    "id" SERIAL NOT NULL,
    "proposal_id" INTEGER NOT NULL,
    "author_id" TEXT NOT NULL,
    "experience" TEXT DEFAULT E'No experience',
    "role" TEXT DEFAULT E'No role',
    "time" TEXT DEFAULT E'No time',
    "contactInfo" TEXT DEFAULT E'No contact info',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "volunteer" (
    "id" SERIAL NOT NULL,
    "proposal_id" INTEGER NOT NULL,
    "author_id" TEXT NOT NULL,
    "experience" TEXT DEFAULT E'No experience',
    "task" TEXT DEFAULT E'No task',
    "time" TEXT DEFAULT E'No time',
    "contactInfo" TEXT DEFAULT E'No contact info',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "donors" (
    "id" SERIAL NOT NULL,
    "proposal_id" INTEGER NOT NULL,
    "author_id" TEXT NOT NULL,
    "donations" TEXT DEFAULT E'No donations',
    "contactInfo" TEXT DEFAULT E'No contact info',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "collaborator" ADD FOREIGN KEY ("proposal_id") REFERENCES "proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collaborator" ADD FOREIGN KEY ("author_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "volunteer" ADD FOREIGN KEY ("proposal_id") REFERENCES "proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "volunteer" ADD FOREIGN KEY ("author_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donors" ADD FOREIGN KEY ("proposal_id") REFERENCES "proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donors" ADD FOREIGN KEY ("author_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "idea" ADD FOREIGN KEY ("supporting_proposal_id") REFERENCES "proposal"("id") ON DELETE SET NULL ON UPDATE CASCADE;
