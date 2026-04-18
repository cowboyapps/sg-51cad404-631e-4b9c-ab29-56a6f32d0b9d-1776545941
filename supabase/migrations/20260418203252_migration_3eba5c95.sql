-- Add branding and customization fields to businesses table
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS email_branding JSONB DEFAULT '{
  "from_name": "",
  "reply_to": "",
  "footer_text": "",
  "logo_url": ""
}'::jsonb;

ALTER TABLE businesses ADD COLUMN IF NOT EXISTS seo_settings JSONB DEFAULT '{
  "title": "",
  "description": "",
  "keywords": "",
  "og_image": "",
  "favicon": ""
}'::jsonb;

ALTER TABLE businesses ADD COLUMN IF NOT EXISTS site_theme JSONB DEFAULT '{
  "primary_color": "#06B6D4",
  "accent_color": "#0EA5E9",
  "background_color": "#0A0A0B",
  "card_color": "#131316",
  "heading_font": "Plus Jakarta Sans",
  "body_font": "Work Sans",
  "layout_style": "modern"
}'::jsonb;

COMMENT ON COLUMN businesses.email_branding IS 'Email template branding: from_name, reply_to, footer_text, logo_url';
COMMENT ON COLUMN businesses.seo_settings IS 'SEO configuration: title, description, keywords, og_image, favicon';
COMMENT ON COLUMN businesses.site_theme IS 'Site theme customization: colors, fonts, layout style';