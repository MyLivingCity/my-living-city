/*
  Warnings:

  - You are about to drop the column `display_name` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "display_name",
ADD COLUMN     "display_f_name" TEXT,
ADD COLUMN     "display_l_name" TEXT;
