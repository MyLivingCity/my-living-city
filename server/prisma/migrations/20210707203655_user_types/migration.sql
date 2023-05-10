/*
  Warnings:

  - The values [USER] on the enum `user_type` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `user_role_id` on the `user` table. All the data in the column will be lost.
  - You are about to drop the `UserRole` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "user_type_new" AS ENUM ('ADMIN', 'MOD', 'SEG_ADMIN', 'SEG_MOD', 'MUNICIPAL_SEG_ADMIN', 'BUSINESS', 'RESIDENTIAL', 'MUNICIPAL', 'WORKER', 'ASSOCIATE', 'DEVELOPER');
ALTER TABLE "user" ALTER COLUMN "user_type" DROP DEFAULT;
ALTER TABLE "user" ALTER COLUMN "user_type" TYPE "user_type_new" USING ("user_type"::text::"user_type_new");
ALTER TYPE "user_type" RENAME TO "user_type_old";
ALTER TYPE "user_type_new" RENAME TO "user_type";
DROP TYPE "user_type_old";
ALTER TABLE "user" ALTER COLUMN "user_type" SET DEFAULT 'RESIDENTIAL';
COMMIT;

-- DropForeignKey
ALTER TABLE "user" DROP CONSTRAINT "user_user_role_id_fkey";

-- AlterTable
ALTER TABLE "user" DROP COLUMN "user_role_id",
ADD COLUMN     "banned" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "user_type" SET DEFAULT E'RESIDENTIAL';

-- DropTable
DROP TABLE "UserRole";
