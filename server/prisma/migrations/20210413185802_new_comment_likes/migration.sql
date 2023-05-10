/*
  Warnings:

  - You are about to drop the `idea_comment_like` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "idea_comment_like" DROP CONSTRAINT "idea_comment_like_author_id_fkey";

-- DropForeignKey
ALTER TABLE "idea_comment_like" DROP CONSTRAINT "idea_comment_like_idea_comment_id_fkey";

-- DropTable
DROP TABLE "idea_comment_like";

-- CreateTable
CREATE TABLE "user_comment_likes" (
    "id" SERIAL NOT NULL,
    "idea_comment_id" INTEGER,
    "author_id" TEXT,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_comment_dislikes" (
    "id" SERIAL NOT NULL,
    "idea_comment_id" INTEGER,
    "author_id" TEXT,

    PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "user_comment_likes" ADD FOREIGN KEY ("idea_comment_id") REFERENCES "idea_comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_comment_likes" ADD FOREIGN KEY ("author_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_comment_dislikes" ADD FOREIGN KEY ("idea_comment_id") REFERENCES "idea_comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_comment_dislikes" ADD FOREIGN KEY ("author_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
