-- CreateTable
CREATE TABLE "false_flagging_behavior" (
    "id" SERIAL NOT NULL,
    "flag_count" INTEGER NOT NULL DEFAULT 0,
    "flag_ban" BOOLEAN NOT NULL DEFAULT false,
    "user_id" TEXT NOT NULL,
    "banned_at" TIMESTAMP(3),
    "banned_until" TIMESTAMP(3),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bad_posting_behavior" (
    "id" SERIAL NOT NULL,
    "bad_post_count" INTEGER NOT NULL DEFAULT 0,
    "post_flag_count" INTEGER NOT NULL DEFAULT 0,
    "post_comment_ban" BOOLEAN NOT NULL DEFAULT false,
    "banned_at" TIMESTAMP(3),
    "banned_until" TIMESTAMP(3),
    "user_id" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "false_flagging_behavior" ADD FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bad_posting_behavior" ADD FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
