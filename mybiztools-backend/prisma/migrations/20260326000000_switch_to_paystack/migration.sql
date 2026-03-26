-- Switch payment gateway from Stripe/Monnify to Paystack
-- Renames stripePaymentId -> paystackReference
-- Removes stripeInvoiceId
-- Adds plan and billingCycle columns to Payment

-- Rename column
ALTER TABLE "Payment" RENAME COLUMN "stripePaymentId" TO "paystackReference";

-- Drop stripe-specific column
ALTER TABLE "Payment" DROP COLUMN IF EXISTS "stripeInvoiceId";

-- Add Paystack-specific columns
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "plan" TEXT;
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "billingCycle" TEXT;

-- Rename the unique constraint index
ALTER INDEX IF EXISTS "Payment_stripePaymentId_key" RENAME TO "Payment_paystackReference_key";

-- Rename the regular index
ALTER INDEX IF EXISTS "Payment_stripePaymentId_idx" RENAME TO "Payment_paystackReference_idx";
