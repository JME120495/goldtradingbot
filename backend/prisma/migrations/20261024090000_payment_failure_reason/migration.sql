-- Keep the provider's failure reason so the customer can see why a payment failed.
-- Additive only.
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "failureReason" TEXT;
