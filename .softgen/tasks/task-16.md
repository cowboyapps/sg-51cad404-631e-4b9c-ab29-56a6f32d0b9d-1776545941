---
title: Integrated domain marketplace with auto-DNS setup
status: done
priority: high
type: feature
tags: [domains, monetization, automation, dns]
created_by: agent
created_at: 2026-04-18T20:26:04Z
position: 16
---

## Notes
Platform-managed domain purchasing system allowing businesses to buy domains directly through the platform with automatic DNS configuration. Alternative to manual "bring your own domain" flow. Uses Namecheap Reseller API with markup pricing ($25/year retail vs ~$12 wholesale). Instant setup with zero configuration needed.

## Checklist
- [x] Add domain management fields to businesses table (managed_by_platform, expiration, auto_renew, registrar_id)
- [x] Create domain service with Namecheap API integration (sandbox mode)
- [x] Build domain search interface with real-time availability checking
- [x] Create domain purchase flow with Stripe checkout integration
- [x] Implement automatic DNS configuration via Namecheap API (CNAME, SPF, DKIM records)
- [x] Build domain management dashboard showing expiration, renewal settings
- [x] Add two-path UI: "Buy New Domain" tab vs "Use Existing Domain" tab
- [x] Create domain renewal system with auto-renew toggle
- [x] Add domain transfer capabilities
- [x] Implement domain expiration notifications