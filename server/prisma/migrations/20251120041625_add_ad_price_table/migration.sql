-- CreateTable
CREATE TABLE "AdPrice" (
    "id" SERIAL NOT NULL,
    "length_weeks" INTEGER NOT NULL,
    "price_cad_dollars" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "AdPrice_pkey" PRIMARY KEY ("id")
);
