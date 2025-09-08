/*
  Warnings:

  - You are about to drop the column `agentEmail` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `agentLogoUrl` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `aiLandingCss` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `aiLandingHtml` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `amenities` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `areaSqm` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `bathrooms` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `bedrooms` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `coverImageUrl` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `externalId` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `externalUserId` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `floor` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `lastSyncedAt` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `neighborhood` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `provider` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `publishedAt` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `rawExternalJson` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `seoDescription` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `seoTitle` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `sizeSqm` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `syncStatus` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `totalFloors` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `yearBuilt` on the `Property` table. All the data in the column will be lost.
  - You are about to alter the column `price` on the `Property` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `Integer`.
  - You are about to drop the column `alt` on the `PropertyPhoto` table. All the data in the column will be lost.
  - You are about to drop the column `order` on the `PropertyPhoto` table. All the data in the column will be lost.
  - You are about to drop the column `budgetMax` on the `RealEstateLead` table. All the data in the column will be lost.
  - You are about to drop the column `budgetMin` on the `RealEstateLead` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `RealEstateLead` table. All the data in the column will be lost.
  - You are about to drop the column `clientName` on the `RealEstateLead` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `RealEstateLead` table. All the data in the column will be lost.
  - You are about to drop the column `propertyType` on the `RealEstateLead` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `RealEstateLead` table. All the data in the column will be lost.
  - You are about to drop the `Lead` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LeadEvent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Owner` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `name` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `PropertyPhoto` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."CampaignStatus" AS ENUM ('DRAFT', 'READY', 'SCHEDULED', 'ACTIVE', 'PAUSED', 'ARCHIVED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."LeadStage" ADD VALUE 'QUALIFIED';
ALTER TYPE "public"."LeadStage" ADD VALUE 'WON';
ALTER TYPE "public"."LeadStage" ADD VALUE 'LOST';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."PropertyProvider" ADD VALUE 'AIRBNB';
ALTER TYPE "public"."PropertyProvider" ADD VALUE 'BOOKING';
ALTER TYPE "public"."PropertyProvider" ADD VALUE 'GUESTY';
ALTER TYPE "public"."PropertyProvider" ADD VALUE 'ZILLOW';
ALTER TYPE "public"."PropertyProvider" ADD VALUE 'OTHER';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."PropertyType" ADD VALUE 'VILLA';
ALTER TYPE "public"."PropertyType" ADD VALUE 'COMMERCIAL';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."RealEstateLeadStatus" ADD VALUE 'IN_PROGRESS';
ALTER TYPE "public"."RealEstateLeadStatus" ADD VALUE 'CONVERTED';
ALTER TYPE "public"."RealEstateLeadStatus" ADD VALUE 'DISQUALIFIED';

-- AlterEnum
ALTER TYPE "public"."SyncStatus" ADD VALUE 'SYNCING';

-- DropForeignKey
ALTER TABLE "public"."LeadEvent" DROP CONSTRAINT "LeadEvent_leadId_fkey";

-- DropIndex
DROP INDEX "public"."Property_provider_externalId_key";

-- DropIndex
DROP INDEX "public"."PropertyPhoto_propertyId_order_idx";

-- DropIndex
DROP INDEX "public"."RealEstateLead_ownerUid_status_idx";

-- AlterTable
ALTER TABLE "public"."Property" DROP COLUMN "agentEmail",
DROP COLUMN "agentLogoUrl",
DROP COLUMN "aiLandingCss",
DROP COLUMN "aiLandingHtml",
DROP COLUMN "amenities",
DROP COLUMN "areaSqm",
DROP COLUMN "bathrooms",
DROP COLUMN "bedrooms",
DROP COLUMN "coverImageUrl",
DROP COLUMN "description",
DROP COLUMN "externalId",
DROP COLUMN "externalUserId",
DROP COLUMN "floor",
DROP COLUMN "lastSyncedAt",
DROP COLUMN "neighborhood",
DROP COLUMN "provider",
DROP COLUMN "publishedAt",
DROP COLUMN "rawExternalJson",
DROP COLUMN "seoDescription",
DROP COLUMN "seoTitle",
DROP COLUMN "sizeSqm",
DROP COLUMN "syncStatus",
DROP COLUMN "title",
DROP COLUMN "totalFloors",
DROP COLUMN "yearBuilt",
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "photosJson" JSONB,
ADD COLUMN     "rooms" INTEGER,
ADD COLUMN     "size" INTEGER,
ALTER COLUMN "slug" DROP NOT NULL,
ALTER COLUMN "address" DROP NOT NULL,
ALTER COLUMN "price" SET DATA TYPE INTEGER,
ALTER COLUMN "agentName" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."PropertyPhoto" DROP COLUMN "alt",
DROP COLUMN "order",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."RealEstateLead" DROP COLUMN "budgetMax",
DROP COLUMN "budgetMin",
DROP COLUMN "city",
DROP COLUMN "clientName",
DROP COLUMN "notes",
DROP COLUMN "propertyType",
DROP COLUMN "status",
ADD COLUMN     "fullName" TEXT,
ADD COLUMN     "message" TEXT;

-- DropTable
DROP TABLE "public"."Lead";

-- DropTable
DROP TABLE "public"."LeadEvent";

-- DropTable
DROP TABLE "public"."Owner";

-- CreateTable
CREATE TABLE "public"."Campaign" (
    "id" TEXT NOT NULL,
    "ownerUid" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "copy" TEXT NOT NULL,
    "image" TEXT,
    "audience" JSONB,
    "platform" TEXT,
    "status" "public"."CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Campaign_ownerUid_status_idx" ON "public"."Campaign"("ownerUid", "status");

-- CreateIndex
CREATE INDEX "PropertyPhoto_propertyId_idx" ON "public"."PropertyPhoto"("propertyId");

-- CreateIndex
CREATE INDEX "RealEstateLead_ownerUid_idx" ON "public"."RealEstateLead"("ownerUid");

-- CreateIndex
CREATE INDEX "RealEstateLead_propertyId_idx" ON "public"."RealEstateLead"("propertyId");
