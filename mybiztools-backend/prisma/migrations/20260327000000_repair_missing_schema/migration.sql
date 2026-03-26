-- ============================================================================
-- REPAIR MIGRATION: Apply all schema changes that were baselined but not
-- executed against the production database.
-- All statements use IF NOT EXISTS / conditional blocks so this is idempotent.
-- ============================================================================

-- ── 1. Product & StockMovement tables (from 20260314000000_add_inventory) ────

CREATE TABLE IF NOT EXISTS "Product" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'Other',
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "unitCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sellingPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lowStockThreshold" INTEGER NOT NULL DEFAULT 5,
    "supplier" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "StockMovement" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "reason" TEXT NOT NULL DEFAULT 'Adjustment',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockMovement_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Product_userId_sku_key" ON "Product"("userId", "sku");
CREATE INDEX IF NOT EXISTS "Product_userId_idx" ON "Product"("userId");
CREATE INDEX IF NOT EXISTS "Product_category_idx" ON "Product"("category");
CREATE INDEX IF NOT EXISTS "StockMovement_productId_idx" ON "StockMovement"("productId");
CREATE INDEX IF NOT EXISTS "StockMovement_userId_idx" ON "StockMovement"("userId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'StockMovement_productId_fkey'
  ) THEN
    ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_productId_fkey"
      FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;

-- ── 2. Admin table repair (from 20260314120000_repair_admin_table) ─────────

CREATE TABLE IF NOT EXISTS "Admin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'viewer',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_login_at" TIMESTAMP(3),
    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Admin" ADD COLUMN IF NOT EXISTS "is_active" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Admin" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Admin" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Admin" ADD COLUMN IF NOT EXISTS "last_login_at" TIMESTAMP(3);

CREATE UNIQUE INDEX IF NOT EXISTS "Admin_email_key" ON "Admin"("email");
CREATE INDEX IF NOT EXISTS "Admin_email_idx" ON "Admin"("email");
CREATE INDEX IF NOT EXISTS "Admin_role_idx" ON "Admin"("role");
CREATE INDEX IF NOT EXISTS "Admin_is_active_idx" ON "Admin"("is_active");

-- ── 3. Switch Payment gateway: Stripe → Paystack (from 20260326000000) ──────

-- Rename stripePaymentId → paystackReference (only if old column still exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Payment' AND column_name = 'stripePaymentId'
  ) THEN
    ALTER TABLE "Payment" RENAME COLUMN "stripePaymentId" TO "paystackReference";
  END IF;
END
$$;

-- Drop stripe-specific column
ALTER TABLE "Payment" DROP COLUMN IF EXISTS "stripeInvoiceId";

-- Add Paystack-specific columns
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "plan" TEXT;
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "billingCycle" TEXT;

-- Rename unique constraint index (conditional)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'Payment_stripePaymentId_key') THEN
    ALTER INDEX "Payment_stripePaymentId_key" RENAME TO "Payment_paystackReference_key";
  END IF;
END
$$;

-- Rename regular index (conditional)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'Payment_stripePaymentId_idx') THEN
    ALTER INDEX "Payment_stripePaymentId_idx" RENAME TO "Payment_paystackReference_idx";
  END IF;
END
$$;

-- Ensure paystackReference unique index exists regardless
CREATE UNIQUE INDEX IF NOT EXISTS "Payment_paystackReference_key" ON "Payment"("paystackReference");
CREATE INDEX IF NOT EXISTS "Payment_paystackReference_idx" ON "Payment"("paystackReference");

-- ── 4. Add documentData to Invoice (from 20260326000001) ─────────────────────

ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "documentData" JSONB;
