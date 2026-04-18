---
title: Customer management interface
status: done
priority: medium
type: feature
tags: [business, customers, management]
created_by: agent
created_at: 2026-04-18T19:16:24Z
position: 7
---

## Notes
Business owners view and manage their customer base. Customers table with search, filter by subscription status, view details. Customer detail page showing subscription info, billing history, account status. Actions to suspend, reactivate, send password reset. **Added IPTV credential display: Xtream Codes (username/password), MAC addresses for MAG devices.**

## Checklist
- [x] Create /business/customers page: table with name, email, plan, status, joined date, actions
- [x] Add customer filters: all, active, suspended, trial, overdue
- [x] Display IPTV credentials: username, password, MAC address, server URL
- [x] Add customer actions: suspend account, reactivate, send reset email, view login activity
- [x] Implement customer search: by name, email, subscription plan