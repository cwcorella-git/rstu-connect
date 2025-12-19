# RSTU Connect Project State Snapshot
**Date:** November 13, 2025
**Time:** ~21:15 UTC
**Status:** In transition to remote server
**Last Known Location:** ~/Projects/MAKE-SENSE-OF on local machine

---

## Executive Summary

RSTU Connect is a **tenant organizing coordination platform** with a minimal two-column dashboard interface running on Neocities. We are in the middle of **Phase 1: Data Pipeline Setup** to add 47 verified properties from the Washoe County database.

**Current Activity:** Moving development from local machine to remote server for heavy data processing.

---

## Completed Work ✅

### UI/Dashboard (Live on Neocities)
- ✅ **Two-column minimal dashboard layout**
  - Left (40%): Searchable building list
  - Right (60%): Embedded Matrix/Element chat viewer
  - Building names, addresses, status badges
  - Click to select, chat loads inline without page navigation

- ✅ **Professional minimal design**
  - White background, dark text
  - Red (#cc0000) accents only
  - Responsive, clean typography
  - No flashy hero sections or banners
  - Feels like a practical organizing tool

- ✅ **Navigation simplified**
  - Header: RSTU Connect, Home | Toolkit | Help | Main site
  - Footer: Minimal (main site link, contact, copyright)
  - Removed global navigation bloat

- ✅ **3 sample buildings** (working proof of concept)
  - Sierra Vista Apartments
  - Redfield Ridge
  - Downtown Lofts

### Data Infrastructure
- ✅ **Coordinate Transformation Script** (`scripts/transform_coordinates.py`)
  - Converts Nevada State Plane (NAD83) → WGS84 lat/lon
  - Batch processes 1,000 at a time
  - Progress reporting every 1,000 properties
  - Spot-check verification built in
  - **Status:** Killed after ~21 minutes (unknown % complete)
  - **Can be resumed:** Script is idempotent and safe to re-run

- ✅ **Property Extraction Script** (`scripts/extract_properties.py`)
  - Implements stratified sampling of 47 properties
    - 15 large multi-unit (20-100 units)
    - 15 medium multi-unit (5-19 units)
    - 12 corporate single-family (portfolio size 5+)
    - 5 small landlords (non-corporate)
  - Exports to CSV for manual verification
  - Ready to execute

- ✅ **Curated Database Script** (`scripts/create_curated_buildings.py`)
  - Creates `curated_buildings.db` SQLite database
  - Schema includes: address, owner, units, year built, sqft, value, coordinates, Matrix info, verification tracking, mock data flags
  - Includes 3 sample buildings (2 real + 1 clearly marked mock)
  - Ready to execute

### Documentation
- ✅ **NEOCITIES_SITE_STRATEGY.md** (5,000+ words)
  - Clear differentiation from main site
  - Phase roadmap
  - Success metrics
  - Decision log

- ✅ **PROPERTY_DATABASE_IMPLEMENTATION.md** (4,500+ words)
  - Three approaches for property search
  - Recommended hybrid approach (JSON + Fuse.js + pre-generated pages)
  - Coordinate transformation solution
  - File storage estimates

- ✅ **MATRIX_INTEGRATION_GUIDE.md** (4,000+ words)
  - Room setup instructions
  - Access control for verification
  - Moderation tools
  - Security considerations
  - Long-term evolution

- ✅ **BUILDING_VERIFICATION_GUIDE.md** (NEW - comprehensive)
  - 4-step verification process (address, owner, details, coordinates)
  - Uses Google Maps, Nevada SOS, Google search
  - Decision tree for keep/modify/remove
  - Example verification spreadsheet
  - Time estimates (3-5 min per property, 3-4 hours total)

---

## In-Progress Work ⏳

### Coordinate Transformation (Incomplete)
- **What:** Transform 192,463 Washoe County properties from Nevada State Plane coordinates to WGS84
- **Why:** Static site needs standard lat/lon for mapping; database has State Plane only
- **Status:** KILLED after ~21 minutes (unknown completion %)
- **Location:** `data/databases/washoe_parcels.db`
- **Script:** `scripts/transform_coordinates.py`
- **Can Resume:** YES - Script is idempotent
  ```bash
  python3 scripts/transform_coordinates.py
  ```
- **What Script Does:**
  1. Tests connection to washoe_parcels.db
  2. Tests transformation with known address
  3. Adds `wgs84_lat`, `wgs84_lon` columns if needed
  4. Transforms all 192,463 properties in batches of 1,000
  5. Prints progress: `[i/192,463] X.X% complete`
  6. Commits every 1,000 rows (safe checkpoint)
  7. Spot-checks 10 random properties
  8. Verifies coordinates are in Reno area (39.5°N, 119.8°W)
- **Database Safety:**
  - SQLite transaction commits every 1,000 rows
  - Partial updates are safe
  - Can safely re-run - already transformed rows just update in place

---

## Pending Work (Next Steps) 📋

### Phase 1: Complete Data Pipeline (Order of Operations)

**1. Resume Coordinate Transformation**
```bash
python3 scripts/transform_coordinates.py
# Expected time: 20-30 minutes for full 192,463 properties
# Output: washoe_parcels.db now has wgs84_lat, wgs84_lon columns
```

**2. Extract 47 Properties**
```bash
python3 scripts/extract_properties.py
# Expected time: 2-3 minutes
# Output: data/extracted_47_properties.csv
# Contains: 15 large, 15 medium, 12 corporate SF, 5 small landlords
```

**3. Manual Verification (You will do this)**
- Open CSV in spreadsheet
- Follow 4-step process from BUILDING_VERIFICATION_GUIDE.md
- Verify: address, owner, details, coordinates
- Fill columns: address_verified, owner_verified, details_verified, coords_verified
- Add notes for any issues
- Save as: `extracted_47_properties_VERIFIED.csv`
- Expected time: 3-4 hours
- Tools needed: Google Maps, Nevada SOS search, Zillow, Google

**4. Create Curated Database**
```bash
python3 scripts/create_curated_buildings.py --csv extracted_47_properties_VERIFIED.csv
# Expected time: 2-3 minutes
# Output: data/curated_buildings.db (verified 47 properties + 3 samples)
```

**5. Update UI to Load from Database**
- Modify `apps/web/src/app/page.tsx`
- Load buildings from SQLite instead of hardcoded array
- Implement activity-based status system:
  - "Active" - messages in last 7 days (green)
  - "Forming" - messages in last 30 days (blue)
  - "Quiet" - no recent messages >30 days (gray)
  - "No Room" - Matrix room not set up (yellow)

**6. Create Metadata Overlay Component**
- New component: `apps/web/src/components/BuildingMetadata.tsx`
- Displays in bottom-left corner of chat area
- Shows: Owner name, portfolio size, units, year built, value, website (if available)
- Design mockup ready

**7. Build & Deploy**
```bash
npm run build
# Copy out/ to rstu-connect/
# Git commit, push
# Neocities auto-deploys via GitHub Actions
```

---

## Critical Files & Locations

### Databases (Large - ~945 MB total, NOT in Git)
```
data/databases/
├── washoe_parcels.db (380 MB) ⭐ MAIN - 192,463 properties
├── spatial_properties.db (41 MB)
├── property_intelligence.db (91 MB)
├── organizing_targets.db (800 KB)
├── landlord_accountability.db (2.9 MB)
└── ... (14+ more databases)
```

### Scripts (Ready to Run)
```
scripts/
├── transform_coordinates.py ⭐ (RESUME THIS FIRST)
├── extract_properties.py
└── create_curated_buildings.py
```

### Documentation
```
docs/
├── CURRENT_STATE_2025-11-13.md ⭐ (YOU'RE READING THIS)
├── NEOCITIES_SITE_STRATEGY.md
├── PROPERTY_DATABASE_IMPLEMENTATION.md
├── MATRIX_INTEGRATION_GUIDE.md
├── BUILDING_VERIFICATION_GUIDE.md
└── ... (90+ other docs)
```

### Source Code
```
apps/web/src/
├── app/
│   ├── page.tsx ⭐ (DASHBOARD - needs update to load from SQLite)
│   ├── layout.tsx (minimal header/footer)
│   ├── properties/page.tsx
│   ├── resources/page.tsx
│   └── ... (other pages)
└── components/
    └── BuildingMetadata.tsx (NEW - to be created)
```

### Deployed Site
```
rstu-connect/ (Git repository)
├── index.html (live on Neocities)
├── _next/ (Next.js static assets)
├── properties/ (static page)
├── resources/ (organizing toolkit)
└── ... (other static files)
```

---

## Data Pipeline Architecture

```
Washoe County Assessor Data (192,463 properties)
        ↓
washoe_parcels.db (State Plane coordinates)
        ↓
transform_coordinates.py (CURRENT STEP - Killed after ~21 min)
        ↓
washoe_parcels.db (with WGS84 lat/lon added)
        ↓
extract_properties.py (Stratified sampling)
        ↓
extracted_47_properties.csv (47 property candidates)
        ↓
MANUAL VERIFICATION (You - 3-4 hours, uses spreadsheet tools)
        ↓
extracted_47_properties_VERIFIED.csv (47 verified properties)
        ↓
create_curated_buildings.py
        ↓
curated_buildings.db (SQLite - 47 verified + 3 samples)
        ↓
page.tsx (loads from curated_buildings.db)
        ↓
RSTU Connect Dashboard (Live on Neocities)
```

---

## Decisions Made

### Design Decisions ✅
- **Two-column layout** - Minimal, utilitarian, focuses on organizing
- **Activity-based status** - Badges reflect Matrix chat activity (Active/Forming/Quiet/No Room)
- **Metadata overlay** - Building details shown in bottom-left of chat area
- **Stratified sampling** - Diverse mix of property sizes/types (not random)

### Technical Decisions ✅
- **Stratified by:** Large (20-100), Medium (5-19), Corporate SF (1-4, portfolio 5+), Small (2-4, non-corporate)
- **Coordinates:** Transform State Plane to WGS84 for web mapping
- **Database:** SQLite for simplicity, portability, queryability
- **Mock data flagging:** `is_mock_data` boolean - clear for testing
- **Verification process:** 4-step checklist (address, owner, details, coords)

### Data Decisions ✅
- **Source:** Washoe County Assessor (verified, real data)
- **Database:** washoe_parcels.db (380 MB, 192,463 properties)
- **Selection:** Stratified sample of 47 properties
- **Verification:** Manual spreadsheet + online tools (Google Maps, Nevada SOS, Zillow)
- **Storage:** curated_buildings.db (small, easily deployed)

---

## Known Issues & Caveats

### Current
- ⚠️ Coordinate transformation incomplete (killed at ~21 minutes)
  - Unknown how many properties transformed
  - **Safe to resume** - script checks for existing columns
  - Just re-run: `python3 scripts/transform_coordinates.py`

### Technical Debt
- ⚠️ Large databases (945 MB) not in Git (by design)
  - Included `.gitignore` to prevent large commits
  - Need to transfer separately or re-download
  - Documented in plan

- ⚠️ Mock data clearly marked but visible
  - 1 of 3 sample properties is test data
  - Will be replaced with real verified properties
  - Warning banner will display for mock data

- ⚠️ Matrix room IDs are placeholders
  - Currently hardcoded as `#sierra-vista:matrix.org`
  - Will be updated with actual room IDs once created
  - Verification process includes Matrix setup

---

## How to Resume from Remote Server

### Prerequisites (on remote server)
```bash
# 1. Clone repo
git clone https://github.com/cwcorella-git/rstu-connect.git
cd rstu-connect

# 2. Verify this file exists
cat docs/CURRENT_STATE_2025-11-13.md

# 3. Install Python dependencies
pip3 install pyproj

# 4. Transfer databases (via SCP or re-download)
# See Phase 5 in SERVER_TRANSFER_PLAN.md
```

### Resume Coordinate Transformation
```bash
# Just run the script - it's idempotent
python3 scripts/transform_coordinates.py

# Monitor output:
# [1,000/192,463] 0.5% complete
# [2,000/192,463] 1.0% complete
# ...
# ✓ TRANSFORMATION COMPLETE
```

### Then Follow Pipeline
```bash
# Step 1: Extract 47 properties
python3 scripts/extract_properties.py
# Output: data/extracted_47_properties.csv

# Step 2: YOU verify manually (3-4 hours)
# Use: docs/BUILDING_VERIFICATION_GUIDE.md
# Output: extracted_47_properties_VERIFIED.csv

# Step 3: Create curated database
python3 scripts/create_curated_buildings.py

# Step 4: Update UI
# Modify: apps/web/src/app/page.tsx
# Add component: apps/web/src/components/BuildingMetadata.tsx

# Step 5: Deploy
npm run build
git add, commit, push
```

---

## Environment Details

### Original Development Environment (Local)
- OS: Linux
- Python: 3.x (with pyproj installed)
- Node: Recent (for Next.js build)
- Git: Configured
- Browser: Any modern browser for Neocities testing

### Remote Server Requirements
- OS: Linux preferred (commands assume Linux/macOS)
- Python: 3.8+ (for pyproj)
- Disk space: ~2 GB (for databases)
- Network: Can access GitHub, Google Maps, Nevada SOS websites

---

## Timeline Estimate to Completion

From remote server resumption:
- Coordinate transformation: 20-30 minutes
- Extract properties: 2-3 minutes
- Manual verification: **3-4 hours** (you do this)
- Create database: 2-3 minutes
- Update UI: 1-2 hours
- Build & deploy: 10 minutes

**Total:** ~26-40 hours (mostly waiting on manual verification)

---

## Questions? References?

### Key Documentation
- Implementation roadmap: `PROPERTY_DATABASE_IMPLEMENTATION.md`
- Chat integration: `MATRIX_INTEGRATION_GUIDE.md`
- Site strategy: `NEOCITIES_SITE_STRATEGY.md`
- Verification process: `BUILDING_VERIFICATION_GUIDE.md`

### Quick Start (After Transfer)
```bash
cat docs/CURRENT_STATE_2025-11-13.md  # Read state snapshot
python3 scripts/transform_coordinates.py  # Resume here
```

### Support
If stuck or questions arise:
1. Check relevant `.md` file in docs/
2. Review script comments
3. Consult verification guide for manual steps

---

**Last Updated:** 2025-11-13 21:15 UTC
**Next Action:** Transfer to remote server and resume coordinate transformation
**Status:** Ready to resume from script resumption point
