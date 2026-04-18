---
title: Design system & shared components
status: done
priority: urgent
type: feature
tags: [design, components]
created_by: agent
created_at: 2026-04-18T19:17:45.596688
position: 2
---

## Notes
Comprehensive dark theme design system with Plus Jakarta Sans headings and Work Sans body. Shared UI components for consistent data presentation across all dashboards.

## Checklist
- [x] Update globals.css: deep dark backgrounds, vibrant cyan accents, Plus Jakarta Sans + Work Sans fonts
- [x] Configure tailwind.config.ts: register custom font families
- [x] Create StatusBadge component (active, suspended, trial, paid, overdue badges)
- [x] Create MetricCard component (dashboard KPI cards with icons, trends)
- [x] Create DataTable component (sortable, filterable, pagination)
- [x] Create EmptyState component (no data placeholders)