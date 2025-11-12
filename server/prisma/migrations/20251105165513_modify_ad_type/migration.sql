/*
  Warnings:

  - The values [BASIC,EXTRA] on the enum `ad_type` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ad_type_new" AS ENUM ('COMPLIMENTARY', 'PAID');
ALTER TABLE "advertisement" ALTER COLUMN "advertisement_type" DROP DEFAULT;
ALTER TABLE "advertisement" ALTER COLUMN "advertisement_type" TYPE "ad_type_new" USING ("advertisement_type"::text::"ad_type_new");
ALTER TYPE "ad_type" RENAME TO "ad_type_old";
ALTER TYPE "ad_type_new" RENAME TO "ad_type";
DROP TYPE "ad_type_old";
ALTER TABLE "advertisement" ALTER COLUMN "advertisement_type" SET DEFAULT 'COMPLIMENTARY';
COMMIT;

-- AlterTable
ALTER TABLE "advertisement" ALTER COLUMN "advertisement_type" SET DEFAULT 'COMPLIMENTARY';
