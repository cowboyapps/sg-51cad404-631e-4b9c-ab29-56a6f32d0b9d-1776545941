---
title: Database schema & auth setup
status: done
priority: urgent
type: feature
tags: [database, auth, foundation]
created_by: agent
created_at: 2026-04-18T19:17:45.596688
position: 1
---

## Notes
Multi-tenant database architecture with three user tiers: master_admin (platform managers), business_owner (IPTV service providers), customer (end users). Tenant isolation via business_id with proper RLS policies ensuring each business only sees their data.

## Checklist
- [x] Create user role enum: master_admin, business_owner, customer
- [x] Create businesses table with tenant isolation
- [x] Create customers table linking profiles to businesses
- [x] Create subscription_plans, subscriptions, invoices tables
- [x] Add role column to profiles table
- [x] Implement RLS policies (tenant isolation, role-based access)
- [x] Configure profiles auto-create trigger