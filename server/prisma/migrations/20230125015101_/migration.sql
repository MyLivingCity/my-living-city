-- CreateTable
CREATE TABLE "quarantine_notifications" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "ideaId" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_idea_quarantine_unique" ON "quarantine_notifications"("userId", "ideaId");

-- AddForeignKey
ALTER TABLE "quarantine_notifications" ADD FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quarantine_notifications" ADD FOREIGN KEY ("ideaId") REFERENCES "idea"("id") ON DELETE CASCADE ON UPDATE CASCADE;
