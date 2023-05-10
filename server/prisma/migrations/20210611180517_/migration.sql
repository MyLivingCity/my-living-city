-- CreateTable
CREATE TABLE "segmentRequest" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "segment name" TEXT NOT NULL,
    "sub segment name" TEXT,

    PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "segmentRequest" ADD FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
