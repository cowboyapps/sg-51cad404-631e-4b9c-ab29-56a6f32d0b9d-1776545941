---
title: Customer management interface
status: todo
priority: medium
type: feature
tags: [business, customers, management]
created_by: agent
created_at: 2026-04-18T19:16:24Z
position: 7
---

## Notes
Business owners view and manage their customer base. Customers table with search, filter by subscription status, view details. Customer detail page showing subscription info, billing history, account status. Actions to suspend, reactivate, send password reset.

## Checklist
- [ ] Create /business/customers page: table with name, email, plan, status, joined date, actions
- [ ] Add customer filters: all, active, suspended, trial, overdue
- [ ] Create /business/customers/[id] page: customer detail with subscription info, billing history
- [ ] Add customer actions: suspend account, reactivate, send reset email, view login activity
- [ ] Implement customer search: by name, email, subscription plan