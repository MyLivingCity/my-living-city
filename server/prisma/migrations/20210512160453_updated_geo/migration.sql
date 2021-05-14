-- AlterTable
ALTER TABLE "user_geo" ADD COLUMN     "work_lat" DECIMAL(65,30),
ADD COLUMN     "work_lon" DECIMAL(65,30),
ADD COLUMN     "school_lat" DECIMAL(65,30),
ADD COLUMN     "school_lon" DECIMAL(65,30);
