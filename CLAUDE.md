# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

The Reno-Sparks Tenants Union (RSTU) project has two distinct components:

1. **Static Public Website** (Currently Deployed): A Next.js-generated static HTML site hosted on Neocities at https://rstu-connect.neocities.org/
2. **Organizing Intelligence Platform** (In Development): A comprehensive tenant organizing platform with property databases, mapping, and organizing tools

## Repository Structure

### Public Website Files (Deployed to Neocities)
- `index.html`, `404.html` - Static HTML pages
- `get-started/`, `join/`, `help/`, `about/`, `properties/`, `resources/` - Page directories
- `_next/` - Next.js static assets
- `assets/` - Images and media files

### Data & Intelligence Platform (Not Public)
- `data/` - Property databases and organizing intelligence
  - `databases/` - Main SQLite databases including `washoe_parcels.db` (192,463 properties)
  - `organizing/` - Campaign tracking and property intelligence databases
  - `reports/` - Generated JSON reports and analysis
  - `washoe_county_production/`, `nevada_statewide_expanded/` - Regional data
- `scripts/` - Python data processing scripts
  - `extract_properties.py` - Stratified property sampling for organizing targets
  - `transform_coordinates.py` - Convert Nevada State Plane coordinates to WGS84
  - `create_curated_buildings.py` - Create curated building database
- `docs/` - Extensive documentation, meeting notes, legislation tracking, and organizing guides

## Development Commands

### Next.js Application

**Install dependencies:**
```bash
npm install
```

**Development server:**
```bash
npm run dev
# Site available at http://localhost:3000
```

**Build static export:**
```bash
npm run build
# Outputs to out/ directory
# Generates static HTML/CSS/JS for Neocities
```

**Deploy to Neocities:**
```bash
npm run deploy
# Runs build, copies files to root, ready for git push
```

**Deployment (automatic via GitHub Actions):**
```bash
git add .
git commit -m "Update site"
git push origin main
# GitHub Actions builds and deploys to Neocities
```

### Data Processing (Python Scripts)

**Prerequisites:**
```bash
pip install pyproj  # Required for coordinate transformation
```

**Property data extraction:**
```bash
# Extract stratified sample of properties for organizing
python3 scripts/extract_properties.py

# Transform coordinates from State Plane to WGS84
python3 scripts/transform_coordinates.py

# Create curated buildings database
python3 scripts/create_curated_buildings.py
```

**Database access:**
```bash
# Query the main property database
sqlite3 data/databases/washoe_parcels.db

# Common queries:
# .tables                    # List all tables
# .schema parcels           # View table structure
# SELECT COUNT(*) FROM parcels;  # Count total properties
```

## Architecture & Data Model

### Next.js Static Site Architecture

**Build-time data flow:**
```
Database (main_properties.db)
  ↓ (build time only)
getBuildingsData.ts queries SQLite
  ↓
Building data hardcoded in page.tsx (temporary)
  ↓
Next.js builds static HTML/CSS/JS
  ↓
out/ directory → Neocities
```

**Components:**
- `src/app/layout.tsx` - Root layout with header/footer
- `src/app/page.tsx` - Homepage with two-column dashboard
- `src/components/BuildingList.tsx` - Left sidebar (40% width)
- `src/components/MatrixChatEmbed.tsx` - Right panel (60% width)
- `src/components/BuildingMetadata.tsx` - Overlay with building details
- `src/lib/getBuildingsData.ts` - Database queries (currently unused, for future)

**Current Implementation:**
- 10 buildings with Matrix rooms hardcoded in page.tsx
- Client-side search/filter using React state
- Matrix chat embedded via iframe
- 100% static - no backend, no runtime database queries

### Property Data Pipeline
The organizing platform is built around a comprehensive property intelligence system:

**Data Flow:**
```
Washoe County Open Data API
  → washoe_parcels.db (192,463 parcels)
  → Python processing scripts
  → Organizing intelligence databases
  → Strategic target identification
```

**Key Database: washoe_parcels.db**
- Contains 192,463 property records from Washoe County
- Fields include: APN, property_address, owner_name, owner_address, units, year_built, assessed_value
- Coordinate systems: Nevada State Plane (EPSG:2769) → WGS84 (EPSG:4326)
- 99.97% data quality (192,398 complete owner records)

**Organizing Intelligence Databases:**
- `organizing_campaigns.db` - Campaign tracking and management
- `property_intelligence.db` - Strategic property analysis
- `landlord_accountability.db` - Corporate landlord networks
- `organizing_targets.db` - Prioritized organizing targets

### Corporate Landlord Analysis
The platform identifies corporate landlord portfolios for strategic organizing:
- Top target: TOLL NORTH RENO LLC (534 properties, 92 units)
- 48,636 corporate entities tracked (34.2% of all owners)
- 627 large portfolios (10+ properties) identified
- Priority scoring system (1-10) for organizing targets

### Static Website Architecture
Next.js 14 with TypeScript, exported as static HTML:
- **Framework:** Next.js 14 App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS with custom RSTU red (#cc0000)
- **State Management:** React useState for UI interactions
- **Data:** Hardcoded building list (10 properties with Matrix rooms)
- **Database:** SQLite (build-time only, not deployed)
- **Deployment:** GitHub Actions → Neocities
- **Output:** 100% static HTML/CSS/JS (no backend)

## Working with This Codebase

### Data Processing
When working with property data:
1. Main database is `data/databases/washoe_parcels.db` (~398MB)
2. Python scripts use SQLite3 directly (no ORM)
3. Coordinate transformations use `pyproj` library with EPSG:2769 → EPSG:4326
4. All scripts assume paths relative to project root

### Content Updates
For the public website:
1. Edit HTML files directly in root and subdirectories
2. Blog posts are markdown files in `docs/`
3. Images go in `assets/`
4. Changes push automatically to Neocities via GitHub Actions

### Database Schema Patterns
Property databases follow consistent patterns:
- `apn` - Assessor Parcel Number (unique identifier)
- `property_address` - Physical location
- `owner_name` - Extracted from FIRSTNAME + LASTNAME fields
- `owner_address` - Mailing address for organizing contact
- `units` - Number of housing units
- `wgs84_lat`, `wgs84_lon` - GPS coordinates for mapping

## Security & Privacy Considerations

The organizing platform implements community-first security:
- No plaintext addresses in public datasets
- Cryptographic address verification system (planned)
- Three-tier progressive security model
- Community verification workflows
- Legal protections under Nevada Revised Statutes Chapter 118A

**Important:** The full organizing platform with databases and intelligence tools is for internal organizing use only and should never be deployed publicly without security review.

## Legal Framework

Nevada has strong tenant organizing protections:
- NRS Chapter 118A explicitly protects tenant union organizing
- Anti-retaliation provisions for organizing activities
- 14-day repair timeline creates collective action leverage
- Civil remedies and district attorney enforcement

## Mission & Values

"Homes for People, Not for Profit" - The platform serves organizing, organizing doesn't serve the platform.

Core principles:
- Community ownership over technical sophistication
- Security through simplicity
- Data as organizing tool, never for surveillance
- Mobile-first field organizing
- Bilingual operations (English/Spanish)
