/*
  Warnings:

  - You are about to drop the column `is_private` on the `subgroup` table. All the data in the column will be lost.
  - You are about to drop the column `is_virtual` on the `subgroup` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "subgroup" DROP COLUMN "is_private",
DROP COLUMN "is_virtual";
