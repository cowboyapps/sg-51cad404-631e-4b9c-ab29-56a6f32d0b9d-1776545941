---
title: Database schema & auth setup
status: todo
priority: urgent
type: feature
tags: [database, auth, foundation]
created_by: agent
created_at: 2026-04-18T19:16:24Z
position: 1
---

## Notes
Multi-tenant database architecture with three user levels: platform admins (master), business owners (tenants), end customers. Each business is isolated with RLS. Auth uses Supabase email/password. Profiles auto-created on signup with role assignment.

## Checklist
- [ ] Create profiles table with role enum (master_admin, business_owner, customer)
- [ ] Create businesses table (tenant isolation, branding config, domain settings)
- [ ] Create customers table (linked to businesses, subscription status)
- [ ] Create subscription_plans table (per business, pricing tiers)
- [ ] Create subscriptions table (customer subscriptions, billing cycle)
- [ ] Create invoices table (billing history, payment status)
- [ ] Set up RLS policies (tenant isolation, role-based access)
- [ ] Configure profiles auto-create trigger