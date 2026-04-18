---
title: Pricing page with master admin controls
status: todo
priority: urgent
type: feature
tags: [pricing, monetization, admin]
created_by: agent
created_at: 2026-04-18T20:38:25Z
position: 19
---

## Notes
Public-facing pricing page showing platform subscription tiers for IPTV business owners. Master admin panel to configure pricing, features per tier, and custom pricing for individual businesses. Controls platform revenue model.

## Checklist
- [ ] Create platform_pricing table with tier name, monthly/yearly price, features JSON, stripe_price_id
- [ ] Build public /pricing page showing available tiers with feature comparison
- [ ] Add master admin pricing management interface
- [ ] Allow admin to create/edit/delete pricing tiers
- [ ] Add custom pricing override capability for individual businesses
- [ ] Integrate with business signup flow to select tier
- [ ] Show current plan in business dashboard with upgrade/downgrade options