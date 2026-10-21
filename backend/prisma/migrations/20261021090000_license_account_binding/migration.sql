-- 1 licence = 1 compte MT5 (changement client limité à 1x / 30 jours)
-- Additive only: no existing column, row or constraint is modified.

ALTER TABLE "License" ADD COLUMN IF NOT EXISTS "accountChangedAt" TIMESTAMP(3);
ALTER TABLE "License" ADD COLUMN IF NOT EXISTS "accountChangeCount" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS "license_account_history" (
    "id" SERIAL NOT NULL,
    "licenseId" TEXT NOT NULL,
    "oldAccount" BIGINT,
    "newAccount" BIGINT NOT NULL,
    "changedBy" VARCHAR(20) NOT NULL DEFAULT 'client',
    "changedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "license_account_history_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "license_account_history_licenseId_fkey" FOREIGN KEY ("licenseId") REFERENCES "License"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "license_account_history_licenseId_idx" ON "license_account_history"("licenseId");
