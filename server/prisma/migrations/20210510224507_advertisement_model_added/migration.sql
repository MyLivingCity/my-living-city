-- CreateEnum
CREATE TYPE "ad_type" AS ENUM ('BASIC', 'EXTRA');

-- CreateTable
CREATE TABLE "advertisement" (
    "id" SERIAL NOT NULL,
    "advertisement_id" INTEGER,
    "owner_id" TEXT,
    "creat_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "advertisement_title" TEXT NOT NULL,
    "advertisement_type" "ad_type" NOT NULL DEFAULT E'BASIC',
    "advertisement_duration" TIMESTAMP(3) NOT NULL,
    "advertisement_position" TEXT NOT NULL,
    "advertisement_image_path" TEXT,
    "advertisement_external_link" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "advertisement" ADD FOREIGN KEY ("owner_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
