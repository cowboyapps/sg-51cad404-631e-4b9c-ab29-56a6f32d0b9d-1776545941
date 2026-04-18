-- Add Stripe-related fields to businesses table
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trialing';
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMP WITH TIME ZONE;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS trial_end TIMESTAMP WITH TIME ZONE;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS pricing_tier_id UUID REFERENCES platform_pricing(id);

CREATE INDEX IF NOT EXISTS idx_businesses_stripe_customer ON businesses(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_businesses_stripe_subscription ON businesses(stripe_subscription_id);

COMMENT ON COLUMN businesses.stripe_customer_id IS 'Stripe customer ID for this business';
COMMENT ON COLUMN businesses.stripe_subscription_id IS 'Active Stripe subscription ID';
COMMENT ON COLUMN businesses.subscription_status IS 'Subscription status: trialing, active, past_due, canceled, unpaid';
COMMENT ON COLUMN businesses.current_period_end IS 'Current billing period end date';
COMMENT ON COLUMN businesses.trial_end IS 'Trial period end date';
COMMENT ON COLUMN businesses.pricing_tier_id IS 'Selected pricing tier reference';

-- Create payment history table
CREATE TABLE IF NOT EXISTS payment_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  stripe_invoice_id TEXT NOT NULL,
  amount_paid DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL,
  invoice_url TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_history_business ON payment_history(business_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_stripe_invoice ON payment_history(stripe_invoice_id);

COMMENT ON TABLE payment_history IS 'Payment history for business subscriptions';