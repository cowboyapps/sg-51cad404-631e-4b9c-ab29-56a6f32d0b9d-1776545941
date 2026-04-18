---
title: Business owner dashboard foundation
status: done
priority: high
type: feature
tags: [business, dashboard]
created_by: agent
created_at: 2026-04-18T19:17:45.596688
position: 5
---

## Notes
Business owner dashboard accessible only to business_owner role. Shows business-specific data (customers, revenue, subscriptions) filtered by business_id. Quick access to customer management, billing configuration, and website builder.

## Checklist
- [x] Create /business route with dashboard layout
- [x] Display business metrics: total customers, active subscriptions, monthly revenue, trial expiring
- [x] Build recent customers table (latest 5 sign-ups)
- [x] Add quick action cards: customers, plans, website builder
- [x] Show trial status notice with upgrade CTA if business.status = trial
- [x] Add header with business name, status badge, settings, logout
- [x] Implement auth guard: only business_owner role can access /business routes