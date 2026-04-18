---
title: White-label branding: email, SEO, and theme customization
status: done
priority: high
type: feature
tags: [branding, customization, seo, theming, white-label]
created_by: agent
created_at: 2026-04-18T20:32:15Z
position: 17
---

## Notes
Complete white-label customization system allowing IPTV businesses to fully customize their brand identity. Includes email branding (sender, logo, footer), SEO settings (meta tags, OG image, favicon), and site theme editor (colors, fonts, layout). All settings managed through tabbed interface in business settings with live previews.

## Checklist
- [x] Add email_branding JSONB field to businesses table
- [x] Add seo_settings JSONB field to businesses table
- [x] Add site_theme JSONB field to businesses table
- [x] Create Email Branding tab with sender name, reply-to, logo URL, footer text
- [x] Build email preview component showing real-time branding
- [x] Create SEO Settings tab with title, description, keywords, OG image, favicon
- [x] Add character counters for meta title (60) and description (160)
- [x] Build Site Theme tab with color customization (primary, accent, background, card)
- [x] Add font selection dropdowns for heading and body fonts (10 options each)
- [x] Create layout style selector (modern, classic, minimal)
- [x] Build live theme preview showing colors and fonts in action
- [x] Implement single save button for all settings across tabs
- [x] Organize settings into 5 tabs: Basic Info, Email Branding, SEO, Theme, Domain & Email