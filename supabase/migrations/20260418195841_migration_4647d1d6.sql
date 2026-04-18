-- Add helper function to generate random IPTV credentials
CREATE OR REPLACE FUNCTION generate_iptv_username()
RETURNS TEXT AS $$
BEGIN
  RETURN 'iptv_' || LOWER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_iptv_password()
RETURNS TEXT AS $$
BEGIN
  RETURN UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 12));
END;
$$ LANGUAGE plpgsql;

-- Add trigger to auto-generate IPTV credentials when subscription is created
CREATE OR REPLACE FUNCTION auto_generate_iptv_credentials()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.iptv_username IS NULL THEN
    NEW.iptv_username := generate_iptv_username();
  END IF;
  
  IF NEW.iptv_password IS NULL THEN
    NEW.iptv_password := generate_iptv_password();
  END IF;
  
  IF NEW.iptv_server_url IS NULL THEN
    NEW.iptv_server_url := 'http://stream.iptvserver.com:8080';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_iptv_credentials ON subscriptions;
CREATE TRIGGER set_iptv_credentials
  BEFORE INSERT ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_iptv_credentials();