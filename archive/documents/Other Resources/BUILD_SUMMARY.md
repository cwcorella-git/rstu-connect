# RSTU Platform Mockup - Build Summary

**Date:** November 2025
**Phase:** Phase 1 - Core Organizing Features
**Status:** Ready for Development Server Testing

## Overview

A hybrid Next.js + Python FastAPI mockup platform for tenant organizing in Reno-Sparks. This implementation focuses on supporting ground-level organizing work: canvassing, campaign tracking, property research, and coordination.

## Files Created

### Root Level
```
/package.json          - Root monorepo configuration with workspaces and scripts
/Makefile             - Development command shortcuts
/DEVELOPMENT.md       - Comprehensive development guide
/.gitignore           - Git exclusion rules
```

### Frontend (Next.js 14)
```
apps/web/
├── package.json                           - Frontend dependencies
├── next.config.js                         - Next.js configuration
├── tsconfig.json                          - TypeScript configuration
├── tailwind.config.ts                     - Tailwind CSS theme
├── postcss.config.js                      - PostCSS plugins
├── .eslintrc.json                         - ESLint rules
├── src/app/
│   ├── layout.tsx                         - Root layout with nav/footer
│   ├── globals.css                        - Global Tailwind styles
│   ├── page.tsx                           - Home page (hero + pathways + campaigns)
│   ├── landlords/page.tsx                 - Landlord database search
│   ├── buildings/page.tsx                 - Building campaign tracker
│   ├── buildings/[id]/page.tsx            - Campaign detail view
│   ├── properties/[id]/page.tsx           - Property detail view
│   ├── get-started/page.tsx               - Organizing guide (5-step process)
│   ├── join/page.tsx                      - Organizer recruitment
│   ├── help/page.tsx                      - Tenant rights & legal resources
│   └── canvassing/intake/page.tsx         - Canvassing intake form (organizer tool)
├── src/components/                        - Reusable React components (directory structure)
├── src/lib/                               - Utility functions and API clients
├── src/hooks/                             - Custom React hooks
├── src/stores/                            - Zustand state management
├── src/types/                             - TypeScript type definitions
└── src/utils/                             - Helper functions
```

### Backend (Python FastAPI)
```
apps/api/
├── main.py                                - FastAPI application with all endpoints
├── requirements.txt                       - Python package dependencies
└── package.json                           - Node.js stub (for monorepo)
```

### Configuration Files
```
/apps/web/.eslintrc.json                   - ESLint configuration
```

## API Endpoints Implemented

### Health & Information
- `GET /` - API info and available endpoints
- `GET /health` - Health check with database status

### Property Search (Connected to Real Data)
- `GET /api/properties/search?q={query}&type={address|landlord|apn|neighborhood}` - Search Washoe County properties
- `GET /api/properties/{id}` - Get property details
- `GET /api/landlords/portfolio?landlord_name={name}` - Get all properties by landlord

### Campaign Management (Mock Data)
- `GET /api/campaigns` - List all campaigns
- `GET /api/campaigns/{id}` - Get campaign details

### Canvassing (Stub for Phase 2)
- `POST /api/canvassing/intake` - Submit canvassing form

## Pages Implemented

| Page | URL | Purpose | Status |
|------|-----|---------|--------|
| Home | `/` | Hero, three pathways, active campaigns | ✓ Complete |
| Landlord Search | `/landlords` | Search property database | ✓ Complete |
| Building Tracker | `/buildings` | View all campaigns and status | ✓ Complete |
| Campaign Detail | `/buildings/:id` | Campaign strategy, timeline, demands | ✓ Complete |
| Property Detail | `/properties/:id` | Ownership and value information | ✓ Complete |
| Get Started | `/get-started` | 5-step organizing guide | ✓ Complete |
| Join as Organizer | `/join` | Recruitment for organizers | ✓ Complete |
| Tenant Help | `/help` | Rights information and legal resources | ✓ Complete |
| Canvassing Intake | `/canvassing/intake` | Form for recording door conversations | ✓ Complete |

## Key Features Implemented

### 1. Landlord Database Integration
- Connected to real `washoe_properties_production.db` with 192,463 properties
- Search by address, landlord name, APN, neighborhood
- Shows unit counts and ownership information
- Transparent property ownership view

### 2. Building Campaign Tracker
- Status filtering (Intelligence, Organizing, Commitment, Preparation, Strike, Resolved)
- Campaign progress visualization
- Committee formation status
- Next actions and CTA buttons

### 3. Canvassing Workflow Support
- Intake form for organizing conversations
- Captures tenant info, issues, organizing interest
- Mobile-optimized form design
- Prepares data for follow-up queue (Phase 2)

### 4. Organizing Information
- Educational content on how organizing works
- Realistic about organizing being relationship-based
- Emphasis on follow-up and persistence
- Committee structure and roles

### 5. Tenant Rights & Help
- Quick reference for common housing problems
- Legal aid contact information
- Step-by-step guidance for different situations
- Connection to free legal services

## Database Integration

### Property Database
- **File:** `data/databases/washoe_properties_production.db`
- **Tables:** properties, ownership_history, sales_history, collection_tracking
- **Records:** 192,463 properties in Washoe County
- **Use:** Public property search and ownership transparency

### Campaign Data (Mock)
- **Source:** Meeting notes from RSTU organizing
- **Current Data:**
  - Marina's Edge: 48 units, 5 contacted, organizing phase
  - Redfield Ridge: 62 units, 12 contacted, committee formed
  - Downtown Lofts: 35 units, 0 contacted, intelligence phase
- **Status:** API returns mock JSON, will connect to database in Phase 2

## Technology Stack Summary

### Frontend
- **Framework:** Next.js 14 (React 18, TypeScript)
- **Styling:** Tailwind CSS v3
- **HTTP:** Axios (in future use)
- **State:** Zustand (structure ready, not yet used)
- **Data Fetching:** React Query (structure ready, not yet used)

### Backend
- **Framework:** FastAPI (Python 3.9+)
- **Server:** Uvicorn
- **Database:** SQLite
- **CORS:** Enabled for local development

### Development
- **Monorepo:** npm workspaces
- **Task Runner:** Make
- **Concurrency:** concurrently npm package
- **Linting:** ESLint (Next.js config)

## How to Use

### Installation
```bash
make install
# or
npm install && npm install --prefix apps/web && pip install -r apps/api/requirements.txt
```

### Development Mode
```bash
make dev
# Frontend: http://localhost:3002
# Backend: http://localhost:8000
```

### Building
```bash
make build
```

### Production
```bash
make start
```

## Design Principles

1. **Organizer-First** - Features support what organizers actually do (canvassing, tracking, coordination)
2. **Ground-Level Reality** - Acknowledges organizing is relationship-building, 90% follow-up
3. **Data Transparency** - Property and ownership data made searchable and public
4. **Privacy by Design** - Structure for encrypted contact data (Phase 2+)
5. **Simple > Fancy** - No unnecessary features, focus on core organizing workflow

## Phase 1 Scope

✓ Home page with three user pathways
✓ Landlord database search with real data
✓ Building campaign tracker
✓ Campaign detail pages
✓ Property detail pages
✓ Organizing education content
✓ Canvassing intake form
✓ Tenant rights information
✓ FastAPI backend with property search
✓ Makefile for development
✓ Development documentation

## Phase 2 (Not Yet Implemented)

- [ ] Member portal (personal dashboard)
- [ ] Follow-up queue (call tracking)
- [ ] Task board (Kanban-style assignments)
- [ ] Calendar (meetings and events)
- [ ] Campaign CRUD (create/edit campaigns)
- [ ] Contact database (encrypted)
- [ ] Strike coordination module
- [ ] Coalition coordination features
- [ ] Real database persistence for campaigns
- [ ] User authentication and roles

## Phase 3 (Future)

- [ ] Mobile app
- [ ] SMS integration
- [ ] Landlord intelligence analysis
- [ ] Violation tracking integration
- [ ] May 2028 general strike coordination
- [ ] Worker-tenant coalition tools
- [ ] Advanced analytics and reporting

## Testing Status

- **Code Quality:** ESLint configured, not yet run
- **Unit Tests:** Not yet implemented
- **Integration Tests:** Not yet implemented
- **Manual Testing:** Ready for development server testing
- **Database:** Real property database integrated and queryable

## Next Actions

1. **Test Development Servers:** Run `make dev` and verify both frontend and backend start
2. **Test API Endpoints:**
   - Visit http://localhost:8000/health
   - Search for properties at http://localhost:3002/landlords
   - View campaign tracker at http://localhost:3002/buildings
3. **Populate Real Data:** Add real RSTU organizing data from meeting notes to campaign endpoints
4. **Phase 2 Planning:** Scope organizer-specific features (member portal, follow-up queue, etc.)

## Important Notes

### Environment Variables
- `NEXT_PUBLIC_API_URL` defaults to `http://localhost:8000` (for development)
- Set to production API URL when deploying

### Port Configuration
- Frontend: `3002` (customizable via `PORT` env var)
- Backend: `8000` (hardcoded in main.py, change if needed)

### Database Access
- Property database is read-only (public data)
- Campaign data is currently mock (will add CRUD in Phase 2)
- No sensitive tenant data stored yet (Phase 2 feature)

## File Statistics

**Total Files Created:** 23
**Lines of Code:**
- TypeScript/JavaScript: ~3,500 lines
- Python: ~450 lines
- CSS: ~200 lines
- Configuration: ~300 lines

**Total:** ~4,450 lines of code

## Questions?

Refer to:
- `/DEVELOPMENT.md` - Comprehensive development guide
- `/site-outline.html` - Strategic direction and design principles
- `/apps/api/main.py` - API endpoint documentation in docstrings
- Meeting notes in `/content/meetings/` - Organizing context and data

---

**Status:** ✓ Phase 1 Complete - Ready for Testing and Phase 2 Development
