-- CreateEnum
CREATE TYPE "public"."RealEstateLeadStatus" AS ENUM ('NEW', 'CONTACTED', 'MEETING', 'OFFER', 'DEAL');

-- CreateEnum
CREATE TYPE "public"."LeadStage" AS ENUM ('NEW', 'CONTACTED', 'MEETING', 'OFFER', 'DEAL');

-- CreateEnum
CREATE TYPE "public"."PropertyStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."PropertyType" AS ENUM ('APARTMENT', 'HOUSE', 'DUPLEX', 'PENTHOUSE', 'COTTAGE', 'LOT', 'OFFICE', 'STORE', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."PropertyProvider" AS ENUM ('MANUAL', 'YAD2', 'MADLAN');

-- CreateEnum
CREATE TYPE "public"."SyncStatus" AS ENUM ('IDLE', 'PENDING', 'SUCCESS', 'ERROR');

-- CreateTable
CREATE TABLE "public"."Lead" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "phoneNorm" TEXT,
    "interest" TEXT,
    "budget" INTEGER,
    "source" TEXT NOT NULL DEFAULT 'website',
    "utm" JSONB,
    "consent" BOOLEAN NOT NULL DEFAULT true,
    "score" INTEGER NOT NULL DEFAULT 0,
    "bucket" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "ownerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Client" (
    "id" TEXT NOT NULL,
    "ownerUid" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "budgetMin" DECIMAL(12,2),
    "budgetMax" DECIMAL(12,2),
    "preferredCity" TEXT,
    "stage" "public"."LeadStage" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LeadEvent" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB,
    "ts" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeadEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Owner" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "bucket" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Owner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Property" (
    "id" TEXT NOT NULL,
    "ownerUid" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT,
    "neighborhood" TEXT,
    "description" TEXT,
    "type" "public"."PropertyType",
    "status" "public"."PropertyStatus" NOT NULL DEFAULT 'DRAFT',
    "bedrooms" INTEGER,
    "bathrooms" INTEGER,
    "sizeSqm" INTEGER,
    "floor" INTEGER,
    "totalFloors" INTEGER,
    "price" DECIMAL(12,2),
    "yearBuilt" INTEGER,
    "amenities" TEXT,
    "coverImageUrl" TEXT,
    "agentName" TEXT NOT NULL,
    "agentPhone" TEXT,
    "agentEmail" TEXT,
    "agentLogoUrl" TEXT,
    "aiLandingHtml" TEXT,
    "aiLandingCss" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "provider" "public"."PropertyProvider" NOT NULL DEFAULT 'MANUAL',
    "externalId" TEXT,
    "externalUserId" TEXT,
    "syncStatus" "public"."SyncStatus" NOT NULL DEFAULT 'IDLE',
    "lastSyncedAt" TIMESTAMP(3),
    "rawExternalJson" JSONB,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PropertyPhoto" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PropertyPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RealEstateLead" (
    "id" TEXT NOT NULL,
    "ownerUid" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "propertyType" TEXT,
    "city" TEXT,
    "budgetMin" DECIMAL(12,2),
    "budgetMax" DECIMAL(12,2),
    "source" TEXT,
    "status" "public"."RealEstateLeadStatus" NOT NULL DEFAULT 'NEW',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "propertyId" TEXT,

    CONSTRAINT "RealEstateLead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Lead_email_key" ON "public"."Lead"("email");

-- CreateIndex
CREATE INDEX "Lead_phoneNorm_idx" ON "public"."Lead"("phoneNorm");

-- CreateIndex
CREATE INDEX "Lead_ownerId_status_idx" ON "public"."Lead"("ownerId", "status");

-- CreateIndex
CREATE INDEX "Client_ownerUid_stage_idx" ON "public"."Client"("ownerUid", "stage");

-- CreateIndex
CREATE INDEX "LeadEvent_leadId_ts_idx" ON "public"."LeadEvent"("leadId", "ts");

-- CreateIndex
CREATE UNIQUE INDEX "Property_slug_key" ON "public"."Property"("slug");

-- CreateIndex
CREATE INDEX "Property_ownerUid_status_idx" ON "public"."Property"("ownerUid", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Property_provider_externalId_key" ON "public"."Property"("provider", "externalId");

-- CreateIndex
CREATE INDEX "PropertyPhoto_propertyId_order_idx" ON "public"."PropertyPhoto"("propertyId", "order");

-- CreateIndex
CREATE INDEX "RealEstateLead_ownerUid_status_idx" ON "public"."RealEstateLead"("ownerUid", "status");

-- AddForeignKey
ALTER TABLE "public"."LeadEvent" ADD CONSTRAINT "LeadEvent_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "public"."Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PropertyPhoto" ADD CONSTRAINT "PropertyPhoto_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "public"."Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RealEstateLead" ADD CONSTRAINT "RealEstateLead_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "public"."Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;
