-- CreateTable
CREATE TABLE "Customer" (
    "id" INTEGER NOT NULL,
    "Phone_no" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "cname" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_id_key" ON "Customer"("id");
