-- CreateTable
CREATE TABLE "public"."RealEstateLeadEvent" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RealEstateLeadEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RealEstateLeadEvent_leadId_idx" ON "public"."RealEstateLeadEvent"("leadId");

-- AddForeignKey
ALTER TABLE "public"."RealEstateLeadEvent" ADD CONSTRAINT "RealEstateLeadEvent_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "public"."RealEstateLead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
