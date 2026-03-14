-- Repair migration: safely add any missing columns to the Admin table.
-- Uses IF NOT EXISTS so it's safe to run even if columns already exist.

-- Ensure Admin table exists at all (creates it if missing entirely)
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

-- Add missing columns individually (safe if table already exists with partial schema)
ALTER TABLE "Admin" ADD COLUMN IF NOT EXISTS "is_active" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Admin" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Admin" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Admin" ADD COLUMN IF NOT EXISTS "last_login_at" TIMESTAMP(3);

-- Ensure unique/index constraints exist
CREATE UNIQUE INDEX IF NOT EXISTS "Admin_email_key" ON "Admin"("email");
CREATE INDEX IF NOT EXISTS "Admin_email_idx" ON "Admin"("email");
CREATE INDEX IF NOT EXISTS "Admin_role_idx" ON "Admin"("role");
CREATE INDEX IF NOT EXISTS "Admin_is_active_idx" ON "Admin"("is_active");
