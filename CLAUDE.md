# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

RSTU Connect is a Next.js static website for the Reno-Sparks Tenants Union - Nevada's first tenants union.

**Live Site:** https://rstu-connect.neocities.org (iframe to GitHub Pages)
**GitHub Pages:** https://cwcorella-git.github.io/rstu-connect/

### Platform Status (Critical Context)

The platform is **built but not field-tested**. As of January 2026:
- No tenants are currently using the platform to organize
- No successful organizing campaigns have been completed
- Canvassing tools have not been tested in the field
- No funding or resources exist for canvassing operations

**Known Data Issues:**
- Database includes ~52 casino/hotel properties that should be excluded
- Some unit counts are inaccurate
- Total assessed value figures have not been validated

The core challenge: closing the gap between awareness and action through real-world deployment.

## Prerequisites

- Node.js 18+
- npm
- Python 3 (for property export prebuild script)

## Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Development server at http://localhost:3000
npm run build        # Build static export to out/ (runs prebuild scripts automatically)
npm run deploy       # Build + run deploy.sh (legacy local deploy)
npm run lint         # Run Next.js linter
```

### Running Tests

**Jest (unit tests):**
```bash
npm test                                    # All unit tests
npm test -- path/to/test.test.ts            # Single file
npm test -- --watch                         # Watch mode
npm test -- --testNamePattern="pattern"     # Filter by name
npm run test:ci                             # CI mode with coverage
```

**Playwright (e2e):**
```bash
npx playwright test                         # All e2e tests
npx playwright test tests/e2e/smoke.spec.ts # Single file
npx playwright test --headed                # Visible browser
npx playwright test --ui                    # Interactive UI
```

**Automatic deployment:** Push to `main` triggers GitHub Actions -> builds -> deploys to GitHub Pages.

**CRITICAL: After committing changes, ALWAYS PUSH with `git push origin main`** - Commits without push don't trigger deployment.

**Prebuild scripts (run automatically by `npm run build`):**
1. `node scripts/build/generate-version.js` - Generates version-info.json with build timestamp
2. `python3 scripts/build/export-all-properties.py` - Exports property data to JSON
3. `node scripts/build/generate-reading-manifest.js` - Generates document manifest from `docs/`

## Root Directory Structure

```
rstu-connect/
├── src/                # Application source code (Next.js)
├── docs/               # Reading library (2,363 markdown files with YAML frontmatter)
├── data/               # SQLite databases, JSON/CSV data files (mostly gitignored)
├── public/             # Static assets (icons, data JSON, generated documents)
├── scripts/            # Build, data loading, and maintenance scripts
│   ├── build/          #   Prebuild scripts (export-all-properties, generate-manifest)
│   ├── data/           #   Data import/export scripts (supabase loaders, extractors)
│   ├── diagnostics/    #   Browser-console diagnostic snippets (e.g., invite-system-check.js for troubleshooting localStorage/Supabase)
│   └── maintenance/    #   Translation audits, frontmatter fixes, tag checks
├── infrastructure/     # Server-side infrastructure
│   ├── relay-server/   #   Socket.io relay server (deployed to Render)
│   └── supabase/       #   All Supabase config: schema SQL, migrations, edge functions
├── tests/              # All test files
│   ├── unit/           #   Jest unit tests (authService, blocVoting, smoke)
│   └── e2e/            #   Playwright e2e tests (debug, features, smoke)
├── archive/            # Historical project docs, AI writings, analysis reports
├── .github/workflows/  # GitHub Actions (deploy.yml, deploy-neocities.yml)
└── [config files]      # next.config.js, tsconfig.json, jest.config.js, playwright.config.ts, etc.
```

**Not in git (gitignored):** `node_modules/`, `.next/`, `out/`, `coverage/`, `test-results/`, `playwright-report/`, `serve-dir/`, `*.db`, `public/documents/`, `public/version-info.json`

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
2. **Reading:** Document library (2,363 organizing resources) with markdown viewer
3. **Mutual Aid:** Needs/offers, skills directory, resource library, **Blocks** (linked property groups with governance)
4. **Tools:** Unit tracker, canvassing, power map, campaigns, users
5. **Profile:** User profiles, rent comparison, onboarding wizard

### Key Data Flows

**Property Data:**
```
data/databases/main_properties.db (192,463 Washoe County properties)
  -> scripts/build/export-all-properties.py (filters to ~16k rentals, prebuild)
  -> public/data/all-properties.json (compressed, ~3.6 MB)
  -> src/lib/data/loadAllProperties.ts (expands to EnhancedBuilding[])
  -> page.tsx renders BuildingList + PropertyViewTabs

Supabase (optional, for FTS):
  -> scripts/data/extract-property-names.py (extracts property names for search)
  -> src/lib/services/supabase.ts (search, evictions, landlord scores)
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
docs/ (2,363 markdown files with YAML frontmatter)
  -> scripts/build/generate-reading-manifest.js (prebuild)
  -> src/data/reading-manifest.json
  -> ReadingList + ReadingContent components

Maintenance:
  -> scripts/maintenance/cleanup-reading-docs.py (v1: metadata/tags cleanup)
  -> scripts/maintenance/cleanup-reading-docs-v2.py (v2: page markers, breaks, artifacts)
```

### Component Structure

```
src/
├── app/
│   ├── page.tsx            # Main page with tab routing (home/reading/tools/profile)
│   └── layout.tsx          # Root layout with header
├── components/
│   ├── Layout/             # App shell (ClientLayout, Navigation, Footer, etc.)
│   ├── Building/           # Property components (BuildingList, BuildingCard, LinkedGroupCard)
│   ├── shared/             # Cross-cutting (ErrorBoundary, OfflineBanner, VersionFooter,
│   │                       #   FeedbackModal, EditableText, EditModeIndicator,
│   │                       #   Citations/, Legislation/)
│   ├── ui/                 # UI primitives (ConfirmModal)
│   ├── Chat/               # Real-time messaging, governance proposals
│   ├── PropertyView/       # Tabbed property view (Chat, Events, Map tabs)
│   ├── Events/             # Calendar, event cards, event creator
│   ├── SocketChat/         # Chat UI components (MessageList, MessageInput)
│   ├── Reading/            # Document library components
│   ├── MutualAid/          # Needs, offers, skills, library, Blocks, CommitmentCard/Creator
│   ├── Tools/              # Organizer tools (UnitTracker, PowerMap, Canvassing, etc.)
│   ├── Profile/            # User profile management, onboarding wizard
│   ├── LandingPage/        # Customizable landing page builder
│   ├── Elections/          # Ballot system, ranked choice voting
│   ├── Escalation/         # Complaint & demand escalation
│   ├── Resources/          # Resource directory
│   ├── Messages/           # Direct messaging
│   └── Tasks/              # Task management
├── contexts/
│   ├── LanguageContext.tsx  # i18n with 5 locales, 938+ keys each
│   └── TabContext.tsx       # Global tab state
├── hooks/
│   └── useSocketChat.ts    # Socket.io chat hook
├── data/                   # Static data constants (citations.ts, nevada-legislation.ts, property-names.json, reading-manifest.json, external-resources.json) — distinct from src/lib/data/ which contains data-loading utilities and types
└── lib/
    ├── storage/            # Data persistence (29 files)
    │   ├── profileStorage.ts         # User profiles, roles, invite codes
    │   ├── eventStorage.ts           # Building/block events, RSVPs, calendar
    │   ├── governanceStorage.ts      # Proposals, voting, Bookchin principle
    │   ├── linkedPropertiesStorage.ts # Property groups (Blocs), merge logic
    │   ├── delegateStorage.ts        # Delegate voting weight calculations
    │   ├── canvassStorage.ts         # Unit-level tenant outreach, habitability
    │   └── ...                       # 23 more *Storage.ts modules
    ├── services/           # External integrations (7 files)
    │   ├── supabase.ts             # Cloud sync, user storage, FTS
    │   ├── socketio.ts             # Socket.io client configuration
    │   └── authService.ts          # Authentication service
    ├── utils/              # Pure utilities (10 files)
    │   ├── logger.ts, sanitize.ts, crypto.ts, rateLimit.ts, etc.
    ├── pdf/                # PDF generators (2 files)
    │   └── strikeNoticePDF.ts, rentDisputePDF.ts
    ├── data/               # Types, loaders, domain logic (7 files)
    │   ├── getBuildingsData.ts     # EnhancedBuilding interface
    │   └── loadAllProperties.ts    # Loads compressed property JSON
    └── __tests__/          # Co-located lib tests (canvass, delegate, election, governance, profile)
```

### Infrastructure

```
infrastructure/
├── relay-server/           # Socket.io relay server (Node.js, deployed to Render)
│   ├── server.js           # Main server file
│   ├── package.json
│   └── package-lock.json
└── supabase/               # All Supabase configuration
    ├── schema.sql           # Base schema
    ├── 002-020_*.sql        # Numbered schema evolution (properties, RLS, elections, etc.)
    ├── fts-schema.sql       # Full-text search schema
    ├── migrations/          # Incremental migrations (banned columns, auth integration, etc.)
    └── functions/           # Supabase Edge Functions (Deno)
        ├── send-verification-email/  # Sends 6-digit email verification codes
        └── verify-email-code/        # Validates verification codes
```

### Tests

```
tests/                      # Root test directory
├── unit/                   # Jest unit tests
│   ├── authService.test.ts
│   ├── blocVotingSystem.test.ts
│   └── smoke.test.ts
└── e2e/                    # Playwright end-to-end tests
    ├── debug.spec.ts
    ├── features.spec.ts
    ├── smoke.spec.ts
    └── canvassing-mobile.spec.ts  # Mobile UI testing

src/lib/__tests__/          # Co-located storage tests (Jest)
src/components/__tests__/   # Co-located component tests (Jest)
```

**Config:** `jest.config.js` (unit tests), `playwright.config.ts` (e2e tests)

**Mobile Testing:** Use `canvassing-mobile.spec.ts` as a template for mobile viewport testing. Key pattern:
```typescript
// Set mobile viewport
await page.setViewportSize({ width: 390, height: 844 })

// Inject test profile for organizer access
await page.evaluate(() => {
  const profileState = {
    currentProfile: { id: 'test', role: 'organizer', ... },
    storedProfiles: [...],
    ...
  }
  localStorage.setItem('rstu_profile_data', JSON.stringify(profileState))
})

// Use JavaScript clicks for elements behind overlays
await page.evaluate(() => {
  document.querySelectorAll('button').forEach(btn => {
    if (btn.textContent?.includes('Tools')) btn.click()
  })
})
```

### Data Types

```typescript
// Property data (src/lib/data/getBuildingsData.ts)
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

// Document data (src/lib/data/getReadingData.ts)
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
- `src/lib/services/socketio.ts` - Socket.io client
- `src/hooks/useSocketChat.ts` - Chat hook for components
- `src/components/SocketChat/` - UI components (MessageList, MessageInput, TypingIndicator)

**Chat slug convention:** Generated from address, e.g., "2500 E 2ND ST" -> `rstu-2500-e-2nd-st`

**Relay server:** `infrastructure/relay-server/server.js` (deployed to Render)

## Property Cards & Badges

**BuildingCard.tsx** displays property info with dynamic badges:

1. **Organizing Status:** Active (green), Emerging (yellow) - based on effective priority score
2. **Property Type:** Multi (Corp/Indiv/Trust), SFR (Corp/Trust) - color-coded
3. **Management Company:** Purple badge with detected company name
4. **Portfolio:** Orange badge if part of multi-property portfolio
5. **Organizing Progress:** Emerald badge showing active members and contacted/total units

**Sorting options (13):** Units, Priority, Habitability, Evictions, Violations, Year Built, Portfolio Size, Value, Value/Unit, Address, Owner

**Filter options (9):** All, Corporate-Owned, Individual-Owned, Trust-Owned, Active Organizing, Emerging, Has Violations, High Evictions, Favorites

## Property Linking (Blocs)

**Location:** `src/lib/storage/linkedPropertiesStorage.ts`

Properties can be linked into "Blocs" (linked property groups) for coordinated organizing:

- **Ctrl+click** map markers to select properties for linking
- When the first nearby property is selected, the currently-viewed property is auto-included
- **Admin/Organizer path:** Instant group creation
- **Tenant path:** Creates a governance proposal requiring votes

**Key function:** `createOrMergeLinkedGroup()` - When linking properties that belong to existing groups, automatically merges all overlapping groups into one. Preserves members, alliances, bans, and notes from merged groups.

**Map markers:**
- Main building (currently viewed): 18px red dot, shrinks to 14px when in linking selection
- Nearby buildings: 12px gray dots, grow to 14px red when selected
- Linked group members: 14px colored dots (blue = merged/same building, orange = linked)
- All selected markers normalize to 14px for visual consistency

## Profile System Internals

**Key pattern:** `getStoredProfiles()` in `profileStorage.ts` returns both `state.storedProfiles` (saved on logout) AND `state.currentProfile` (active user). This is critical — many features (delegate voting, governance) iterate all profiles. If `currentProfile` is missing, the active user becomes invisible.

**Invite codes:** Created via `createInviteAsync()`. If cloud sync fails (Supabase foreign key constraint when profile hasn't synced), codes are marked `localOnly: true` and show an orange warning in the UI.

## Governance System Details

**Location:** `src/lib/storage/governanceStorage.ts`, `src/lib/storage/delegateStorage.ts`

### Bookchin Principle
Administrators cannot vote on app governance. This ensures decisions reflect tenant needs, not admin preferences.

### Role Hierarchy
| Role | Voting Rights |
|------|---------------|
| Tenant | Bloc-level proposals (1 person = 1 vote) |
| Organizer | Bloc + App governance (weighted by representation) |
| Admin | **None** (Bookchin principle) |

### Delegate Qualification
To become a delegate with app-wide voting power:
- 10+ verified tenants represented
- 1+ bloc organized
- 50+ activity score

### Delegate Weight Formula
```
Base = sqrt(verified_tenants) × 5
Activity Bonus = min(activity_score / 100, 0.5)  // capped at 50%
Final Weight = min(Base × (1 + Activity Bonus), 100)  // capped at 100
```

### Activity Score
| Activity | Points |
|----------|--------|
| Create proposal | +10 |
| Vote on proposal | +2 |
| Organize building | +5 |

### Voting Thresholds

**Bloc-Level (Simple Majority):**
| Type | Threshold |
|------|-----------|
| rename, add-property, alliance, merge | +3 votes |
| remove-property, split, escalate | +5 votes |
| mute-tenant | +7 votes |
| rent-strike | +10 votes |

**App-Wide (Weighted Delegates):**
| Type | Weight Threshold |
|------|------------------|
| content-vote | 10 points |
| feature-vote, tab-visibility | 15 points |
| direction-vote | 20 points |
| admin-recall | 50 points + 2/3 supermajority + 3 delegates |

### Officer Elections
- Ranked Choice Voting (RCV)
- 15% quorum required
- 2-term limit per position
- Positions: President, Vice President, Secretary, Treasurer

## Onboarding Checklist

**Note on dual Onboarding directories:** `components/Onboarding/` = persistent checklist widget (the "Getting Started" checklist); `components/Profile/Onboarding/` = profile setup wizard (different features, same name prefix).

**Location:** `src/components/Onboarding/OnboardingChecklist.tsx`, `src/contexts/OnboardingContext.tsx`

The "Getting Started" checklist guides new users through initial setup:
1. Create your profile
2. Find your building
3. Join building chat
4. Explore the library
5. Check mutual aid

**Mobile behavior:** Auto-minimizes on mobile (<768px) to save screen space. Users can tap the header to expand. Preference is remembered for the session via `sessionStorage`.

**State persistence:** `localStorage` key `rstu_onboarding_state` stores:
- `checklistItems` - completion status for each item
- `checklistDismissed` - permanently hidden
- `checklistMinimized` - collapsed state
- `toursCompleted` - feature tour completion

**Dismissal:** Users can permanently dismiss via "Hide checklist" link, or it auto-hides when all items are complete.

## Canvassing & Unit Tracker

**Location:** `src/lib/storage/canvassStorage.ts`

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

## Reading Library Maintenance

The reading library has been cleaned to remove web scraping artifacts. Two cleanup scripts are available:

### cleanup-reading-docs.py (v1)
Removes metadata artifacts from web scraping:
- Inline metadata lines (`Title Date: Unknown Source: URL Tags: ...`)
- Bold metadata blocks (`**Date:** ... **Source:** ... **Tags:**`)
- Duplicate titles after frontmatter
- Web UI artifacts (`Donate Here`, `Download PDF`, `Print PDF`)

### cleanup-reading-docs-v2.py (v2)
Removes browser print artifacts:
- Page markers (`X of Y M/D/YY, H:MM AM/PM` headers)
- Page break markers (`-- ## Page X`)
- URL header lines (orphan URLs from scraping)
- Repeated title prefixes (`Title | Site` before numbered content)
- Standalone dashes and empty headings
- Orphan title lines at document ends

**Usage:**
```bash
# Audit - check for issues without modifying
python3 scripts/maintenance/cleanup-reading-docs-v2.py audit

# Dry run - preview what would be cleaned
python3 scripts/maintenance/cleanup-reading-docs-v2.py dry-run

# Clean - execute cleanup (prompts for confirmation)
python3 scripts/maintenance/cleanup-reading-docs-v2.py clean

# Empty - find documents with no real content
python3 scripts/maintenance/cleanup-reading-docs-v2.py empty
```

**When to run:** After bulk-importing new documents from web sources.

**Document categories (14):**
- abolition, arts-culture-music, contemporary-analysis, economic-alternatives
- environmental-justice, feminist-theory, housing, international-solidarity
- labor, notes, organizing, technology-digital-justice, theory, youth-student-organizing

## Landing Page System

**Location:** `src/lib/storage/landingPageStorage.ts`, `src/components/LandingPage/`

The landing page is fully customizable with 14 preset pages representing different rhetorical framings:

| ID | Name | Framing |
|----|------|---------|
| page-1 | Default | Standard RSTU branding |
| page-2 | RSTU.org Mirror | Organization website style |
| page-3 | Feature Tour | App capabilities walkthrough |
| page-4 | Corporate Greed | "Wall Street Is Your Landlord" - Blackstone/PE focus |
| page-5 | Know Your Rights | Legal empowerment, Javins v. First National |
| page-6 | Historical Justice | "The Housing Crisis Was Built" - FHA redlining |
| page-7 | Organizing Works | "Tenants Win When Tenants Organize" - KC Tenants model |
| page-8 | Class Solidarity | "Your Rent Funds the Billionaire Class" - labor-tenant alliance |
| page-9 | Mutual Aid | "Neighbors Helping Neighbors" - community care, solidarity |
| page-10 | Faith & Morality | "Housing is a Moral Imperative" - religious/values framing |
| page-11 | Data & Evidence | "The Numbers Don't Lie" - research-based, Eviction Lab |
| page-12 | Personal Stories | "Real Tenants, Real Struggles" - lived experience |
| page-13 | Democratic Control | "We Run This" - Bookchin-style participatory democracy |
| page-14 | Environmental Justice | "Housing Instability Kills" - climate intersection |

All presets include full i18n support (EN, ES, TL, ZH, VI).

**Section Types:** hero, text, cards, rights, organizing, crisis, action, cta, how-it-works, manifesto, values, philosophy, readings

**Key Functions:**
- `getLandingPages()` - Returns all pages, restores deleted presets
- `setActiveLandingPage(id)` - Sets which page is displayed
- `updateLandingPage(id, config)` - Saves customizations

## Mobile Responsiveness

**Breakpoints:** Standard Tailwind (`md:` = 768px, `lg:` = 1024px)

**Key mobile patterns:**
- **Navigation:** Hamburger menu on mobile, horizontal tabs on desktop
- **Tools tabs:** Single row at all widths (no `flex-wrap` to prevent stacking)
- **Onboarding checklist:** Auto-minimizes on mobile (<768px)
- **Property view:** Full-width panels stack vertically on mobile

**Testing mobile:** Run `tests/e2e/canvassing-mobile.spec.ts` to capture screenshots at 390x844 (iPhone 13) viewport. Screenshots save to `mobile-screenshots/`.

## Keyboard Shortcuts

- `Ctrl+Shift+A` - Toggle admin mode (reading library editing)
- `Ctrl+Shift+E` - Toggle edit mode (GitHub token setup on first use)
- `Ctrl+click` - Select map markers for property linking (Blocs)

## Admin Features

- **Keyboard shortcut:** `Ctrl+Shift+A` toggles admin login/logout
- **Admin capabilities:** Edit document titles, hide/show documents, delete documents
- **Admin state:** Syncs to Supabase (`document_admin_state`, `document_edits` tables) with localStorage fallback
- **Database schema:** `infrastructure/supabase/` (numbered SQL files)

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

**Claude Code GitHub Action:** `.github/workflows/claude.yml` triggers Claude Code on `@claude` mentions in issues/PRs. Requires `CLAUDE_CODE_OAUTH_TOKEN` secret in repo settings. See `GITHUB_SETUP_GUIDE.md` for setup.

**Git note (WSL/NTFS):** File permissions are committed as `100755` due to WSL/NTFS. Suppress noise with:
```bash
git config core.fileMode false
```

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Next.js static export (SSG) | Free hosting on GitHub Pages, no server costs, simple deployment |
| localStorage-first state | Fast local performance, works offline; Supabase is optional cloud sync |
| Socket.io for chat | Real-time messaging with server persistence; self-hosted on Render |
| 5-language i18n | Serve diverse tenant communities (EN/ES/TL/ZH/VI) |
| Property intelligence SQLite → JSON | 192k property DB exported to ~3.6 MB JSON at build time; no runtime DB needed |

## Reno-Sparks Housing Statistics

Key statistics for understanding the local crisis (sourced from `archive/project-docs/reno-sparks-housing-statistics.md`):

| Metric | Value |
|--------|-------|
| Nevada renters who are cost-burdened | 57% |
| Rent increase since 2019 | 40-45% |
| Hours/week at minimum wage for 1-bed | 82 hours |
| Reno-Sparks households that are renters | 51% |
| 2-bedroom rent (Reno) | $1,550-$1,818 |
| Income needed for 2-bed at Fair Market Rent | $30.42/hour ($63,280/year) |

**National Corporate Landlord Context:**
- Large institutional landlords are 8% more likely to evict than small landlords
- PE-backed firms are 18-19% more likely to evict
- Corporate landlords in Kansas City: 3.7x more likely to file evictions
- Projected institutional control by 2030: 40% of single-family rentals

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
