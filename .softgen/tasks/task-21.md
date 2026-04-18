---
title: Drag & drop page builder for customer sites
status: done
priority: medium
type: feature
tags: [page-builder, customization, visual-editor]
created_by: agent
created_at: 2026-04-18T20:38:52Z
position: 21
---

## Notes
Visual drag & drop page builder allowing IPTV businesses to customize their customer-facing website without code. Pre-built blocks for hero, features, pricing, testimonials, FAQ. Save page configurations to database and render dynamically.

## Checklist
- [x] Create page_builder_configs table storing page JSON structure per business
- [x] Integrate GrapesJS or similar page builder library
- [x] Build page editor interface accessible from business dashboard
- [x] Create pre-built component library: hero, feature grid, pricing table, testimonial, FAQ, contact form
- [x] Implement save/publish workflow
- [x] Update /sites/[slug] to render from page_builder_configs if exists
- [x] Add live preview toggle in editor
- [x] Create template gallery with starter layouts