-- CreateTable
CREATE TABLE "user_idea_endorse" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "idea_id" INTEGER NOT NULL,
    "endorsed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_idea_endorse_unique" ON "user_idea_endorse"("user_id", "idea_id");

-- AddForeignKey
ALTER TABLE "user_idea_endorse" ADD FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_idea_endorse" ADD FOREIGN KEY ("idea_id") REFERENCES "idea"("id") ON DELETE CASCADE ON UPDATE CASCADE;
