-- Create page builder configurations table
CREATE TABLE IF NOT EXISTS page_builder_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  page_name TEXT NOT NULL DEFAULT 'home',
  page_structure JSONB NOT NULL DEFAULT '{}',
  published BOOLEAN DEFAULT false,
  last_published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(business_id, page_name)
);

CREATE INDEX IF NOT EXISTS idx_page_builder_business ON page_builder_configs(business_id);
CREATE INDEX IF NOT EXISTS idx_page_builder_published ON page_builder_configs(published);

COMMENT ON TABLE page_builder_configs IS 'Visual page builder configurations for business customer sites';
COMMENT ON COLUMN page_builder_configs.page_structure IS 'GrapesJS JSON structure containing HTML, CSS, and component data';
COMMENT ON COLUMN page_builder_configs.published IS 'Whether this page version is live on the customer-facing site';