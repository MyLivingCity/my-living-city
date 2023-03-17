/*
  Warnings:

  - You are about to drop the column `display_name` on the `school_details` table. All the data in the column will be lost.
  - You are about to drop the column `display_name` on the `work_details` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "school_details" DROP COLUMN "display_name",
ADD COLUMN     "display_f_name" TEXT,
ADD COLUMN     "display_l_name" TEXT;

-- AlterTable
ALTER TABLE "work_details" DROP COLUMN "display_name",
ADD COLUMN     "display_f_name" TEXT,
ADD COLUMN     "display_l_name" TEXT;
