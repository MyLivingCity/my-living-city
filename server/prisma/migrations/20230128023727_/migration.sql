-- CreateEnum
CREATE TYPE "BanType" AS ENUM ('IDEA', 'COMMENT', 'USER');

-- CreateTable
CREATE TABLE "Ban_History" (
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
ALTER TABLE "Ban_History" ADD FOREIGN KEY ("banId") REFERENCES "ban_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
