/*
  Warnings:

  - You are about to drop the column `createdBy` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `lastEditedBy` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "createdBy",
DROP COLUMN "lastEditedBy",
ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "lastEditedById" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "company" TEXT,
ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "department" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "language" TEXT NOT NULL DEFAULT 'pt-BR',
ADD COLUMN     "lastLogin" TIMESTAMP(3),
ADD COLUMN     "location" TEXT,
ADD COLUMN     "loginCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "position" TEXT,
ADD COLUMN     "preferences" JSONB,
ADD COLUMN     "settings" JSONB,
ADD COLUMN     "timezone" TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
ADD COLUMN     "updatedBy" TEXT;

-- CreateIndex
CREATE INDEX "Product_createdById_idx" ON "Product"("createdById");

-- CreateIndex
CREATE INDEX "Product_lastEditedById_idx" ON "Product"("lastEditedById");

-- CreateIndex
CREATE INDEX "User_phone_idx" ON "User"("phone");

-- CreateIndex
CREATE INDEX "User_company_idx" ON "User"("company");

-- CreateIndex
CREATE INDEX "User_isActive_idx" ON "User"("isActive");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_lastEditedById_fkey" FOREIGN KEY ("lastEditedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
