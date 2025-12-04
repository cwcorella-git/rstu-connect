# RSTU Connect Repository Structure

**Last Updated:** December 4, 2025

This document explains the organization and purpose of each directory in this repository.

---

## Active Directories (Current System)

### `/src/` - Next.js Application Source Code
**Purpose:** Main application codebase for the RSTU Connect web platform.

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout (header/footer)
│   ├── page.tsx           # Homepage (Organize + Reading tabs)
│   └── globals.css        # Tailwind CSS styles
├── components/            # React components
│   ├── BuildingList.tsx           # Building directory sidebar
│   ├── BuildingCard.tsx           # Individual building card
│   ├── BuildingChatEmbed.tsx      # Tlk.io chat iframe
│   ├── BuildingMetadata.tsx       # Building info overlay
│   ├── Navigation.tsx             # Main navigation tabs
│   └── Reading/                   # Reading library components
│       ├── ReadingList.tsx        # Document list sidebar
│       ├── ReadingCard.tsx        # Individual document card
│       ├── ReadingContent.tsx     # Markdown viewer
│       ├── ReadingToolbar.tsx     # Favorite/Share buttons
│       ├── AdminLogin.tsx         # Admin authentication
│       └── DocumentEditor.tsx     # Document title editor
├── contexts/              # React Context providers
│   └── TabContext.tsx            # Active tab state management
└── lib/                   # Utility functions
    ├── getBuildingsData.ts       # Building data interface
    ├── getReadingData.ts         # Document manifest interface
    ├── readingStorage.ts         # localStorage for reading progress
    └── adminStorage.ts           # localStorage for admin state
```

**Technology:** Next.js 14, React, TypeScript, Tailwind CSS

---

### `/docs/` - Organizing Library Documents (1,738 files)
**Purpose:** Complete collection of organizing resources, tenant guides, and political theory.

**Structure:**
```
docs/
├── additional/              # Diverse organizing resources
├── classic-theory/          # Kropotkin, Bakunin, foundational texts
├── contemporary-analysis/   # Bookchin, modern organizing theory
├── historical/              # Historical labor movements
├── housing-rent-tenants/    # Tenant organizing resources
├── labor-unions/            # Union organizing guides
├── organizing-action/       # Direct action tactics
├── police-enforcement/      # Police abolition resources
├── property-landlords/      # Landlord analysis
├── strikes/                 # Strike organizing
└── README.md               # Library documentation
```

**Format:** Markdown (.md) files with YAML frontmatter
**Processing:** Build-time manifest generation via `scripts/generate-reading-manifest.js`
**Output:** `src/data/reading-manifest.json`

**Important:** This is the **source of truth** for the reading library. All documents are synced from `~/organizing-library`.

---

### `/data/` - Property Intelligence & Datasets
**Purpose:** Organizing intelligence platform data - property records, ownership analysis, campaign tracking.

```
data/
├── databases/                       # SQLite databases
│   ├── main_properties.db          # PRIMARY: 192,463 Washoe County properties
│   ├── washoe_parcels.db           # Source data (192,463 properties)
│   ├── organizing_campaigns.db     # Campaign tracking
│   ├── property_intelligence.db    # Strategic property analysis
│   ├── landlord_accountability.db  # Corporate landlord networks
│   └── organizing_targets.db       # Prioritized organizing targets
├── apartment_complexes/            # Large apartment complex analysis
├── census_demographics/            # Census data for organizing
├── comprehensive_reports/          # Generated analysis reports
├── hud_housing_data/              # HUD data
├── massive_apartment_complexes/   # 200+ unit properties
├── nevada_properties/             # Nevada-wide property data
├── nevada_statewide_expanded/     # Expanded Nevada dataset
├── organizing/                    # Organizing campaign data
├── organizing_intelligence/       # Strategic intelligence reports
├── ownership_analysis/            # Corporate landlord analysis
├── raw_data/                      # Unprocessed source data
├── reports/                       # JSON reports
└── *.json, *.csv                  # Various data files
```

**Key Database:** `main_properties.db` (398MB)
- 192,463 property records
- Owner information, addresses, parcel data
- GPS coordinates (WGS84)
- 99.97% data quality

**Future Integration:** Connect property data to the Organize tab for building-specific organizing resources.

**Status:** NOT currently used by the live site, but preserved for future features.

---

### `/public/` - Static Assets
**Purpose:** Publicly accessible files served directly by Next.js.

```
public/
├── documents/              # Built markdown documents (generated)
│   ├── Additional/
│   ├── Archives/
│   ├── Classic Theory/
│   ├── Contemporary Analysis/
│   ├── Content & Communication/
│   ├── Docs/
│   ├── Historical/
│   ├── Housing Rent Tenants/
│   ├── Labor Unions/
│   ├── Legislation/
│   ├── Meeting Minutes/
│   ├── Organizing Action/
│   ├── Police Enforcement/
│   ├── Property Landlords/
│   ├── Strikes/
│   └── Strategic Intelligence/
└── [other static assets]
```

**Note:** `public/documents/` is **generated at build time** by copying from `docs/`. Do not edit directly.

---

### `/scripts/` - Build & Utility Scripts
**Purpose:** Automation scripts for build process and data management.

```
scripts/
├── generate-reading-manifest.js   # Scans docs/ and generates manifest
├── fix-frontmatter.js            # Repairs malformed YAML frontmatter
└── deploy.sh                     # Deployment script (legacy)
```

**Usage:**
- `generate-reading-manifest.js` runs automatically during `npm run build` (prebuild hook)
- `fix-frontmatter.js` can be run manually: `node scripts/fix-frontmatter.js`

---

### `/.github/` - CI/CD Configuration
**Purpose:** GitHub Actions workflows for automated deployment.

```
.github/
└── workflows/
    └── deploy.yml          # Automatic deployment to Neocities
```

**Deployment Flow:**
1. Push to `main` branch
2. GitHub Actions runs `npm run build`
3. Static files copied to Neocities
4. Site live at https://rstu-connect.neocities.org

---

### Configuration Files (Root)

- **`package.json`** - Node.js dependencies and scripts
- **`next.config.js`** - Next.js configuration (static export, base path)
- **`tailwind.config.ts`** - Tailwind CSS configuration (RSTU red theme)
- **`tsconfig.json`** - TypeScript configuration
- **`postcss.config.mjs`** - PostCSS configuration for Tailwind
- **`.gitignore`** - Git ignore patterns
- **`.env.local`** - Environment variables (not in git)

---

## Documentation Files (Root)

- **`README.md`** - Main project documentation
- **`CLAUDE.md`** - Instructions for Claude Code AI assistant
- **`ADMIN_GUIDE.md`** - Admin panel usage guide
- **`REPO_STRUCTURE.md`** - This file
- **`SESSION_NOTES_2025-12-04.md`** - Development session notes

---

## Archived/Legacy Directories (See `/archive/`)

The following directories contain outdated systems that have been replaced:

### `/relay-server/` - ❌ DEPRECATED
**Status:** Archived (Gun.js relay server)
**Replacement:** Tlk.io embedded chat (no backend needed)
**Reason:** Gun.js had CSRF cookie errors, authentication issues, and complexity

### `/netlify-element-config/` - ❌ DEPRECATED
**Status:** Archived (Matrix/Element deployment config)
**Replacement:** Tlk.io embedded chat
**Reason:** Matrix deployment was complex, required separate hosting

### `/documents/` - ❌ DEPRECATED
**Status:** Archived (old document structure)
**Replacement:** `docs/` directory with build-time generation to `public/documents/`
**Reason:** Duplicated structure, now auto-generated from `docs/`

### `/404/` - ❌ DEPRECATED
**Status:** Archived (custom 404 page)
**Replacement:** Next.js built-in 404 handling
**Reason:** Can be integrated into Next.js App Router

---

## Build Output Directories (Generated - Not in Git)

### `/.next/` - Next.js Build Cache
**Generated by:** `npm run build` or `npm run dev`
**Purpose:** Next.js internal build cache and development server files
**Git Status:** Ignored

### `/out/` - Static Export Output
**Generated by:** `npm run build` (via `next build && next export`)
**Purpose:** Final static HTML/CSS/JS for deployment
**Git Status:** Ignored
**Deployment:** These files are deployed to Neocities

### `/node_modules/` - NPM Dependencies
**Generated by:** `npm install`
**Purpose:** Third-party packages and dependencies
**Git Status:** Ignored

### `/_next/` - Deployed Static Assets (Root)
**Generated by:** `npm run build` (copied from `out/_next/`)
**Purpose:** Next.js static assets for Neocities deployment
**Git Status:** Committed (required for static hosting)
**Note:** This is a copy of `out/_next/` placed in root for Neocities

---

## Data Flow Diagram

```
Source Documents (docs/)
    ↓
[Build Time: scripts/generate-reading-manifest.js]
    ↓
Manifest (src/data/reading-manifest.json)
    ↓
[Next.js Build: npm run build]
    ↓
Static Site (out/)
    ├── HTML pages
    ├── CSS/JS bundles
    └── Copied docs (out/documents/)
    ↓
[Deployment: GitHub Actions]
    ↓
Production (rstu-connect.neocities.org)
```

---

## Key Design Decisions

### 1. Static Site Generation
**Choice:** Next.js static export (SSG)
**Why:** Free hosting on Neocities, no server costs, fast performance

### 2. Tlk.io for Chat
**Choice:** Embedded Tlk.io iframes for building chat rooms
**Why:**
- No login required (zero friction for tenants)
- Mobile-friendly
- Free unlimited rooms
- No CSRF/authentication issues

### 3. localStorage for User Data
**Choice:** Client-side storage for reading progress, favorites, admin state
**Why:**
- No backend needed
- Privacy-first (data never leaves user's browser)
- Fast performance
- Simple implementation

### 4. YAML Frontmatter for Documents
**Choice:** Markdown with YAML frontmatter
**Why:**
- Human-readable
- Version control friendly
- Easy to edit
- Rich metadata support

---

## Future Expansion Plans

### Phase 1: Property Integration
- Connect `data/databases/main_properties.db` to Organize tab
- Building-specific organizing resources
- Property owner tracking
- Campaign progress tracking

### Phase 2: Collaborative Features
- Multi-user document editing
- Shared annotations
- Campaign coordination tools

### Phase 3: Mobile Optimization
- Progressive Web App (PWA)
- Offline document access
- Field organizer tools

### Phase 4: Multilingual Support
- Spanish translations
- Language switcher
- Bilingual organizing materials

---

## Development Guidelines

### Adding New Documents
1. Add markdown files to `docs/` directory
2. Ensure proper YAML frontmatter:
   ```yaml
   ---
   title: "Document Title"
   author: "Author Name"
   date: 2025
   ---
   ```
3. Run `npm run build` to regenerate manifest
4. Commit and push (auto-deploys)

### Modifying UI Components
1. Edit files in `src/components/` or `src/app/`
2. Test locally: `npm run dev`
3. Build: `npm run build`
4. Commit and push (auto-deploys)

### Working with Property Data
1. SQLite databases in `data/databases/`
2. Query with: `sqlite3 data/databases/main_properties.db`
3. Document schema in `CLAUDE.md`

---

## Maintenance Notes

### Regular Tasks
- [ ] Sync new documents from `~/organizing-library` monthly
- [ ] Run `node scripts/fix-frontmatter.js` after adding bulk documents
- [ ] Review admin-hidden documents quarterly
- [ ] Backup localStorage data (export admin state)

### Monitoring
- **Build Status:** Check GitHub Actions for failed deployments
- **Site Health:** Test https://rstu-connect.neocities.org regularly
- **Document Count:** Should match manifest (currently 1,738)

---

## Support & Contact

**Repository:** https://github.com/cwcorella-git/rstu-connect
**Live Site:** https://rstu-connect.neocities.org
**Organization:** Reno-Sparks Tenants Union
**Main Site:** https://renosparkstenantsunion.org

---

**Document Version:** 1.0
**Last Reviewed:** December 4, 2025
