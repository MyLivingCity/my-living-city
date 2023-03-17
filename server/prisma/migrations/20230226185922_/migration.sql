-- AlterTable
ALTER TABLE "public_community_business_profile" ALTER COLUMN "statement" DROP NOT NULL,
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "address" DROP NOT NULL,
ALTER COLUMN "contact_email" DROP NOT NULL,
ALTER COLUMN "contact_phone" DROP NOT NULL;
