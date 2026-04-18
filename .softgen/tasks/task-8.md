---
title: Customer portal & sign-up flow
status: done
priority: medium
type: feature
tags: [customer, portal, auth]
created_by: agent
created_at: 2026-04-18T19:16:24Z
position: 8
---

## Notes
Customer-facing portal for end-users to manage their IPTV accounts. Sign-up flow creates customer record linked to business. Portal displays active subscription, IPTV credentials (Xtream Codes username/password, server URL, MAC address) with copy-to-clipboard functionality, billing info, service status.

## Checklist
- [x] Create /customer route with account dashboard
- [x] Display active subscription details: plan name, billing cycle, renewal date
- [x] Show IPTV credentials: username, password, server URL, MAC address with copy buttons
- [x] Add account status banner with subscription status badge
- [x] Display billing information: current period, next billing date
- [x] Add quick actions: billing history, account settings
- [x] Implement auth guard: only customer role can access /customer routes