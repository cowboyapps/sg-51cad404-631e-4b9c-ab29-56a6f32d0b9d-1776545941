-- Add domain management fields to businesses table
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS domain_managed_by_platform BOOLEAN DEFAULT false;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS domain_registration_expires TIMESTAMP WITH TIME ZONE;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS domain_auto_renew BOOLEAN DEFAULT true;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS domain_registrar_id TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS domain_purchase_price DECIMAL(10,2);

-- Add index for expiration tracking
CREATE INDEX IF NOT EXISTS idx_businesses_domain_expiration ON businesses(domain_registration_expires) WHERE domain_managed_by_platform = true;