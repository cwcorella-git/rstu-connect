---
date: 2025
author: Reno Sparks Tenants Union
tags:
  - RSTU
  - organizing
title: "Property Data Gaps"
---
# Property Data Gaps

Data fields organizers are tracking manually that the app doesn't support yet.

## From Organizer Spreadsheets

| Field | Example | Priority |
|-------|---------|----------|
| Habitability | "cockroach complaints", "bad reviews" | High |
| Utilities | "Utilities included" | Medium |
| Income Restricted | yes/no | High |
| Subsidized | Section 8, LIHTC, etc. | High |

## Missing from Database

| Field | Source | Notes |
|-------|--------|-------|
| Bedrooms/Bathrooms | Apartments.com, Zillow | Per-unit breakdown |
| Studio designation | Listing sites | Unit type |
| Building count | Manual research | "3 buildings, 48 units" |

## Already Have

| Field | DB Column | App Field |
|-------|-----------|-----------|
| Assessed Value | `total_assessed_value` | `value` |
| Year Built | `year_built` | `yearBuilt` |
| Square Footage | `sqft` | `sqft` |
| Coordinates | `wgs84_lat/lon` | `lat/lon` |

## Implementation Ideas

1. **Organizer Notes Table** - New SQLite table or JSON file for community-contributed data
2. **Canvassing Form** - Add fields to UnitTracker for habitability, utilities
3. **Income Restricted Flag** - Could scrape from HUD/LIHTC databases
4. **Apartments.com Integration** - Scrape unit mix data (blocked, need workaround)

## Source Files

- `~/Downloads/Apartments near Virginia Lake.xlsx` - Virginia Lake canvassing data
- `data/databases/main_properties.db` - Washoe County assessor data
