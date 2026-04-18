---
title: Billing & invoicing system
status: done
priority: medium
type: feature
tags: [billing, invoices, payments]
created_by: agent
created_at: 2026-04-18T19:16:24Z
position: 9
---

## Notes
Business owners track all invoices, filter by status (paid/pending/overdue), view revenue metrics. Invoices auto-generate when subscriptions renew. Display total revenue, pending amounts, overdue count. Customers can view their billing history.

## Checklist
- [x] Create /business/billing route with invoices table
- [x] Display metrics: total revenue, this month revenue, pending amount, overdue count
- [x] Build invoice filters: all, paid, pending, overdue, cancelled
- [x] Show invoice details: customer, plan, amount, due date, payment status
- [x] Implement invoice status badges: paid, pending, overdue, cancelled