---
title: Business owner dashboard foundation
status: todo
priority: high
type: feature
tags: [business, dashboard, foundation]
created_by: agent
created_at: 2026-04-18T19:16:24Z
position: 5
---

## Notes
Business owner portal at /business managing their IPTV service. Dashboard shows their customer metrics, revenue, active subscriptions. Navigation to customers, plans, billing, settings. Branding config (logo, colors, domain) for their customer-facing site.

## Checklist
- [ ] Create /business/dashboard page: metrics cards (total customers, active subs, MRR, churn rate)
- [ ] Add recent activity feed: new signups, payments received, expiring subscriptions
- [ ] Create /business/settings page: business branding (logo upload, primary color, custom domain)
- [ ] Add business info form: company name, contact email, support info
- [ ] Implement auth guard: only business_owner role can access /business routes