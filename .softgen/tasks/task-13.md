---
title: Support ticket system with email notifications
status: in_progress
priority: high
type: feature
tags: [support, tickets, email, notifications]
created_by: agent
created_at: 2026-04-18T19:48:46Z
position: 13
---

## Notes
Complete support ticket system enabling customers to contact IPTV business owners. Includes conversation threads, status tracking (open, in_progress, resolved, closed), priority levels, and automated email notifications for all ticket events.

## Checklist
- [ ] Create support_tickets table with status, priority, business/customer relationships
- [ ] Create ticket_messages table for conversation threads
- [ ] Implement RLS: customers see own tickets, business owners see tickets from their customers
- [ ] Create /customer/support page: create ticket form, view tickets list, ticket detail/reply
- [ ] Create /business/support page: view all customer tickets, filter by status/priority, respond
- [ ] Build ticket service: CRUD operations, status updates, message threading
- [ ] Create Edge Function for email notifications (new ticket, replies, status changes)
- [ ] Generate email templates for support notifications