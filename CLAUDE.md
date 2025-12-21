# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

RSTU Connect is a Next.js static website for the Reno-Sparks Tenants Union - Nevada's first tenants union.

**Live Site:** https://rstu-connect.neocities.org (iframe to GitHub Pages)
**GitHub Pages:** https://cwcorella-git.github.io/rstu-connect/

## Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Development server at http://localhost:3000
npm run build        # Build static export to out/ (runs prebuild scripts automatically)
npm run deploy       # Build + run deploy.sh (legacy local deploy)
npm run lint         # Run Next.js linter
```

**Automatic deployment:** Push to `main` triggers GitHub Actions → builds → deploys to GitHub Pages.

**Prebuild scripts (run automatically by `npm run build`):**
1. `python3 scripts/export-all-properties.py` - Exports property data to JSON
2. `node scripts/generate-reading-manifest.js` - Generates document manifest from `docs/`

## Architecture

### Tech Stack
- **Framework:** Next.js 14 App Router with static export (`output: 'export'`)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (RSTU red: `#cc0000`)
- **Base Path:** `/rstu-connect` (configured in `next.config.js`)

### Main Tabs (in `src/app/page.tsx`)
1. **Home (Organize):** Building directory (21,000+ rental properties from 192k total) with tabbed property view (Chat, Map, Info)
2. **Reading:** Document library (~850 organizing resources) with markdown viewer
3. **Mutual Aid:** Needs/offers board, skills directory, resource library (tools, books)
4. **Tools:** Unit tracker, canvassing, power map, campaigns
5. **Profile:** User profiles, rent comparison, lease tracker

### Key Data Flows

**Property Data:**
```
data/databases/main_properties.db (192,463 Washoe County properties)
  → scripts/export-all-properties.py (filters to 21,285 rentals, prebuild)
  → public/data/all-properties.json (compressed, ~4.3 MB)
  → src/lib/loadAllProperties.ts (expands to EnhancedBuilding[])
  → page.tsx renders BuildingList + PropertyViewTabs

Supabase (optional, for FTS):
  → scripts/load-all-data-to-supabase.js (properties + intelligence data)
  → src/lib/supabase.ts (search, evictions, landlord scores)
```

**Intelligence Databases (local SQLite):**
```
data/databases/
├── landlord_accountability.db  # 7,500 eviction records, 20 landlord scorecards
├── organizing_targets.db       # 5,695 properties with organizing priority scores
└── property_intelligence.db    # 48,593 corporate landlord entities
```

**Reading Library:**
```
docs/ (~850 markdown files with YAML frontmatter)
  → scripts/generate-reading-manifest.js (prebuild)
  → src/data/reading-manifest.json
  → ReadingList + ReadingContent components
```

### Component Structure

```
src/
├── app/
│   ├── page.tsx          # Main page with tab routing (home/reading/tools/profile)
│   └── layout.tsx        # Root layout with header
├── components/
│   ├── BuildingList.tsx  # Property search/filter sidebar
│   ├── BuildingCard.tsx  # Individual property card
│   ├── PropertyView/     # Tabbed property view (Chat, Map, Info tabs)
│   ├── Reading/          # Document library components
│   ├── MutualAid/        # Mutual aid page (needs, offers, skills, library)
│   ├── Tools/            # Organizer tools (UnitTracker, etc.)
│   └── Profile/          # User profile management
├── contexts/
│   └── TabContext.tsx    # Global tab state
└── lib/
    ├── getBuildingsData.ts         # EnhancedBuilding interface
    ├── loadAllProperties.ts        # Loads compressed property JSON
    ├── getReadingData.ts           # ReadingDocument interface
    ├── readingStorage.ts           # localStorage for reading progress
    ├── adminStorage.ts             # localStorage for admin state
    ├── profileStorage.ts           # localStorage for user profiles
    ├── buildingOrganizingStorage.ts # Complaints, demands, canvass data
    ├── governanceStorage.ts        # Proposals and voting (WIP)
    ├── linkedPropertiesStorage.ts  # Property groups (WIP)
    └── mutualAidStorage.ts         # Needs/offers, skills, resource library
```

### Data Types

```typescript
// Property data (src/lib/getBuildingsData.ts)
interface EnhancedBuilding {
  apn: string;              // Assessor Parcel Number
  address: string;
  propertyName: string | null;
  owner: string;
  units: number;
  value: number;
  yearBuilt: number | null;
  sqft: number | null;
  neighborhood: string | null;
  zoning: string | null;
  landUseCode: string | null;
  lat: number | null;
  lon: number | null;
  chatSlug: string;
  // Intelligence fields (from Supabase)
  evictionCount?: number;
  organizingPriority?: number;  // 0-10 scale
  organizingStatus?: 'active' | 'emerging' | 'inactive';
  isCorporateOwned?: boolean;
  portfolioSize?: number;
}

// Document data (src/lib/getReadingData.ts)
interface ReadingDocument {
  id: string;
  title: string;
  author: string | null;
  date: string | null;
  category: string;
  filename: string;
  slug: string;
  excerpt: string;
}
```

## Chat System

**Current:** Socket.io server at `rstu-chat-server.onrender.com`
- Real-time messaging with server persistence
- Building-specific chat rooms via `chatSlug`
- `src/lib/socketio.ts` - Socket.io client
- `src/hooks/useSocketChat.ts` - Chat hook for components

**Chat slug convention:** Generated from address, e.g., "2500 E 2ND ST" → `rstu-2500-e-2nd-st`

**Legacy naming:** `src/components/GunChat/` contains UI components (MessageList, MessageInput) - the name is historical, they use Socket.io data via props.

## Property Database

SQLite database at `data/databases/main_properties.db` (398MB, 192,463 properties):

```bash
sqlite3 data/databases/main_properties.db
# .tables → parcels
# .schema parcels
# SELECT COUNT(*) FROM parcels;
```

**Key columns:** `apn`, `property_address`, `owner_name`, `units`, `year_built`, `total_assessed_value`, `wgs84_lat`, `wgs84_lon`

## Adding Documents

1. Add markdown files to `docs/{category}/` with YAML frontmatter:
   ```yaml
   ---
   title: "Document Title"
   author: "Author Name"
   date: 2025
   ---
   ```
2. Run `npm run build` (manifest regenerates automatically)
3. Push to main (auto-deploys)

**Fix malformed frontmatter:** `node scripts/fix-frontmatter.js`

## Admin Features

- **Keyboard shortcut:** `Ctrl+Shift+A` toggles admin login/logout
- **Admin capabilities:** Edit document titles, hide/show documents, delete documents
- **Admin state:** Stored in localStorage via `src/lib/adminStorage.ts`

## Deployment

**GitHub Actions workflow (`.github/workflows/deploy.yml`):**
1. Push to `main` triggers build
2. `npm ci && npm run build` (runs prebuild scripts)
3. Deploys `out/` to GitHub Pages
4. Neocities iframe points to GitHub Pages

**Environment variables:**
- `NEXT_PUBLIC_SOCKETIO_URL` - Socket.io server URL (default: `https://rstu-chat-server.onrender.com`)
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL (optional, for FTS)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key (optional, for FTS)
