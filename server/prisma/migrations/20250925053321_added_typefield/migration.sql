-- CreateEnum
CREATE TYPE "TypeField" AS ENUM ('VIRTUAL', 'NESTED');

-- AlterTable
ALTER TABLE "subgroup" ADD COLUMN     "type_field" "TypeField" NOT NULL DEFAULT 'VIRTUAL';
