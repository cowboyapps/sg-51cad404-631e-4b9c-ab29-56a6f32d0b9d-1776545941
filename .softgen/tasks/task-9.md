---
title: Billing & invoicing system
status: todo
priority: medium
type: feature
tags: [billing, invoices, automation]
created_by: agent
created_at: 2026-04-18T19:16:24Z
position: 9
---

## Notes
Automated billing creates invoices on subscription cycle, tracks payment status. Business owners view all invoices, customers see their billing history. Invoice generation with line items, tax calculations, payment due dates.

## Checklist
- [ ] Create invoices service: generate invoice on subscription creation/renewal
- [ ] Add /business/billing page: all invoices table, revenue charts, payment status filters
- [ ] Create /customer/billing page: customer's invoice history, download PDF, payment methods
- [ ] Add invoice detail view: line items, subtotal, tax, total, payment status, due date
- [ ] Implement payment status badges: paid, pending, overdue, cancelled