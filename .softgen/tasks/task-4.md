---
title: Master admin dashboard
status: done
priority: high
type: feature
tags: [admin, dashboard]
created_by: agent
created_at: 2026-04-18T19:17:45.596688
position: 4
---

## Notes
Platform-level admin dashboard accessible only to master_admin role. Displays all IPTV businesses with filtering, status management, and analytics overview.

## Checklist
- [x] Create /admin route with dashboard layout
- [x] Build businesses overview table (all IPTV businesses)
- [x] Display metrics: total businesses, active/trial/suspended counts
- [x] Create business detail page: view/edit business info, suspend, view analytics
- [x] Implement auth guard: only master_admin role can access /admin routes