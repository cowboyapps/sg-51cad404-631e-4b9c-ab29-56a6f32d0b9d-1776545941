---
title: Master landing page & business sign-up
status: done
priority: high
type: feature
tags: [marketing, auth]
created_by: agent
created_at: 2026-04-18T19:17:45.596688
position: 3
---

## Notes
Public-facing marketing site showcasing platform features with business owner sign-up flow. Creates both user profile and business record, then redirects to business dashboard.

## Checklist
- [x] Create index.tsx: hero section, features grid, CTA, testimonials section
- [x] Build features section: 6 key features with icons (website builder, customer management, billing, configuration, analytics, all-in-one)
- [x] Add pricing/CTA section with "Get Started" button
- [x] Create signup.tsx: email/password form, business name, slug
- [x] Create login.tsx: email/password with role-based routing (admin → /admin, business_owner → /business, customer → /customer, unknown role → error/redirect)
- [x] Implement RLS: new users get business_owner role by default (for business owner sign-up flow)
- [x] Build signup flow: create profile + business record, redirect to business dashboard