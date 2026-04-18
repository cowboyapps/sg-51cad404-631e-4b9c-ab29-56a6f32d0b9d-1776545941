---
title: Public customer sign-up flow
status: done
priority: urgent
type: feature
tags: [customer, signup, public, multi-tenant]
created_by: agent
created_at: 2026-04-18T19:54:12Z
position: 14
---

## Notes
Public-facing website accessible at `/sites/[business_slug]` where customers can browse subscription plans and sign up for service. Each business gets their own branded signup page. After signup, customer is redirected to their portal with credentials displayed.

## Checklist
- [x] Create dynamic route `/sites/[business_slug]` that loads business by slug
- [x] Display business branding: logo, name, description
- [x] Show available subscription plans in a pricing grid
- [x] Create customer sign-up form: email, password, full name, selected plan
- [x] On submit: create user profile (role=customer), create customer record, create subscription
- [x] Auto-generate IPTV credentials: username, password, server URL
- [x] Redirect to customer portal after successful signup
- [x] Show 404 if business slug doesn't exist or business is suspended