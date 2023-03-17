/*
  Warnings:

  - You are about to drop the column `contactInformation` on the `public_community_business_profile` table. All the data in the column will be lost.
  - Added the required column `contact_email` to the `public_community_business_profile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contact_phone` to the `public_community_business_profile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public_community_business_profile" DROP COLUMN "contactInformation",
ADD COLUMN     "contact_email" TEXT NOT NULL,
ADD COLUMN     "contact_phone" TEXT NOT NULL;
