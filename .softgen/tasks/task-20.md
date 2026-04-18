---
title: Customer usage analytics dashboard
status: done
priority: high
type: feature
tags: [analytics, usage, monitoring]
created_by: agent
created_at: 2026-04-18T20:38:38Z
position: 20
---

## Notes
Comprehensive usage dashboard for business owners to monitor customer activity: bandwidth usage, concurrent streams, watch time, device connections. Individual customers can see their own usage stats. Helps with plan enforcement and billing.

## Checklist
- [x] Create usage_logs table tracking: customer_id, timestamp, bandwidth_mb, concurrent_streams, device_info
- [x] Build business analytics dashboard with charts: total bandwidth, active users, peak usage times
- [x] Create per-customer usage detail view for business owners
- [x] Add customer usage page showing their own stats and limits
- [x] Implement usage alerts for approaching plan limits
- [x] Add export capability for usage reports (CSV)