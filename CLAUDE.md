# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

The Reno-Sparks Tenants Union (RSTU) project has two distinct components:

1. **Static Public Website** (Currently Deployed): A Next.js-generated static HTML site hosted on Neocities at https://rstu-connect.neocities.org/
2. **Organizing Intelligence Platform** (In Development): A comprehensive tenant organizing platform with property databases, mapping, and organizing tools

## Dual-Site Architecture

The deployed website uses **two separate sites** working together:

### Site 1: RSTU Connect Dashboard (Neocities)
- **URL:** https://rstu-connect.neocities.org/
- **Technology:** Next.js 14 static export
- **Deployment:** GitHub Actions → Neocities
- **Source:** `src/` directory, builds to `out/`

### Site 2: Element Web Chat (Netlify)
- **URL:** https://rstu-element.netlify.app
- **Technology:** Pre-built Element Web v1.12.4 static files
- **Deployment:** Netlify (via `netlify.toml`)
- **Source:** `element-v1.12.4/` directory
- **Purpose:** Matrix chat client embedded in iframes on Site 1

**Why two sites?**
- Neocities doesn't support custom HTTP headers
- Element requires special headers (`X-Frame-Options`, `Content-Security-Policy`) to allow iframe embedding
- Netlify provides header support via `element-v1.12.4/_headers` file
- Site 1 embeds Site 2 using `<iframe>` tags

## Repository Structure

### Public Website Files (Deployed to Neocities)
- `index.html`, `404.html` - Static HTML pages (built from Next.js)
- `get-started/`, `join/`, `help/`, `about/`, `properties/`, `resources/` - Page directories
- `_next/` - Next.js static assets (CSS, JS, fonts)
- `assets/` - Images and media files

### Element Web Deployment (Deployed to Netlify)
- `element-v1.12.4/` - Pre-built Element Web static files
  - `_headers` - Custom headers to allow iframe embedding
  - `config.json` - Element configuration (Matrix homeserver, etc.)
  - `index.html`, `bundles/`, `fonts/`, etc. - Element Web app files
- `netlify.toml` - Netlify deployment configuration

### Next.js Source Code
- `src/app/` - Next.js App Router pages
  - `layout.tsx` - Root layout with header/footer
  - `page.tsx` - Homepage with two-column dashboard (building list + chat)
  - `globals.css` - Tailwind CSS styles
- `src/components/` - React components
  - `BuildingList.tsx` - Left sidebar (40% width) with searchable building cards
  - `BuildingCard.tsx` - Individual building card component
  - `MatrixChatEmbed.tsx` - Right panel (60% width) with Matrix chat iframe
  - `BuildingMetadata.tsx` - Building info overlay
- `src/lib/` - Utility functions
  - `getBuildingsData.ts` - Database queries (build-time only, queries `main_properties.db`)

### Data & Intelligence Platform (Not Public)
- `data/` - Property databases and organizing intelligence
  - `databases/` - SQLite databases
    - `main_properties.db` (398MB) - **PRIMARY DATABASE** used by Next.js build process
    - `washoe_parcels.db` (398MB) - Source data (192,463 properties from Washoe County)
    - `organizing_campaigns.db` - Campaign tracking and management
    - `property_intelligence.db` - Strategic property analysis
    - `landlord_accountability.db` - Corporate landlord networks
    - `organizing_targets.db` - Prioritized organizing targets
  - `organizing/` - Campaign tracking databases
  - `reports/` - Generated JSON reports and analysis
  - `washoe_county_production/`, `nevada_statewide_expanded/` - Regional data
  - `matrix_rooms_created.json` - Log of created Matrix rooms
- `scripts/` - Python and shell scripts
  - `create_matrix_rooms.py` - Create Matrix rooms for properties
  - `export_complexes_for_rooms.py` - Export building data for room creation
  - `extract_properties.py` - Stratified property sampling for organizing targets
  - `transform_coordinates.py` - Convert Nevada State Plane (EPSG:2769) to WGS84 (EPSG:4326)
  - `create_curated_buildings.py` - Create curated building database
  - `deploy.sh` - Build Next.js and copy static files to root directory
  - `get_matrix_token.md` - Instructions for obtaining Matrix access token
- `docs/` - Extensive documentation, meeting notes, legislation tracking, and organizing guides
- `DEPLOY_ELEMENT_TO_NETLIFY.md` - Complete guide for deploying Element to Netlify

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
# 2. Removes old static files from root (index.html, _next, etc.)
# 3. Copies out/* to root directory
# 4. Files are ready for git commit and push
```

**Deployment (automatic via GitHub Actions):**
```bash
git add .
git commit -m "Update site"
git push origin main
# GitHub Actions builds and deploys to Neocities
```

### Matrix Room Creation

**Prerequisites:**
```bash
# Set up Matrix credentials in .env file:
MATRIX_ACCESS_TOKEN=your_token_here
MATRIX_USER_ID=@username:matrix.org

# See scripts/get_matrix_token.md for how to obtain credentials
```

**Create Matrix rooms for buildings:**
```bash
python3 scripts/create_matrix_rooms.py
# 1. Queries main_properties.db for top complexes (20+ units)
# 2. Creates private, encrypted Matrix rooms for each
# 3. Updates database with room IDs and aliases
# 4. Saves results to data/matrix_rooms_created.json
```

**Workflow:**
1. Room names are derived from property addresses (e.g., "1234 Main St Organizing")
2. Aliases are slugified (e.g., `#1234-main-st:matrix.org`)
3. Rooms are created with encryption, invite-only access, and limited history visibility
4. Database columns `matrix_room_id` and `matrix_room_alias` are auto-created if needed
5. Rate limiting: 1 second between requests to avoid Matrix API limits

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
sqlite3 data/databases/main_properties.db

# Common queries:
# .tables                    # List all tables
# .schema parcels           # View table structure
# SELECT COUNT(*) FROM parcels;  # Count total properties
# SELECT * FROM parcels WHERE matrix_room_id IS NOT NULL;  # Buildings with Matrix rooms
```

### Element Web Deployment (Netlify)

**Current setup:**
- Element Web v1.12.4 is in `element-v1.12.4/` directory
- Netlify configuration is in `netlify.toml` (publish: `element-v1.12.4`)
- Custom headers in `element-v1.12.4/_headers` allow iframe embedding

**Deployment:**
```bash
# Element deploys automatically when you push to GitHub
git add element-v1.12.4/
git commit -m "Update Element configuration"
git push origin main
# Netlify detects changes and redeploys in 30-60 seconds
```

**Updating Element Web:**
1. Download new Element release from https://github.com/element-hq/element-web/releases
2. Copy `_headers` and `config.json` from current `element-v1.12.4/` to new version
3. Replace `element-v1.12.4/` folder with new version
4. Test locally: `python3 -m http.server 8000` in element-v1.12.4/, visit http://localhost:8000
5. Commit and push to trigger Netlify deployment

**Connecting Next.js to Element:**
- Element URL is configured in `src/components/MatrixChatEmbed.tsx:11`
- Update `ELEMENT_URL` constant if Netlify site name changes
- Rebuild Next.js (`npm run build`) after changing Element URL

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
- `src/app/page.tsx` - Homepage with two-column dashboard
- `src/components/BuildingList.tsx` - Left sidebar (40% width)
- `src/components/MatrixChatEmbed.tsx` - Right panel (60% width) with Netlify Element iframe
- `src/components/BuildingMetadata.tsx` - Overlay with building details
- `src/lib/getBuildingsData.ts` - Database queries (currently unused, for future)

**Current Implementation:**
- 10 buildings with Matrix rooms hardcoded in page.tsx
- Client-side search/filter using React state
- Matrix chat embedded via iframe pointing to `https://rstu-element.netlify.app`
- 100% static - no backend, no runtime database queries

**Future Implementation:**
- Query `main_properties.db` at build time using `getBuildingsData.ts`
- Generate building list dynamically from database
- No hardcoded building data in page.tsx

### Property Data Pipeline

The organizing platform is built around a comprehensive property intelligence system:

**Data Flow:**
```
Washoe County Open Data API
  → washoe_parcels.db (192,463 parcels)
  → Python processing scripts
  → main_properties.db (primary database)
  → Organizing intelligence databases
  → Strategic target identification
```

**Key Databases:**

1. **main_properties.db** (398MB)
   - PRIMARY DATABASE used by Next.js build process
   - Contains processed property data with Matrix room IDs
   - Schema: parcels table with columns:
     - `apn`, `property_address`, `owner_name`, `owner_address`
     - `units`, `year_built`, `total_assessed_value`, `building_square_feet`
     - `wgs84_lat`, `wgs84_lon` (GPS coordinates)
     - `matrix_room_id`, `matrix_room_alias` (added by create_matrix_rooms.py)

2. **washoe_parcels.db** (398MB)
   - Source data from Washoe County (192,463 properties)
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

### Adding New Buildings to the Dashboard

**Option 1: Create Matrix rooms and update database (recommended)**
```bash
# 1. Create Matrix rooms for top buildings
python3 scripts/create_matrix_rooms.py

# 2. Update page.tsx to query database at build time
# Edit src/lib/getBuildingsData.ts and src/app/page.tsx
# to use getBuildingsWithMatrixRooms() instead of hardcoded data

# 3. Rebuild and deploy
npm run deploy
git add . && git commit -m "Add new buildings" && git push
```

**Option 2: Hardcode building data (current method)**
```bash
# 1. Edit src/app/page.tsx
# 2. Add building to the hardcoded buildings array
# 3. Include Matrix room ID and alias
# 4. Rebuild and deploy
npm run deploy
git add . && git commit -m "Add new building" && git push
```

### Updating Element Web Configuration

**Element URL (src/components/MatrixChatEmbed.tsx:11):**
```typescript
const ELEMENT_URL = 'https://rstu-element.netlify.app';
```

**Element config (element-v1.12.4/config.json):**
```json
{
  "default_server_config": {
    "m.homeserver": {
      "base_url": "https://matrix.org"
    }
  },
  "disable_guests": false,
  "features": {
    "feature_new_room_decoration_ui": true
  }
}
```

**Element headers (element-v1.12.4/_headers):**
```
/*
  X-Frame-Options: ALLOW-FROM https://rstu-connect.neocities.org
  Content-Security-Policy: frame-ancestors 'self' https://rstu-connect.neocities.org
```

### Data Processing

When working with property data:
1. Main database is `data/databases/main_properties.db` (~398MB)
2. Source database is `data/databases/washoe_parcels.db` (~398MB)
3. Python scripts use SQLite3 directly (no ORM)
4. Coordinate transformations use `pyproj` library with EPSG:2769 → EPSG:4326
5. All scripts assume paths relative to project root

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
- `matrix_room_id` - Matrix room ID (e.g., `!abc123:matrix.org`)
- `matrix_room_alias` - Matrix room alias (e.g., `#building-name:matrix.org`)

## Security & Privacy Considerations

The organizing platform implements community-first security:
- No plaintext addresses in public datasets
- Cryptographic address verification system (planned)
- Three-tier progressive security model
- Community verification workflows
- Legal protections under Nevada Revised Statutes Chapter 118A
- Matrix rooms are private, encrypted, and invite-only
- Element deployment requires custom headers to prevent clickjacking

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
