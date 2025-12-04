# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

The Reno-Sparks Tenants Union (RSTU) Connect is a Next.js static website with embedded chat for tenant organizing.

**Live Site:** https://rstu-connect.neocities.org/

**Key Features:**
- Searchable building directory (10 largest apartment complexes)
- Per-building chat rooms using Gun.js decentralized P2P (free, anonymous, no login required)
- Property intelligence databases for strategic organizing
- Mobile-first design for field organizers

## Architecture

### Single-Site Deployment (Neocities)
- **Technology:** Next.js 14 static export
- **Hosting:** Neocities (free tier)
- **Deployment:** GitHub Actions (automatic on push to main)
- **Chat:** Gun.js decentralized P2P (no central server needed)

**Why Gun.js?**
- ✅ Fully decentralized P2P architecture - no central server to censor or shut down
- ✅ No login required - zero friction for tenants
- ✅ Real-time sync across all peers
- ✅ Offline-first with browser storage (IndexedDB)
- ✅ Self-hosted relay on Render.com free tier (optional for NAT traversal)
- ✅ Data ownership - messages stored locally in each participant's browser

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
  - `BuildingChatEmbed.tsx` - Right panel (60% width) with Gun.js P2P chat
  - `BuildingMetadata.tsx` - Building info overlay
  - `GunChat/` - Gun.js chat UI components
    - `MessageList.tsx` - Chat message display
    - `MessageInput.tsx` - Message composition
    - `ChatAdminPanel.tsx` - Admin tools (clear data, delete messages)
- `src/lib/` - Utility functions
  - `getBuildingsData.ts` - Building interface and database functions
  - `gun.ts` - Gun.js P2P database initialization
  - `gunAdmin.ts` - Admin utilities for message management
- `src/hooks/` - React hooks
  - `useGunChat.ts` - Gun.js chat functionality hook

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

## Chat System: Gun.js Decentralized P2P

### How It Works

Gun.js provides a fully decentralized, peer-to-peer database for tenant organizing chat:

**Architecture:**
- Each building has a unique Gun.js graph path: `rstu/chat/{chatSlug}`
- Messages sync in real-time across all connected peers
- Data stored locally in browser IndexedDB (offline-first)
- Optional relay server on Render.com for NAT traversal (configured in `src/lib/gun.ts`)

**Key Benefits:**
- No central server can censor or shut down organizing chat
- Works offline - messages sync when peers reconnect
- Zero friction - no accounts, no login, no tracking
- Data sovereignty - messages stored in participants' browsers

**Relay Server:**
- Self-hosted on Render.com free tier: `https://rstu-gun-relay.onrender.com/gun`
- Optional - Gun.js works P2P even without relay (WebRTC)
- Relay helps peers behind NAT/firewalls discover each other
- See deployment notes in recent git commits for relay setup

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
  chatSlug: "rstu-123-main-st"  // Creates Gun.js path: rstu/chat/rstu-123-main-st
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

### Gun.js Implementation Details

**Key Files:**
- `src/lib/gun.ts` - Gun instance initialization with relay peers
- `src/hooks/useGunChat.ts` - React hook for chat functionality
- `src/components/GunChat/` - Chat UI components

**Data Model:**
```typescript
// Each message stored in Gun graph:
{
  text: string,
  username: string,
  timestamp: number
}

// Graph path: gun.get('rstu').get('chat').get(chatSlug).get('messages').set(message)
```

**Admin Tools:**
- Clear Local Data - Wipes browser's Gun IndexedDB storage
- Delete Messages - Removes individual messages from Gun graph
- Located in `ChatAdminPanel.tsx` component

### Troubleshooting Gun.js

**Common Issues:**

1. **Messages not syncing between peers:**
   - Check browser console for Gun.js peer connection logs
   - Verify relay server is accessible: `https://rstu-gun-relay.onrender.com/gun`
   - Render.com free tier spins down after inactivity - first request may be slow
   - Open DevTools → Application → IndexedDB to inspect local Gun data

2. **Relay server configuration:**
   - Edit peer URLs in `src/lib/gun.ts`
   - Gun.js can work without relay via WebRTC, but NAT traversal may fail
   - See git commit history for relay server deployment instructions

3. **Testing locally:**
   - Open site in two different browsers (Chrome + Firefox) to test P2P sync
   - Gun.js uses IndexedDB - clear it via DevTools if testing fresh state
   - Messages should sync between browser tabs in real-time

**Known Limitations (see git commit: "Document Gun.js debugging session"):**
- Gun.js P2P sync can be unreliable depending on network conditions
- Relay server on Render.com free tier has cold start delays
- Consider fallback chat solutions if Gun.js proves unsuitable for production

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
- `src/components/BuildingChatEmbed.tsx` - Right panel (60% width) with Gun.js P2P chat
- `src/components/BuildingMetadata.tsx` - Overlay with building details
- `src/components/GunChat/` - Gun.js chat UI (MessageList, MessageInput, ChatAdminPanel)

**Current Implementation:**
- 10 buildings with Gun.js P2P chat rooms hardcoded in page.tsx
- Client-side search/filter using React state
- Gun.js decentralized chat (no authentication required)
- 100% static site - Gun.js runs entirely in browser
- Optional relay server for peer discovery

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
- **Data:** Hardcoded building list (10 properties with Gun.js P2P chat)
- **Chat:** Gun.js decentralized P2P database (no central server)
- **Deployment:** GitHub Actions → Neocities
- **Output:** 100% static HTML/CSS/JS (Gun.js runs client-side)

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
  chatSlug: string;         // Gun.js chat slug (e.g., "rstu-2500-e-2nd-st")
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
- Gun.js chats are fully anonymous (username stored only in browser localStorage)
- Data sovereignty - messages stored locally in participants' browsers, not on central servers
- Property databases for internal organizing use only
- Legal protections under Nevada Revised Statutes Chapter 118A

**Important Considerations:**
- Gun.js is decentralized - messages sync P2P across all connected peers
- Message deletion only removes from local browser and propagates delete to peers
- Historical messages persist in Gun.js graph unless explicitly deleted by users
- Admin tools available in ChatAdminPanel for data management
- The full organizing platform with databases and intelligence tools is for internal organizing use only and should never be deployed publicly without security review

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
