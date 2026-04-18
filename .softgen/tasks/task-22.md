---
title: Stripe billing integration for platform subscriptions
status: done
priority: urgent
type: feature
tags: [stripe, billing, payments, revenue]
created_by: agent
created_at: 2026-04-18T21:22:31Z
position: 22
---

## Notes
Complete Stripe integration for billing IPTV businesses on platform subscription tiers. Handles checkout, recurring billing, subscription management, webhooks, payment history. Enables automated revenue collection with 14-day free trials.

## Checklist
- [x] Install Stripe SDK and dependencies
- [x] Add Stripe fields to businesses table (customer_id, subscription_id, status, period_end, trial_end)
- [x] Create payment_history table for invoice tracking
- [x] Build stripeService with customer creation, checkout sessions, portal sessions, subscription management
- [x] Create /api/stripe/create-checkout endpoint
- [x] Create /api/stripe/create-portal endpoint  
- [x] Create /api/stripe/webhook endpoint with event handlers
- [x] Build /business/billing page showing subscription status, payment history
- [x] Add subscription status to business dashboard header
- [x] Sync pricing tiers with Stripe products/prices
- [x] Test checkout flow with Stripe test cards
- [x] Configure webhook for automated billing events