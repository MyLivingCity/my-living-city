-- CreateEnum
CREATE TYPE "LinkType" AS ENUM ('WEBSITE', 'TWITTER', 'FACEBOOK', 'INSTAGRAM', 'LINKEDIN', 'YOUTUBE', 'TIKTOK', 'OTHER');

-- CreateTable
CREATE TABLE "link" (
    "id" SERIAL NOT NULL,
    "link" TEXT NOT NULL,
    "linkType" "LinkType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "public_Community_Business_ProfileId" INTEGER,
    "public_Municipal_ProfileId" INTEGER,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public_community_business_profile" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "statement" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "contactInformation" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public_municipal_profile" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "statement" TEXT NOT NULL,
    "responsibility" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "contactInformation" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "link" ADD FOREIGN KEY ("public_Community_Business_ProfileId") REFERENCES "public_community_business_profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "link" ADD FOREIGN KEY ("public_Municipal_ProfileId") REFERENCES "public_municipal_profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public_community_business_profile" ADD FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public_municipal_profile" ADD FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
