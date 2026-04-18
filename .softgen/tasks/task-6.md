---
title: Subscription plans management
status: done
priority: high
type: feature
tags: [business, billing, plans]
created_by: agent
created_at: 2026-04-18T19:17:45.596688
position: 6
---

## Notes
Business owners configure pricing packages (monthly/quarterly/yearly billing cycles) with features lists. Plans can be activated/deactivated without deletion. Validation prevents deleting plans with active subscribers.

## Checklist
- [x] Create /business/plans route
- [x] Build plan creation form: name, price, billing cycle, features list
- [x] Display plans in card grid with pricing, features, active/inactive badges
- [x] Implement edit plan (updates existing plan)
- [x] Implement delete plan (with active subscriber validation)
- [x] Add activate/deactivate toggle (hides/shows plans to customers)
- [x] Implement plan validation: prevent deleting plans with active subscribers