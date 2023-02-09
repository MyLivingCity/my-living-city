/*
  Warnings:

  - You are about to drop the `Ban_History` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Ban_History" DROP CONSTRAINT "Ban_History_banId_fkey";

-- DropTable
DROP TABLE "Ban_History";

-- CreateTable
CREATE TABLE "ban_history" (
    "id" SERIAL NOT NULL,
    "banId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "BanType" NOT NULL,
    "reason" TEXT NOT NULL,
    "ideaId" INTEGER,
    "commentId" INTEGER,
    "modId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ban_history" ADD FOREIGN KEY ("banId") REFERENCES "ban_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
