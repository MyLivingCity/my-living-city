/*
  Warnings:

  - Made the column `advertisement_image_path` on table `advertisement` required. This step will fail if there are existing NULL values in that column.
  - Made the column `advertisement_external_link` on table `advertisement` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "advertisement" ALTER COLUMN "advertisement_image_path" SET NOT NULL,
ALTER COLUMN "advertisement_external_link" SET NOT NULL;
