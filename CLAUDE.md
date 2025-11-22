# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

The Reno-Sparks Tenants Union (RSTU) Connect is a Next.js static website with embedded chat for tenant organizing.

**Live Site:** https://rstu-connect.neocities.org/

**Key Features:**
- Searchable building directory (10 largest apartment complexes)
- Per-building chat rooms using Tlk.io (free, anonymous, no login required)
- Property intelligence databases for strategic organizing
- Mobile-first design for field organizers

## Architecture

### Single-Site Deployment (Neocities)
- **Technology:** Next.js 14 static export
- **Hosting:** Neocities (free tier)
- **Deployment:** GitHub Actions (automatic on push to main)
- **Chat:** Tlk.io embedded iframes (no backend needed)

**Why Tlk.io?**
- ✅ No login required - zero friction for tenants
- ✅ Mobile-friendly - works great on phones
- ✅ FREE unlimited rooms
- ✅ Simple iframe embedding
- ✅ No CSRF cookie errors or authentication issues

## Repository Structure

### Public Website Files (Deployed to Neocities)
- `index.html`, `404.html` - Static HTML pages (built from Next.js)
- `get-started/`, `join/`, `help/`, `about/`, `properties/`, `resources/` - Page directories
- `_next/` - Next.js static assets (CSS, JS, fonts)
- `assets/` - Images and media files

### Next.js Source Code
- `src/app/` - Next.js App Router pages
  - `layout.tsx` - Root layout with header/footer
  - `page.tsx` - Homepage with two-column dashboard (building list + chat)
  - `globals.css` - Tailwind CSS styles
- `src/components/` - React components
  - `BuildingList.tsx` - Left sidebar (40% width) with searchable building cards
  - `BuildingCard.tsx` - Individual building card component
  - `BuildingChatEmbed.tsx` - Right panel (60% width) with Tlk.io chat iframe
  - `BuildingMetadata.tsx` - Building info overlay
- `src/lib/` - Utility functions
  - `getBuildingsData.ts` - Building interface and database functions

### Data & Intelligence Platform (Not Public)
- `data/` - Property databases and organizing intelligence
  - `databases/` - SQLite databases
    - `main_properties.db` (398MB) - PRIMARY DATABASE for Next.js
    - `washoe_parcels.db` (398MB) - Source data (192,463 properties)
    - `organizing_campaigns.db`, `property_intelligence.db`, etc.
  - `organizing/` - Campaign tracking databases
  - `reports/` - Generated JSON reports and analysis
- `scripts/` - Python and shell scripts
  - `deploy.sh` - Build Next.js and copy static files to root directory
  - Python scripts for property data analysis
- `docs/` - Documentation, meeting notes, legislation tracking

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
# Runs: npm run build && bash scripts/deploy.sh
# 1. Builds Next.js app to out/
# 2. Removes old static files from root
# 3. Copies out/* to root directory
# 4. Files ready for git commit and push
```

**Automatic deployment:**
```bash
git add .
git commit -m "Update site"
git push origin main
# GitHub Actions builds and deploys to Neocities automatically
```

### Data Processing (Python Scripts)

**Property data extraction:**
```bash
# Extract stratified sample of properties
python3 scripts/extract_properties.py

# Transform coordinates from State Plane to WGS84
python3 scripts/transform_coordinates.py
```

**Database access:**
```bash
sqlite3 data/databases/main_properties.db

# Common queries:
# .tables
# .schema parcels
# SELECT COUNT(*) FROM parcels;
```

## Chat System: Tlk.io

### How It Works

Each building has a unique Tlk.io chat room:
- **URL Format:** `https://tlk.io/rstu-{building-slug}`
- **Example:** `https://tlk.io/rstu-2500-e-2nd-st`
- **No accounts needed** - Anyone can join instantly
- **Mobile-optimized** - Sliding panels on phones
- **Persistent** - Message history retained

### Adding New Buildings

**Option 1: Hardcode building data (current method)**
```typescript
// In src/app/page.tsx, add to buildings array:
{
  apn: "1234567",
  address: "123 MAIN ST, RENO, NV 89501",
  owner: "PROPERTY OWNER LLC",
  units: 500,
  value: 10000000,
  yearBuilt: null,
  sqft: null,
  chatSlug: "rstu-123-main-st"  // Creates https://tlk.io/rstu-123-main-st
}
```

**Option 2: Query from database (future)**
```typescript
// Use getBuildingsData.ts to query main_properties.db at build time
// Generate chatSlug from address automatically
```

### Chat Slug Naming Convention

Generate URL-safe slugs from building addresses:
- Remove special characters, spaces → hyphens
- Lowercase everything
- Prefix with `rstu-` for branding
- Example: "2500 E 2ND ST" → `rstu-2500-e-2nd-st`

## Architecture & Data Model

### Build-time data flow:
```
Building data in page.tsx (hardcoded)
  ↓
Next.js builds static HTML/CSS/JS
  ↓
out/ directory → deploy.sh → root directory → Neocities
```

**Deployment flow (deploy.sh):**
```bash
npm run build                     # Build Next.js to out/
rm -rf index.html _next 404 ...   # Remove old static files from root
cp -r out/* ./                    # Copy new build to root
git add . && git commit && git push  # Deploy via GitHub Actions
```

**Components:**
- `src/app/layout.tsx` - Root layout with header/footer
- `src/app/page.tsx` - Homepage with building list + chat panels
- `src/components/BuildingList.tsx` - Left sidebar (40% width)
- `src/components/BuildingChatEmbed.tsx` - Right panel (60% width) with Tlk.io iframe
- `src/components/BuildingMetadata.tsx` - Overlay with building details

**Current Implementation:**
- 10 buildings with Tlk.io chat rooms hardcoded in page.tsx
- Client-side search/filter using React state
- Tlk.io chat embedded via iframe (no authentication required)
- 100% static - no backend, no runtime database queries

**Future Implementation:**
- Query `main_properties.db` at build time
- Generate building list dynamically from database
- Auto-generate chat slugs from addresses

### Property Data Pipeline

```
Washoe County Open Data API
  → washoe_parcels.db (192,463 parcels)
  → Python processing scripts
  → main_properties.db (primary database)
  → Organizing intelligence databases
```

**Key Databases:**

1. **main_properties.db** (398MB)
   - PRIMARY DATABASE used by Next.js build process
   - Contains processed property data
   - Schema: parcels table with columns:
     - `apn`, `property_address`, `owner_name`, `owner_address`
     - `units`, `year_built`, `total_assessed_value`, `building_square_feet`
     - `wgs84_lat`, `wgs84_lon` (GPS coordinates)

2. **washoe_parcels.db** (398MB)
   - Source data from Washoe County (192,463 properties)
   - Coordinate systems: Nevada State Plane (EPSG:2769) → WGS84 (EPSG:4326)
   - 99.97% data quality (192,398 complete owner records)

**Organizing Intelligence Databases:**
- `organizing_campaigns.db` - Campaign tracking
- `property_intelligence.db` - Strategic property analysis
- `landlord_accountability.db` - Corporate landlord networks
- `organizing_targets.db` - Prioritized organizing targets

### Corporate Landlord Analysis

The platform identifies corporate landlord portfolios:
- 48,636 corporate entities tracked (34.2% of all owners)
- 627 large portfolios (10+ properties) identified
- Priority scoring system (1-10) for organizing targets

### Static Website Tech Stack

- **Framework:** Next.js 14 App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS with custom RSTU red (#cc0000)
- **State Management:** React useState for UI interactions
- **Data:** Hardcoded building list (10 properties with Tlk.io rooms)
- **Chat:** Tlk.io embedded iframes (no authentication)
- **Deployment:** GitHub Actions → Neocities
- **Output:** 100% static HTML/CSS/JS (no backend)

## Working with This Codebase

### Building Data Structure

```typescript
interface Building {
  apn: string;              // Assessor Parcel Number (unique ID)
  address: string;          // Property address
  owner: string;            // Owner name
  units: number;            // Number of housing units
  value: number;            // Assessed value
  yearBuilt: number | null; // Year built
  sqft: number | null;      // Building square feet
  chatSlug: string;         // Tlk.io room slug (e.g., "rstu-2500-e-2nd-st")
}
```

### Content Updates

For the public website:
1. Edit React components in `src/`
2. Run `npm run build` to generate static HTML
3. Run `npm run deploy` to copy files to root
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

- No plaintext addresses in public datasets
- Tlk.io chats are anonymous (optional Twitter/Facebook login for avatars)
- Property databases for internal organizing use only
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
