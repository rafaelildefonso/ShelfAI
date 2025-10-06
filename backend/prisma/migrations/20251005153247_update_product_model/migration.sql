/*
  Warnings:

  - Made the column `description` on table `Product` required. This step will fail if there are existing NULL values in that column.
  - Made the column `price` on table `Product` required. This step will fail if there are existing NULL values in that column.
  - Made the column `categoryId` on table `Product` required. This step will fail if there are existing NULL values in that column.
  - Made the column `sku` on table `Product` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."Product" DROP CONSTRAINT "Product_categoryId_fkey";

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "color" TEXT,
ADD COLUMN     "costPrice" DOUBLE PRECISION,
ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "image" TEXT,
ADD COLUMN     "images" TEXT[],
ADD COLUMN     "internalNotes" TEXT,
ADD COLUMN     "lastEditedBy" TEXT,
ADD COLUMN     "marketplaceIntegrations" JSONB,
ADD COLUMN     "material" TEXT,
ADD COLUMN     "minStock" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "model" TEXT,
ADD COLUMN     "origin" TEXT,
ADD COLUMN     "rating" DOUBLE PRECISION,
ADD COLUMN     "reviewCount" INTEGER DEFAULT 0,
ADD COLUMN     "sales" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "size" TEXT,
ADD COLUMN     "stock" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "stockLocation" TEXT,
ADD COLUMN     "views" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "price" SET NOT NULL,
ALTER COLUMN "categoryId" SET NOT NULL,
ALTER COLUMN "sku" SET NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'incomplete';

-- CreateIndex
CREATE INDEX "Product_sku_idx" ON "Product"("sku");

-- CreateIndex
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");

-- CreateIndex
CREATE INDEX "Product_status_idx" ON "Product"("status");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
