-- Add description and custom email domain fields to businesses table
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS email_domain TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS email_domain_verified BOOLEAN DEFAULT false;