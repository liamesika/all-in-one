-- CreateEnum
CREATE TYPE "public"."LeadScore" AS ENUM ('HOT', 'WARM', 'COLD');

-- CreateEnum
CREATE TYPE "public"."LeadSource" AS ENUM ('FACEBOOK', 'INSTAGRAM', 'WHATSAPP', 'CSV_UPLOAD', 'GOOGLE_SHEETS', 'MANUAL', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."FieldValidationStatus" AS ENUM ('VALID', 'INVALID', 'PENDING');

-- CreateTable
CREATE TABLE "public"."EcommerceLead" (
    "id" TEXT NOT NULL,
    "ownerUid" TEXT NOT NULL,
    "externalId" TEXT,
    "fullName" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "city" TEXT,
    "address" TEXT,
    "status" "public"."LeadStage" NOT NULL DEFAULT 'NEW',
    "score" "public"."LeadScore" NOT NULL DEFAULT 'COLD',
    "source" "public"."LeadSource" NOT NULL DEFAULT 'MANUAL',
    "sourceName" TEXT,
    "assigneeId" TEXT,
    "budget" DECIMAL(12,2),
    "interests" JSONB,
    "notes" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "utmTerm" TEXT,
    "utmContent" TEXT,
    "phoneValid" "public"."FieldValidationStatus" NOT NULL DEFAULT 'PENDING',
    "emailValid" "public"."FieldValidationStatus" NOT NULL DEFAULT 'PENDING',
    "firstContactAt" TIMESTAMP(3),
    "lastContactAt" TIMESTAMP(3),
    "duplicateOfId" TEXT,
    "isDuplicate" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EcommerceLead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LeadEvent" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "data" JSONB,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeadEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LeadActivity" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "subject" TEXT,
    "content" TEXT,
    "direction" TEXT,
    "userId" TEXT,
    "scheduledAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeadActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LeadImportBatch" (
    "id" TEXT NOT NULL,
    "ownerUid" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "filename" TEXT,
    "totalRows" INTEGER NOT NULL DEFAULT 0,
    "validRows" INTEGER NOT NULL DEFAULT 0,
    "invalidRows" INTEGER NOT NULL DEFAULT 0,
    "duplicateRows" INTEGER NOT NULL DEFAULT 0,
    "importedRows" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "errors" JSONB,
    "summary" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "LeadImportBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LeadSourceHealth" (
    "id" TEXT NOT NULL,
    "ownerUid" TEXT NOT NULL,
    "source" "public"."LeadSource" NOT NULL,
    "lastEventAt" TIMESTAMP(3),
    "lastErrorAt" TIMESTAMP(3),
    "lastError" TEXT,
    "isHealthy" BOOLEAN NOT NULL DEFAULT true,
    "totalLeads" INTEGER NOT NULL DEFAULT 0,
    "todayLeads" INTEGER NOT NULL DEFAULT 0,
    "weekLeads" INTEGER NOT NULL DEFAULT 0,
    "monthLeads" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeadSourceHealth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LeadAssignmentRule" (
    "id" TEXT NOT NULL,
    "ownerUid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "conditions" JSONB NOT NULL,
    "assigneeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeadAssignmentRule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EcommerceLead_ownerUid_status_idx" ON "public"."EcommerceLead"("ownerUid", "status");

-- CreateIndex
CREATE INDEX "EcommerceLead_ownerUid_score_idx" ON "public"."EcommerceLead"("ownerUid", "score");

-- CreateIndex
CREATE INDEX "EcommerceLead_ownerUid_source_idx" ON "public"."EcommerceLead"("ownerUid", "source");

-- CreateIndex
CREATE INDEX "EcommerceLead_ownerUid_createdAt_idx" ON "public"."EcommerceLead"("ownerUid", "createdAt");

-- CreateIndex
CREATE INDEX "EcommerceLead_phone_idx" ON "public"."EcommerceLead"("phone");

-- CreateIndex
CREATE INDEX "EcommerceLead_email_idx" ON "public"."EcommerceLead"("email");

-- CreateIndex
CREATE INDEX "EcommerceLead_externalId_idx" ON "public"."EcommerceLead"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "EcommerceLead_ownerUid_externalId_source_key" ON "public"."EcommerceLead"("ownerUid", "externalId", "source");

-- CreateIndex
CREATE INDEX "LeadEvent_leadId_idx" ON "public"."LeadEvent"("leadId");

-- CreateIndex
CREATE INDEX "LeadEvent_type_idx" ON "public"."LeadEvent"("type");

-- CreateIndex
CREATE INDEX "LeadEvent_createdAt_idx" ON "public"."LeadEvent"("createdAt");

-- CreateIndex
CREATE INDEX "LeadActivity_leadId_idx" ON "public"."LeadActivity"("leadId");

-- CreateIndex
CREATE INDEX "LeadActivity_type_idx" ON "public"."LeadActivity"("type");

-- CreateIndex
CREATE INDEX "LeadActivity_scheduledAt_idx" ON "public"."LeadActivity"("scheduledAt");

-- CreateIndex
CREATE INDEX "LeadActivity_createdAt_idx" ON "public"."LeadActivity"("createdAt");

-- CreateIndex
CREATE INDEX "LeadImportBatch_ownerUid_idx" ON "public"."LeadImportBatch"("ownerUid");

-- CreateIndex
CREATE INDEX "LeadImportBatch_status_idx" ON "public"."LeadImportBatch"("status");

-- CreateIndex
CREATE INDEX "LeadImportBatch_createdAt_idx" ON "public"."LeadImportBatch"("createdAt");

-- CreateIndex
CREATE INDEX "LeadSourceHealth_ownerUid_idx" ON "public"."LeadSourceHealth"("ownerUid");

-- CreateIndex
CREATE INDEX "LeadSourceHealth_source_idx" ON "public"."LeadSourceHealth"("source");

-- CreateIndex
CREATE UNIQUE INDEX "LeadSourceHealth_ownerUid_source_key" ON "public"."LeadSourceHealth"("ownerUid", "source");

-- CreateIndex
CREATE INDEX "LeadAssignmentRule_ownerUid_isActive_idx" ON "public"."LeadAssignmentRule"("ownerUid", "isActive");

-- CreateIndex
CREATE INDEX "LeadAssignmentRule_priority_idx" ON "public"."LeadAssignmentRule"("priority");

-- AddForeignKey
ALTER TABLE "public"."EcommerceLead" ADD CONSTRAINT "EcommerceLead_duplicateOfId_fkey" FOREIGN KEY ("duplicateOfId") REFERENCES "public"."EcommerceLead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LeadEvent" ADD CONSTRAINT "LeadEvent_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "public"."EcommerceLead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LeadActivity" ADD CONSTRAINT "LeadActivity_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "public"."EcommerceLead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
