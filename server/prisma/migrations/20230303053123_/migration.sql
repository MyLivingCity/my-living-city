-- CreateTable
CREATE TABLE "FeedbackRating" (
    "id" SERIAL NOT NULL,
    "proposal_id" INTEGER NOT NULL,
    "author_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 0,
    "rating_explaination" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FeedbackRating" ADD FOREIGN KEY ("author_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedbackRating" ADD FOREIGN KEY ("proposal_id") REFERENCES "proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
