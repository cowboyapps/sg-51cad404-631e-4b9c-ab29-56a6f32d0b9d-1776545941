---
title: Master admin dashboard
status: todo
priority: high
type: feature
tags: [admin, dashboard, management]
created_by: agent
created_at: 2026-04-18T19:16:24Z
position: 4
---

## Notes
Platform admin interface at /admin managing all IPTV businesses. Dashboard shows total businesses, active customers, revenue metrics. Businesses table with search, filter, status management. Ability to view business details, suspend/activate accounts.

## Checklist
- [ ] Create /admin/dashboard page: metrics overview (total businesses, customers, MRR)
- [ ] Add businesses table: list all businesses with status, customer count, created date, actions
- [ ] Create /admin/businesses/[id] page: business detail view with customer list, subscription data
- [ ] Add business management actions: activate, suspend, view analytics
- [ ] Implement auth guard: only master_admin role can access /admin routes