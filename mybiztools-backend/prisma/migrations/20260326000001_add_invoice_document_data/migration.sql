-- Add documentData column to Invoice for round-trip fidelity with frontend format
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "documentData" JSONB;
