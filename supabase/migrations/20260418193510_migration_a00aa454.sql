-- Add IPTV specific credential fields to the subscriptions table
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS iptv_username TEXT;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS iptv_password TEXT;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS iptv_mac_address TEXT;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS iptv_server_url TEXT;