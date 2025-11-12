-- CreateEnum
CREATE TYPE "MembershipStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PrivacyField" AS ENUM ('PUBLIC', 'PRIVATE', 'TEST');

-- CreateTable
CREATE TABLE "subgroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_virtual" BOOLEAN NOT NULL,
    "is_private" BOOLEAN NOT NULL,
    "privacy_field" "PrivacyField" NOT NULL DEFAULT 'PRIVATE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "region_id" INTEGER NOT NULL,
    "segment_id" INTEGER,
    "sub_segment_id" INTEGER,
    "manager_id" TEXT NOT NULL,

    CONSTRAINT "subgroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subgroup_member" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "sub_group_id" TEXT NOT NULL,
    "status" "MembershipStatus" NOT NULL DEFAULT 'PENDING',
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subgroup_member_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subgroup_member_user_id_sub_group_id_key" ON "subgroup_member"("user_id", "sub_group_id");

-- AddForeignKey
ALTER TABLE "subgroup" ADD CONSTRAINT "subgroup_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subgroup" ADD CONSTRAINT "subgroup_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "segment"("seg_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subgroup" ADD CONSTRAINT "subgroup_segment_id_fkey" FOREIGN KEY ("segment_id") REFERENCES "segment"("seg_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subgroup" ADD CONSTRAINT "subgroup_sub_segment_id_fkey" FOREIGN KEY ("sub_segment_id") REFERENCES "segment"("seg_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subgroup_member" ADD CONSTRAINT "subgroup_member_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subgroup_member" ADD CONSTRAINT "subgroup_member_sub_group_id_fkey" FOREIGN KEY ("sub_group_id") REFERENCES "subgroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
