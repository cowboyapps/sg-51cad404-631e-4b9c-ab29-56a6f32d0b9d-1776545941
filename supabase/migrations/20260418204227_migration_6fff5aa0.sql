-- Create platform pricing tiers table
CREATE TABLE IF NOT EXISTS platform_pricing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tier_name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  monthly_price DECIMAL(10,2) NOT NULL,
  yearly_price DECIMAL(10,2) NOT NULL,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  stripe_monthly_price_id TEXT,
  stripe_yearly_price_id TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add platform tier to businesses table
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS platform_tier_id UUID REFERENCES platform_pricing(id);
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS custom_pricing JSONB;

-- RLS policies for platform_pricing
ALTER TABLE platform_pricing ENABLE ROW LEVEL SECURITY;

-- Public can read active tiers
CREATE POLICY "public_read_active" ON platform_pricing
  FOR SELECT USING (is_active = true);

-- Master admins can manage pricing
CREATE POLICY "admin_all" ON platform_pricing
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'master_admin'
    )
  );

-- Insert default pricing tiers
INSERT INTO platform_pricing (tier_name, display_name, description, monthly_price, yearly_price, features, sort_order) VALUES
('starter', 'Starter', 'Perfect for getting started', 29.00, 290.00, 
  '["Up to 100 customers", "Custom domain support", "Basic support tickets", "Email branding", "Standard analytics"]'::jsonb, 1),
('professional', 'Professional', 'For growing businesses', 79.00, 790.00,
  '["Up to 500 customers", "Domain marketplace access", "Priority support", "Advanced analytics", "Custom email domain", "Theme customization", "API access"]'::jsonb, 2),
('enterprise', 'Enterprise', 'For large operations', 199.00, 1990.00,
  '["Unlimited customers", "Dedicated account manager", "24/7 support", "White-label everything", "Advanced API", "Custom integrations", "SLA guarantees"]'::jsonb, 3)
ON CONFLICT DO NOTHING;

COMMENT ON TABLE platform_pricing IS 'Platform subscription tiers for IPTV businesses';
COMMENT ON COLUMN businesses.platform_tier_id IS 'Current subscription tier';
COMMENT ON COLUMN businesses.custom_pricing IS 'Custom pricing override for specific business';