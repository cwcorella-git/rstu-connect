# RSTU Platform - Development Guide

## Phase 1 Implementation: Core Organizing Features

This document describes the mockup site for RSTU's tenant organizing platform, focusing on Phase 1 features that support ground-level organizing work.

## What Has Been Built

### Project Structure

```
rstu-0.03/
├── apps/
│   ├── web/                    # Next.js 14 frontend
│   │   ├── src/
│   │   │   ├── app/           # Pages
│   │   │   │   ├── page.tsx           # Home page
│   │   │   │   ├── landlords/page.tsx # Landlord search
│   │   │   │   ├── buildings/page.tsx # Building tracker
│   │   │   │   ├── buildings/[id]/    # Campaign detail
│   │   │   │   ├── properties/[id]/   # Property detail
│   │   │   │   ├── get-started/       # Organizing guide
│   │   │   │   ├── join/              # Organizer recruitment
│   │   │   │   ├── help/              # Tenant rights
│   │   │   │   ├── canvassing/intake/ # Intake form
│   │   │   │   └── layout.tsx         # Root layout
│   │   │   ├── components/     # Reusable React components
│   │   │   ├── lib/            # Utilities and API clients
│   │   │   ├── hooks/          # Custom React hooks
│   │   │   ├── stores/         # Zustand state management
│   │   │   ├── types/          # TypeScript types
│   │   │   └── utils/          # Helper functions
│   │   ├── public/             # Static assets
│   │   ├── next.config.js      # Next.js configuration
│   │   ├── tailwind.config.ts  # Tailwind CSS config
│   │   ├── tsconfig.json       # TypeScript config
│   │   └── package.json
│   │
│   └── api/                    # Python FastAPI backend
│       ├── main.py            # Main API application
│       ├── requirements.txt    # Python dependencies
│       └── package.json
│
├── data/
│   └── databases/             # SQLite databases
│       ├── washoe_properties_production.db    # Property ownership
│       ├── organizing_campaigns.db            # Campaign tracking
│       └── organizing_targets.db              # Organizing targets
│
├── content/                   # Educational materials
├── docs/                      # Technical documentation
├── Makefile                   # Development commands
└── package.json              # Root package config
```

## Phase 1 Features

### 1. Home Page (`/`)
**Purpose:** Explain RSTU mission and provide entry points for three user types

**Features:**
- Hero section with RSTU branding
- Three pathways: Organize My Building, Join as Organizer, Have Housing Problem
- Active campaigns spotlight (Marina's Edge, Redfield Ridge)
- Research tools section with links to database and tracker
- Call-to-action for membership

**Data:** Static content + two active campaigns from meeting notes

### 2. Landlord Database (`/landlords`)
**Purpose:** Make property ownership searchable and transparent

**Features:**
- Search by: Address, Landlord Name, APN, Neighborhood
- Connected to real Washoe County property database (washoe_properties_production.db)
- Shows: Address, Owner, Units, Estimated Tenants, Property Details
- "Flag for Organizing" button on each property
- Information cards explaining why this data matters

**Technical:**
- Frontend: React form with Axios API calls
- Backend: FastAPI endpoints for property search
- Database: SQLite with 192,463 Washoe County properties

### 3. Building Tracker (`/buildings`)
**Purpose:** Centralized view of all active campaigns and their status

**Features:**
- Filter by campaign status: Intelligence, Organizing, Commitment, Preparation, Strike, Resolved
- Shows for each building:
  - Name and address
  - Status badge
  - Unit count and tenant contact rate
  - Progress bar (% of tenants contacted)
  - Committee formation status
  - Organizing notes
- "View Campaign", "Join Canvassing", "Share Update" buttons

**Data:** Mock campaigns based on RSTU meeting notes:
  - Marina's Edge: 48 units, 5 tenants contacted, organizing phase
  - Redfield Ridge: 62 units, 12 tenants contacted, committee formed
  - Downtown Lofts: 35 units, 0 contacted, intelligence gathering

### 4. Campaign Detail (`/buildings/:id`)
**Purpose:** Deep view into active campaign with strategy, timeline, and action steps

**Features:**
- Campaign overview with stats
- Demands list
- Committee member directory (encrypted in production)
- Campaign timeline showing organizing progression
- Next action section with CTA button
- Contact section for involvement

**Data:** Populated from API endpoint `/api/campaigns/{id}`

### 5. Property Detail (`/properties/:id`)
**Purpose:** Show detailed ownership and value information for individual properties

**Features:**
- Basic property information (owner, APN, units, year built)
- Property valuation (assessed values, last sale price)
- "Flag for Organizing" action
- Links back to search results

**Data:** From washoe_properties_production.db

### 6. Get Started Guide (`/get-started`)
**Purpose:** Walk through how building organizing actually happens

**Content:**
1. Connect with neighbors
2. Identify common issues
3. Form building committee with elected roles
4. Draft demands (template-based)
5. Take action (demands submission → negotiation → strike if needed)

**Tone:** Realistic about organizing being 90% follow-up, emphasis on building relationships

### 7. Join as Organizer (`/join`)
**Purpose:** Recruit people to do actual organizing work

**Content:**
- Who RSTU is looking for (committed, grounded, humble, persistent)
- What organizers actually do (canvassing, phone calls, campaign support, research, media)
- Time commitment flexibility
- Direct email CTA

**Tone:** Honest about what organizing requires, no sugarcoating

### 8. Tenant Help & Rights (`/help`)
**Purpose:** Quick reference for common housing problems

**Sections:**
- Eviction notices and legal rights
- Rent increases and protections
- Maintenance obligations
- Harassment and retaliation
- Free legal aid resources (Northern Nevada Legal Services)
- Step-by-step guidance

### 9. Canvassing Intake Form (`/canvassing/intake`)
**Purpose:** Organizers use this to record door-knocking conversations

**Fields:**
- Building address and unit number
- Tenant name, phone, email, preferred contact
- Primary issue (repairs, rent increase, habitability, eviction, harassment, other)
- Detailed issue description
- Interested in organizing? checkbox
- Date contacted

**Workflow:**
1. Organizer prints form or uses mobile
2. Fills out while at door or immediately after conversation
3. Submits form
4. Data added to contact list for follow-up
5. Organizer sees them on "Follow Up Queue" (Phase 2)

**Technical:**
- Form validation on frontend
- POST to `/api/canvassing/intake`
- Success confirmation with message about follow-up

## Backend API Endpoints

All endpoints at `http://localhost:8000`:

### Health & Info
- `GET /` - API root info
- `GET /health` - Health check with database connection status

### Property Search
- `GET /api/properties/search?q={query}&type={address|landlord|apn|neighborhood}` - Search properties
- `GET /api/properties/{id}` - Get property details

### Landlord Portfolio
- `GET /api/landlords/portfolio?landlord_name={name}` - Get all properties by landlord

### Campaigns
- `GET /api/campaigns` - List all campaigns
- `GET /api/campaigns/{id}` - Get campaign details

### Canvassing (Stub)
- `POST /api/canvassing/intake` - Submit intake form (mock)

## Technology Stack

### Frontend
- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios
- **State:** Zustand (for future use)
- **Data Fetching:** React Query (for future use)

### Backend
- **Framework:** FastAPI (Python)
- **Server:** Uvicorn
- **Database:** SQLite (existing databases)
- **Port:** 8000

### Development
- **Monorepo:** npm workspaces
- **Build:** Next.js built-in build system
- **Task Runner:** Make
- **Concurrency:** concurrently package

## Getting Started

### Prerequisites
- Node.js 18+ and npm 9+
- Python 3.9+
- Make (optional, but recommended)

### Installation

```bash
# Install all dependencies
npm install
npm install --prefix apps/web
pip install -r apps/api/requirements.txt

# Or using Make
make install
```

### Development Mode

```bash
# Start both frontend and backend
npm run dev
# or
make dev

# Frontend will be at: http://localhost:3002
# Backend API will be at: http://localhost:8000

# Start only frontend (port configurable)
PORT=3003 npm run dev:web

# Start only backend
npm run dev:api
```

### Health Check

```bash
# Test API is running
npm run health

# Or manually
curl http://localhost:8000/health
```

### Building for Production

```bash
npm run build
# or
make build
```

### Production Mode

```bash
npm run start
# or
make start
```

## Key Design Decisions

### 1. Organizer-First Over Member-Facing
- Features prioritize what RSTU organizers need (campaign tracker, canvassing intake)
- Not a social network or discussion forum
- Not optimizing for member engagement metrics

### 2. Ground-Level Organizing Reality
- Canvassing form reflects actual organizer workflow
- Building campaigns show real status from meeting notes
- Emphasis on follow-up (acknowledged as hardest part)

### 3. Data Transparency
- Property database is public (public records)
- Landlord portfolios searchable to identify leverage points
- Organizing target identification based on data analysis

### 4. Privacy Protection (for Phase 2+)
- Tenant contact info will be encrypted
- Three-tier data access (public/member/organizer-only)
- Cell structure protects member data from full visibility

### 5. No Over-Engineering
- Using existing Washoe County databases instead of building custom system
- Simple mock data for campaigns rather than full database layer
- Form submission stores data for follow-up, not complex workflow automation

## Next Steps (Phase 2)

### Member Portal Features
- Member dashboard (personal profile, buildings involved, history)
- Follow-up queue (calls to make, tasks to do)
- Task board (assignments with sign-ups and completion tracking)
- Calendar (meetings, actions, events)

### Organizing Dashboard (Organizer-Only)
- Real campaign CRUD (create, edit, delete campaigns)
- Contact database with follow-up status
- Canvassing route planning
- Committee management interface
- Demand tracking
- Strike logistics coordinator

### Intelligence & Analysis
- Landlord portfolio analysis
- Multi-building organizing opportunities
- Violation tracking (municipal records integration)
- Organizing strategy recommendations

### Strike Coordination (Dormant Until Activated)
- Strike dashboard (participation rate, impact, demands status)
- Tenant support coordination (groceries, legal, media)
- Negotiation tracking
- Media narrative management

### Coalition Coordination (For May 2028)
- Coalition partner directory
- Joint campaign planning
- Worker-tenant action coordination
- General strike readiness tracker

## Database Note

The mock site currently uses existing databases:
- `washoe_properties_production.db` - Real Washoe County property data
- Mock campaign data served via API

For Phase 2+, we'll add:
- `campaigns.db` - Real campaign CRUD
- `contacts.db` - Tenant contact tracking
- `canvassing.db` - Door-knock records and follow-up status
- `violations.db` - Landlord violation intelligence
- `strikes.db` - Strike coordination (dormant until activation)

## Troubleshooting

### API not connecting
```bash
# Make sure backend is running
npm run dev:api

# Check if port 8000 is available
lsof -i :8000

# Check API health
curl http://localhost:8000/health
```

### Frontend not starting
```bash
# Clear Next.js cache
rm -rf apps/web/.next

# Reinstall dependencies
cd apps/web && npm install

# Try again
npm run dev:web
```

### Database issues
```bash
# Check database file exists
ls -la data/databases/

# Verify database integrity
python3 << 'EOF'
import sqlite3
conn = sqlite3.connect('data/databases/washoe_properties_production.db')
cursor = conn.cursor()
cursor.execute("SELECT COUNT(*) FROM properties")
print(f"Properties in database: {cursor.fetchone()[0]}")
conn.close()
EOF
```

## File Changes Summary

### New Files Created (Phase 1)
- `apps/web/` - Complete Next.js application
- `apps/api/main.py` - FastAPI backend with property search
- `Makefile` - Development task runner
- `DEVELOPMENT.md` - This file

### Modified Files
- Root `package.json` - Added workspaces, scripts, and concurrently

### Existing Files Used
- `data/databases/washoe_properties_production.db` - Property ownership data
- Meeting notes from content/meetings/ - Campaign data seeding

## Questions?

For issues or questions about the mockup site, review the `site-outline.html` document which contains the complete strategic direction and design principles.
