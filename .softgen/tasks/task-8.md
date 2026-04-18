---
title: Customer portal & sign-up flow
status: todo
priority: medium
type: feature
tags: [customer, portal, signup]
created_by: agent
created_at: 2026-04-18T19:16:24Z
position: 8
---

## Notes
Customer-facing portal where end users sign up, choose plan, manage subscription. Sign-up flow shows available plans from the business, collects customer info, creates account. Portal uses business branding from settings.

## Checklist
- [ ] Create /customer/signup page: display business's subscription plans, plan selection, customer info form (name, email, password)
- [ ] Add plan comparison: show features side-by-side, highlight recommended plan
- [ ] Create /customer/dashboard page: subscription status, service details, next billing date
- [ ] Add account overview: connection limit, devices, usage stats
- [ ] Implement auth guard: only customer role can access /customer routes