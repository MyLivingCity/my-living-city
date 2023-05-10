/*
  Warnings:

  - You are about to drop the column `advertisement_id` on the `advertisement` table. All the data in the column will be lost.
  - Made the column `owner_id` on table `advertisement` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "advertisement" DROP COLUMN "advertisement_id",
ALTER COLUMN "owner_id" SET NOT NULL;
