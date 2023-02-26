/*
  Warnings:

  - You are about to drop the column `contactInformation` on the `public_municipal_profile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public_municipal_profile" DROP COLUMN "contactInformation",
ADD COLUMN     "contact_email" TEXT,
ADD COLUMN     "contact_phone" TEXT;
