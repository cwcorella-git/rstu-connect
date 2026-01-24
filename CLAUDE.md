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

**Automatic deployment:** Push to `main` triggers GitHub Actions -> builds -> deploys to GitHub Pages.

**CRITICAL: After committing changes, ALWAYS PUSH with `git push origin main`** - Commits without push don't trigger deployment.

**Prebuild scripts (run automatically by `npm run build`):**
1. `python3 scripts/build/export-all-properties.py` - Exports property data to JSON
2. `node scripts/build/generate-reading-manifest.js` - Generates document manifest from `docs/`

## Architecture

### Tech Stack
- **Framework:** Next.js 14 App Router with static export (`output: 'export'`)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (RSTU red: `#cc0000`)
- **Base Path:** `/rstu-connect` (configured in `next.config.js`)
- **i18n:** Custom LanguageContext with 5 locales (EN, ES, TL, ZH, VI)

### Main Tabs (in `src/app/page.tsx`)
1. **Home (Organize):** Building directory (16,000+ rental properties) with tabbed property view:
   - **Chat:** Real-time Socket.io messaging, governance proposals, meeting coordination
   - **Events:** Calendar with RSVP, event types (meeting, action, workshop, etc.)
   - **Map:** 3D Mapbox visualization with neighboring buildings
2. **Reading:** Document library (~2,900 organizing resources) with markdown viewer
3. **Mutual Aid:** Needs/offers, skills directory, resource library, **Blocks** (linked property groups with governance)
4. **Tools:** Unit tracker, canvassing, power map, campaigns, users
5. **Profile:** User profiles, rent comparison, onboarding wizard

### Key Data Flows

**Property Data:**
```
data/databases/main_properties.db (192,463 Washoe County properties)
  -> scripts/build/export-all-properties.py (filters to ~16k rentals, prebuild)
  -> public/data/all-properties.json (compressed, ~3.6 MB)
  -> src/lib/loadAllProperties.ts (expands to EnhancedBuilding[])
  -> page.tsx renders BuildingList + PropertyViewTabs

Supabase (optional, for FTS):
  -> scripts/data/load-all-data-to-supabase.js (properties + intelligence data)
  -> src/lib/supabase.ts (search, evictions, landlord scores)
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
docs/ (~2,900 markdown files with YAML frontmatter)
  -> scripts/build/generate-reading-manifest.js (prebuild)
  -> src/data/reading-manifest.json
  -> ReadingList + ReadingContent components
```

### Component Structure

```
src/
├── app/
│   ├── page.tsx          # Main page with tab routing (home/reading/tools/profile)
│   └── layout.tsx        # Root layout with header
├── components/
│   ├── BuildingList.tsx  # Property search/filter sidebar (13 sorts, 9 filters)
│   ├── BuildingCard.tsx  # Property card with badges (status, type, management, progress)
│   ├── PropertyView/     # Tabbed property view (Chat, Events, Map tabs)
│   ├── Events/           # Calendar, event cards, event creator
│   ├── SocketChat/       # Chat UI components (MessageList, MessageInput, TypingIndicator)
│   ├── Reading/          # Document library components
│   ├── MutualAid/        # Needs, offers, skills, library, Blocks
│   ├── Tools/            # Organizer tools (UnitTracker, PowerMap, Canvassing, etc.)
│   ├── Profile/          # User profile management, onboarding wizard
│   ├── Footer.tsx        # Translated footer component
│   └── HamburgerMenu.tsx # Mobile navigation with translations
├── contexts/
│   ├── LanguageContext.tsx  # i18n with 5 locales, 938+ keys each
│   └── TabContext.tsx       # Global tab state
├── hooks/
│   └── useSocketChat.ts     # Socket.io chat hook
└── lib/
    ├── getBuildingsData.ts         # EnhancedBuilding interface
    ├── loadAllProperties.ts        # Loads compressed property JSON
    ├── profileStorage.ts           # User profiles, roles, invite codes
    ├── eventStorage.ts             # Building/block events, RSVPs, calendar
    ├── governanceStorage.ts        # Proposals, voting, Bookchin principle
    ├── linkedPropertiesStorage.ts  # Property groups (Blocks), alliances
    ├── canvassStorage.ts           # Unit-level tenant outreach, habitability scores
    ├── campaignStorage.ts          # Organizing campaigns & progress
    ├── mutualAidStorage.ts         # Needs/offers, skills, resource library
    ├── socketio.ts                 # Socket.io client configuration
    └── supabase.ts                 # Cloud sync, user storage, FTS
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
  propertyType?: string;           // mc, mi, mt, sc, st (multi/single + corp/indiv/trust)
  managementCompanyId?: string;    // Detected management company
  portfolioId?: string;            // Property portfolio grouping
  // Intelligence fields
  evictionCount?: number;
  evictionsPer100Units?: number;
  totalViolations?: number;
  organizingPriority?: number;     // 0-10 scale
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

## Internationalization (i18n)

**Location:** `src/contexts/LanguageContext.tsx`

**Supported Locales:**
- `en` - English (default, 938 keys)
- `es` - Spanish (100% coverage)
- `tl` - Tagalog (100% coverage)
- `zh` - Chinese (100% coverage)
- `vi` - Vietnamese (100% coverage)

**Usage:**
```typescript
import { useLanguage } from '@/contexts/LanguageContext'

function MyComponent() {
  const { t, locale, setLocale } = useLanguage()
  return <span>{t('nav.home')}</span>
}
```

**Translation key structure:** `category.subcategory` (e.g., `buildings.active`, `tools.unitTracker`)

**Check coverage:** `node scripts/maintenance/find-missing-translations.js`

## Chat System

**Current:** Socket.io server at `rstu-gun-relay.onrender.com`
- Real-time messaging with server persistence
- Building-specific chat rooms via `chatSlug`
- `src/lib/socketio.ts` - Socket.io client
- `src/hooks/useSocketChat.ts` - Chat hook for components
- `src/components/SocketChat/` - UI components (MessageList, MessageInput, TypingIndicator)

**Chat slug convention:** Generated from address, e.g., "2500 E 2ND ST" -> `rstu-2500-e-2nd-st`

**Legacy naming:** `src/components/GunChat/` may still exist - historical name, components use Socket.io.

## Property Cards & Badges

**BuildingCard.tsx** displays property info with dynamic badges:

1. **Organizing Status:** Active (green), Emerging (yellow) - based on effective priority score
2. **Property Type:** Multi (Corp/Indiv/Trust), SFR (Corp/Trust) - color-coded
3. **Management Company:** Purple badge with detected company name
4. **Portfolio:** Orange badge if part of multi-property portfolio
5. **Organizing Progress:** Emerald badge showing active members and contacted/total units

**Sorting options (13):** Units, Priority, Habitability, Evictions, Violations, Year Built, Portfolio Size, Value, Value/Unit, Address, Owner

**Filter options (9):** All, Corporate-Owned, Individual-Owned, Trust-Owned, Active Organizing, Emerging, Has Violations, High Evictions, Favorites

## Canvassing & Unit Tracker

**Location:** `src/lib/canvassStorage.ts`

Key functions:
- `getEffectiveOrganizingPriority()` - Boosts priority for poor habitability
- `getTenantSafeProgress()` - Returns active members and contacted counts for badges
- `getHabitabilityScore()` - Calculates 0-100 score from unit conditions

## Property Database

SQLite database at `data/databases/main_properties.db` (398MB, 192,463 properties):

```bash
sqlite3 data/databases/main_properties.db
# .tables -> parcels
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

**Fix malformed frontmatter:** `node scripts/maintenance/fix-frontmatter.js`

## Admin Features

- **Keyboard shortcut:** `Ctrl+Shift+A` toggles admin login/logout
- **Admin capabilities:** Edit document titles, hide/show documents, delete documents
- **Admin state:** Syncs to Supabase (`document_admin_state`, `document_edits` tables) with localStorage fallback
- **Database schema:** `scripts/archive/create-admin-state-tables.sql`

## Deployment

**GitHub Actions workflow (`.github/workflows/deploy.yml`):**
1. Push to `main` triggers build
2. `npm ci && npm run build` (runs prebuild scripts)
3. Deploys `out/` to GitHub Pages
4. Neocities iframe points to GitHub Pages

**Environment variables:**
- `NEXT_PUBLIC_SOCKETIO_URL` - Socket.io server URL (default: `https://rstu-gun-relay.onrender.com`)
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL (optional, for FTS)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key (optional, for FTS)

## Banned Features (DO NOT IMPLEMENT)

The following features have been explicitly banned and should NEVER be suggested, implemented, or referenced:

1. **Victories System** - A premature "victory documentation" feature that was removed because:
   - No progression system exists to lead to victories
   - Disconnected from organizing workflow (complaints → demands → escalation)
   - Arbitrary and detached from actual tenant power building
   - The Organize tools are not mature enough to support this concept
   
   **DO NOT:** Create victory storage, victory forms, victory showcases, victory timelines, or any "win documentation" features.

If the user asks about victories or wins, redirect to:
- Building tenant participation through canvassing
- Filing and tracking complaints
- Escalating demands
- Strike coordination (when ready)
