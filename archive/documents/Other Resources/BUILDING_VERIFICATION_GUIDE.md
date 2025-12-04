# Building Verification Guide

**Status**: Phase 3 - Property Verification Process
**Last Updated**: November 13, 2025

---

## Overview

This guide documents the process for manually verifying 47 properties extracted from the Washoe County Assessor database before adding them to RSTU Connect.

---

## Verification Steps

### Step 1: Address Verification

**Goal**: Confirm the property address is correct and the building actually exists.

**How to verify:**
1. Open Google Maps (https://maps.google.com)
2. Search for the address from the spreadsheet
3. Zoom to street view and look at the building
4. Confirm unit count matches the database (visible units)
5. Check that it's actually in Reno/Washoe County

**What to look for:**
- ✓ Building exists at the address
- ✓ Building matches the unit count
- ✓ It's a residential property
- ✓ Accessible by road (not in middle of park/private area)

**What to note:**
- Address off-by-one errors (e.g., 1234 vs 1235)
- Building demolished or converted to different use
- Address is for empty lot or non-residential property

**Spreadsheet column**: `address_verified` (Y/N)

---

### Step 2: Owner Verification

**Goal**: Confirm the owner name is correct and actually owns the property.

**How to verify:**
1. Go to Nevada Secretary of State: https://sos.nv.gov/
2. Search "Filings" section for the owner name
3. For corporate entities (LLC, Inc, etc.):
   - Search by exact name from spreadsheet
   - Confirm business is active
   - Check entity address and key officers
4. For individuals:
   - Confirm ownership via Google search
   - Check if it's a person (not fake name)
5. Cross-reference with Zillow or Apartments.com

**What to look for:**
- ✓ Corporate entity is registered and active
- ✓ Business address is in Nevada
- ✓ For individuals, it's a real person name
- ✓ Portfolio size makes sense (multiple properties if claimed)

**What to note:**
- Typos in owner name
- Business registered in different state
- Business dissolved or inactive
- No online presence for supposedly large landlord

**Spreadsheet column**: `owner_verified` (Y/N)

---

### Step 3: Building Details Verification

**Goal**: Confirm year built, unit count, and building size are reasonable.

**How to verify:**
1. Google Street View to count units visually
2. Google the building name + "apartments" to find listing
3. Check Zillow, Apartments.com, or management company website
4. For year built: Check if building looks old enough
5. For square footage: Does it match unit count and building size?

**What to look for:**
- ✓ Unit count visible and matches database
- ✓ Year built seems reasonable (not future date)
- ✓ Square footage makes sense for unit count
- ✓ Building condition matches age

**What to note:**
- Unit count significantly different from database
- Year built is in future or unreasonable
- Building is tiny but listed as 20+ units
- Obvious discrepancies with reality

**Spreadsheet column**: `details_verified` (Y/N)

---

### Step 4: Coordinate Verification

**Goal**: Confirm latitude/longitude place the property at the correct location.

**How to verify:**
1. Google Maps: Right-click on address → Copy coordinates
2. Compare with coordinates in spreadsheet
3. Enter coordinates in Google Maps to verify location
4. Should show the correct building

**Quick check:**
- Reno coordinates should be around: 39.5°N, 119.8°W
- Sparks coordinates should be around: 39.5°N, 119.7°W
- Any coordinates outside Nevada (like 35°N or -115°) are wrong

**What to look for:**
- ✓ Coordinates land on/near the building
- ✓ Building is clearly visible at those coordinates
- ✓ Coordinates are in Washoe County (not other states)

**What to note:**
- Coordinates place building in ocean/wrong state
- Coordinates are obviously wrong (>1 mile off)
- Coordinates point to empty lot next to building

**Spreadsheet column**: `coords_verified` (Y/N)

---

## Verification Spreadsheet Template

**File**: `extracted_47_properties.csv`

**Columns to fill in:**

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| apn | TEXT | Property ID (read-only) | 102-001-01 |
| address | TEXT | Street address (read-only) | 1234 Marina Drive |
| owner_name | TEXT | Owner name (read-only) | SIERRA VISTA LLC |
| units | INT | Unit count (read-only) | 24 |
| year_built | INT | Year built (read-only) | 1985 |
| sqft | INT | Square footage (read-only) | 18500 |
| assessed_value | INT | Property value (read-only) | 2100000 |
| lat | DECIMAL | Latitude (read-only) | 39.5299 |
| lon | DECIMAL | Longitude (read-only) | -119.8147 |
| category | TEXT | Property category (read-only) | large |
| **address_verified** | Y/N | **Fill this in** | Y |
| **owner_verified** | Y/N | **Fill this in** | Y |
| **details_verified** | Y/N | **Fill this in** | Y |
| **coords_verified** | Y/N | **Fill this in** | Y |
| **notes** | TEXT | **Fill this in** | Address is off by 1 house number |

---

## Verification Checklist

### Before Starting:
- [ ] Have spreadsheet open
- [ ] Have Google Maps open
- [ ] Have Nevada SOS website open
- [ ] Have 2-3 hours uninterrupted time

### For Each Property:
- [ ] Step 1: Address verification (Google Maps Street View)
- [ ] Step 2: Owner verification (Nevada SOS)
- [ ] Step 3: Details verification (visual inspection)
- [ ] Step 4: Coordinates verification (map placement)
- [ ] Add notes for any issues found
- [ ] Mark all four columns Y or N

### After All 47 Properties:
- [ ] Review entries with any "N" marks
- [ ] Decide: Keep, Modify, or Remove property?
- [ ] Count total verified: target = 47 properties all with all Y's
- [ ] Save spreadsheet with filename: `extracted_47_properties_VERIFIED.csv`

---

## Decision Tree: Keep or Remove?

If a property fails verification, decide:

```
Fails address verification (building doesn't exist)?
  → REMOVE from dataset

Fails owner verification (no such business/owner)?
  → REMOVE from dataset

Fails details verification (significantly different)?
  → MARK "Details Need Update" in notes
  → KEEP but update fields from verification
  → Flag for database update

Fails coordinates verification (way off)?
  → MARK "Coords need fixing" in notes
  → KEEP (coordinates might be fixable)
  → Flag for review

All verifications pass?
  → KEEP, mark all Y's
```

---

## Examples

### Example 1: PASS ALL CHECKS

| Property | Address | Owner | Verified? | Notes |
|----------|---------|-------|-----------|-------|
| APN: 102-001-01 | 1234 Marina Dr | Sierra Vista LLC | ✓ Y/Y/Y/Y | Verified on Google Maps, real business, all details match |

**Action**: Include in final 47

---

### Example 2: ADDRESS DOESN'T EXIST

| Property | Address | Owner | Verified? | Notes |
|----------|---------|-------|-----------|-------|
| APN: 999-999-99 | 9999 Fake St | Nonexistent Corp | N/Y/Y/N | Address doesn't exist in Reno, building demolished, remove |

**Action**: Remove from dataset, extract replacement

---

### Example 3: COORDINATES OFF

| Property | Address | Owner | Verified? | Notes |
|----------|---------|-------|-----------|-------|
| APN: 103-002-02 | 5678 Redfield Way | Redfield Prop | Y/Y/Y/N | Building exists, real owner, details match, but coords place it 0.5 miles away - systematic shift in transformation? |

**Action**: Keep, flag for coordinate review, may be systematic error

---

### Example 4: UNIT COUNT MISMATCH

| Property | Address | Owner | Verified? | Notes |
|----------|---------|-------|-----------|-------|
| APN: 104-003-03 | 8901 Oak Ave | Oak Property | Y/Y/N/Y | Spreadsheet says 24 units but Google Street View shows maybe 12 units visible |

**Action**: Keep, update unit count to 12, note discrepancy

---

## Time Estimates

- **Per property**: 3-5 minutes
- **For 47 properties**: 2.5-4 hours
- **Bulk verification in batches**: Better than doing all in one session

---

## Resources

### Tools:
- Google Maps: https://maps.google.com
- Nevada Secretary of State: https://sos.nv.gov/
- Zillow: https://www.zillow.com
- Apartments.com: https://www.apartments.com
- Property records (public): Contact Washoe County Assessor

### Washoe County Assessor:
- Website: https://www.washoecounty.gov/assessor/
- Phone: (775) 671-5090
- Property search: https://www.washoecounty.gov/assessor/cama/index.php

---

## Quality Assurance

After verification, spot-check:
- 10% of verified properties (5 random ones)
- Re-do verification to ensure consistency
- Look for patterns in verification (all same person verifying?)

---

## Final Output

When complete:
1. Save verified spreadsheet with all "Y/Y/Y/Y" checks
2. Rename file to: `extracted_47_properties_VERIFIED_[DATE].csv`
3. Document any properties removed and why
4. Create summary:
   - 47 properties targeted
   - X properties removed (reasons)
   - X properties modified (reasons)
   - Final count verified

5. Run: `python scripts/create_curated_buildings.py --csv extracted_47_properties_VERIFIED.csv`

---

## Questions?

If verification finds issues:
- Address doesn't exist → Try nearby addresses or check if moved
- Owner doesn't exist → Double-check spelling in Nevada SOS
- Details way off → May be data quality issue from county
- Coordinates wrong → May be systematic transformation error

Document everything in "notes" column!

