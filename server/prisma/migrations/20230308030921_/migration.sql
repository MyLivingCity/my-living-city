/*
  Warnings:

  - Made the column `program_completion_date` on table `school_details` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "school_details" ALTER COLUMN "program_completion_date" SET NOT NULL,
ALTER COLUMN "program_completion_date" SET DATA TYPE DATE;
