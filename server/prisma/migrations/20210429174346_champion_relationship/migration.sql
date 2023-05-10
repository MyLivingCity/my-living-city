-- AlterTable
ALTER TABLE "idea" ADD COLUMN     "champion_id" TEXT;

-- AddForeignKey
ALTER TABLE "idea" ADD FOREIGN KEY ("champion_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

