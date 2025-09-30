-- AlterTable
ALTER TABLE "_IdeaToSegments" ADD CONSTRAINT "_IdeaToSegments_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_IdeaToSegments_AB_unique";
