-- Add custom domain support to businesses table
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS custom_domain TEXT;
ALTER TABLE businesses ADD CONSTRAINT unique_custom_domain UNIQUE (custom_domain);

-- Create index for fast domain lookups
CREATE INDEX IF NOT EXISTS idx_businesses_custom_domain ON businesses(custom_domain);