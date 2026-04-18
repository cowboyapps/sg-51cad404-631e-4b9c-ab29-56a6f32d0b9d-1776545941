---
title: Public customer sign-up flow & custom domains
status: done
priority: urgent
type: feature
tags: [customer, signup, public, multi-tenant, domains]
created_by: agent
created_at: 2026-04-18T19:54:12Z
position: 14
---

## Notes
Public-facing website accessible at `/sites/[business_slug]` or via custom domain where customers can browse subscription plans and sign up for service. Each business gets their own branded signup page with custom domain support and email domain configuration.

## Checklist
- [x] Create dynamic route `/sites/[business_slug]` that loads business by slug
- [x] Create `/sites/_domain.tsx` route for custom domain requests
- [x] Add Next.js middleware to detect and route custom domains
- [x] Add custom_domain field to businesses table
- [x] Add email_domain and email_domain_verified fields for branded email sending
- [x] Create business settings page with custom domain configuration
- [x] Display DNS setup instructions (CNAME for domain, SPF/DKIM for email)
- [x] Display business branding: logo, name, description
- [x] Show available subscription plans in a pricing grid
- [x] Create customer sign-up form: email, password, full name, selected plan
- [x] On submit: create user profile (role=customer), create customer record, create subscription
- [x] Auto-generate IPTV credentials: username, password, server URL
- [x] Redirect to customer portal after successful signup
- [x] Show 404 if business slug doesn't exist or business is suspended