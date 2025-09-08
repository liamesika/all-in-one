-- Add areaSqm column to Property (idempotent & safe)
ALTER TABLE "Property" ADD COLUMN IF NOT EXISTS "areaSqm" INTEGER;
