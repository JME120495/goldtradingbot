-- CreateTable
CREATE TABLE "mt5_licenses" (
    "id" SERIAL NOT NULL,
    "clientName" VARCHAR(120) NOT NULL,
    "clientEmail" VARCHAR(160) NOT NULL,
    "clientWhatsapp" VARCHAR(30),
    "accountNumber" BIGINT NOT NULL,
    "broker" VARCHAR(100) NOT NULL DEFAULT '',
    "server" VARCHAR(100) NOT NULL DEFAULT '',
    "eaName" VARCHAR(60) NOT NULL DEFAULT 'ALL',
    "plan" VARCHAR(20) NOT NULL DEFAULT 'Starter',
    "lot" DECIMAL(6,2) NOT NULL DEFAULT 0.01,
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "expiryDate" DATE NOT NULL,
    "lastCheckAt" TIMESTAMPTZ,
    "lastCheckIp" VARCHAR(60),
    "checkCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "mt5_licenses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "mt5_licenses_accountNumber_eaName_key" ON "mt5_licenses"("accountNumber", "eaName");

-- CreateIndex
CREATE INDEX "mt5_licenses_expiryDate_idx" ON "mt5_licenses"("expiryDate");
