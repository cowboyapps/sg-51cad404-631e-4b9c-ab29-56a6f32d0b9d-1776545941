-- Create usage logs table for tracking customer activity
CREATE TABLE IF NOT EXISTS usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  bandwidth_mb NUMERIC(10, 2) DEFAULT 0,
  concurrent_streams INTEGER DEFAULT 0,
  watch_minutes INTEGER DEFAULT 0,
  device_info JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries by customer and time
CREATE INDEX IF NOT EXISTS idx_usage_logs_customer ON usage_logs(customer_id, logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_logs_business ON usage_logs(business_id, logged_at DESC);

-- Create aggregated usage stats view for easier querying
CREATE OR REPLACE VIEW customer_usage_summary AS
SELECT 
  customer_id,
  business_id,
  DATE_TRUNC('day', logged_at) as usage_date,
  SUM(bandwidth_mb) as total_bandwidth_mb,
  MAX(concurrent_streams) as peak_concurrent_streams,
  SUM(watch_minutes) as total_watch_minutes,
  COUNT(DISTINCT DATE_TRUNC('hour', logged_at)) as active_hours
FROM usage_logs
GROUP BY customer_id, business_id, DATE_TRUNC('day', logged_at);

COMMENT ON TABLE usage_logs IS 'Tracks customer streaming activity: bandwidth, concurrent streams, watch time';
COMMENT ON VIEW customer_usage_summary IS 'Daily aggregated usage statistics per customer';