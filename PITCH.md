# RSTU Connect: Tenant Organizing Intelligence Platform
## Comprehensive Technical Pitch

**Live Demo:** https://cwcorella-git.github.io/rstu-connect/

---

## Executive Summary

RSTU Connect is a **strike coordination weapon** disguised as a tenant organizing website. Built on the principle that *"the platform serves organizing, organizing doesn't serve the platform,"* it combines property intelligence, decentralized communication, and field canvassing tools into a single mobile-first application.

**Core Philosophy:** "Homes for People, Not for Profit"

**What makes this different:** Every feature answers one question: *"Does this help us win a rent strike?"*

---

## The Problem

### Why Legislation Fails
- Rent is not a policy failure—it's a **power relationship**
- Marx (1844): Landlords extract rent purely by possession, requiring NO labor
- Historical reality: Every housing victory came from **strikes, organized rent withholding, and collective refusal**—not legislation
- Legislation follows after power is demonstrated; it's a concession, not a victory

### Why Tenants Lose
- **Isolation:** "We all have the same problems" but landlords keep tenants separated
- **Information asymmetry:** Landlords know everything; tenants know nothing
- **No coordination tools:** Scattered across buildings with no way to organize collectively
- **Geographic dispersion:** Reno's sprawl makes in-person organizing difficult

---

## The Solution: What's Built

### 1. Property Intelligence Database
**14,158 properties** with comprehensive data:
- Owner name and mailing address (for accountability)
- Number of units, year built, square footage
- Total assessed value + cost per unit calculation
- Zoning codes with plain-language explanations
- GPS coordinates for mapping
- **365 properties with marketing names** (The Vintage, Sierra Vista, etc.)

**Data Pipeline:**
```
Washoe County Assessor (192,463 parcels)
    → SQLite processing (99.97% data accuracy)
    → Corporate landlord identification (48,593 entities)
    → Priority scoring (1-10 scale)
    → JSON export for website (2.16 MB compressed)
```

### 2. Interactive 3D Map
- **MapLibre GL JS** powered visualization
- All 14,158 properties plotted with coordinates
- Click any building for instant details
- 3D pitch/rotation, fullscreen mode
- Free tile service (no API costs)

### 3. Decentralized Chat System
- **Socket.IO** real-time messaging per building
- No login required—zero friction for tenants
- Connection status indicators
- **Proposal System:**
  - Location suggestions: `[LOCATION]` tagged
  - Meeting proposals: `[MEETING]` tagged
  - Vote tracking with up/down thumbs
- Message deletion (own messages only)
- Automatic reconnection with fallback polling

### 4. Profile System with Role-Based Access

**Three Roles:**
| Role | Access |
|------|--------|
| **Tenant** | Chat, property info, rent comparison |
| **Organizer** | + Canvassing tools, invite codes, user list |
| **Admin** | + Document management, role changes, data export |

**Trust Levels:**
- `Self-registered` - Created without invite
- `Invited` - Created via invite code
- `Verified` - Bootstrap admin or verified by organizer

**Invite Code System:**
- 6-character codes with QR generation
- Configurable: role granted, max uses, expiration
- Field onboarding: scan QR → create profile → linked to building
- Track usage and revoke codes

**Profile Data Collected:**
- Contact info (phone, email, preferred method, language)
- Household (occupants, children, pets, accessibility needs)
- Rent data (amount, lease type, move-in date, increases, deposit)
- Availability (work hours, best times, preferred days)
- Complaints (16 categories from maintenance to harassment)
- Organizing interest (7 levels from "attend meeting" to "take leadership")

### 5. Canvassing Tools (Organizers Only)

**Unit-by-Unit Tracking:**
- Contact status pipeline: Not Contacted → No Answer → Contacted → Interested → Active Member
- Add units individually or in ranges (e.g., "101-150", "A101-A110")
- Filter by status, sort by unit/status/updated
- Progress visualization per building

**Unit Intake Form (32 fields):**
- Contact info, household composition
- Complete rent/lease details
- 16 complaint categories with details
- Maintenance ratings and response times
- Community connections and organizing interest
- Follow-up scheduling

**Data Discrepancy Panel:**
- Actual unit count vs. county data
- Actual property name (marketing vs. legal)
- Property management company
- Verification tracking

**Export/Import:** Full JSON backup of all canvassing data

### 6. Document Library
- **857 documents** across 7 categories
- Tenant rights, organizing guides, legal resources
- Search/filter, favorites system
- Reading progress tracking (resume where you left off)
- **Admin controls:** Hide, edit, delete, restore documents

### 7. Mobile-First Design
- Responsive layout for field organizing
- Touch-friendly interfaces
- Offline-capable (localStorage + IndexedDB)
- Back buttons and smooth transitions

---

## Technical Architecture

### Frontend Stack
- **Next.js 14** - Static site generation (deploys anywhere free)
- **TypeScript** - Type safety across 42 component files
- **Tailwind CSS** - RSTU red (#cc0000), responsive design
- **MapLibre GL JS** - Open-source 3D mapping

### Backend/Data
- **Socket.IO** - Real-time chat (Render.com relay)
- **SQLite** - Property intelligence (build-time processing)
- **localStorage** - Client-side profiles, canvassing, preferences
- **No central database** - Data sovereignty by design

### Deployment
- **GitHub Pages** - Free static hosting
- **GitHub Actions** - Automated CI/CD
- **Render.com** - Free tier relay server
- **Total cost: $0/month**

### Data Scale
| Metric | Count |
|--------|-------|
| Properties in database | 192,463 |
| Properties on website | 14,158 |
| Corporate entities tracked | 48,593 |
| Large portfolios (10+ properties) | 627 |
| Eviction records | 7,500 |
| Documents | 857 |
| Database size | ~1.2 GB |

---

## Corporate Landlord Intelligence

### Already Identified
The system tracks **48,593 corporate entities** (34.2% of all Washoe owners).

**Top Priority Targets (Priority 8+/10):**
1. TOLL NORTH RENO LLC - 534 properties
2. GAGE VILLAGE COMMERCIAL DEV LLC - 361 properties, 3,335 units
3. MG LAKERIDGE LIVING APARTMENTS LLC - 440 properties
4. SWD-QUARRY BSV LLC - 341 properties
5. FCA REDFIELD RIDGE LLC - 300 properties

### Accountability Tracking
- Eviction rate per 100 units
- Code violation history
- Average resolution time
- Overall accountability score (1-100)
- Worst landlord rankings

---

## Philosophy & Design Principles

### Why This Architecture

**"If It Doesn't Serve Strike Coordination, Don't Build It"**

What we DON'T build:
- Forums for philosophy debates
- Social media metrics dashboards
- Meetings-for-meetings-sake tools
- Vague "consciousness raising" features

What we DO build:
- Clear demands, clear strategy, clear action
- Visible documented wins
- Rapid iteration cycles
- Decentralized execution tools

### Avoiding Movement Death

**Structural Protections:**
- No single leader = movement survives leadership loss
- Multiple simultaneous campaigns = continuous visible activity
- Distributed accountability = no one person controls all info
- Public strategy = members notice co-optation attempts

**Avoiding Co-optation:**
1. **Bureaucratization** → Simple structure, term limits
2. **Moderate leadership** → Democratic election and recall
3. **Legislative compromise** → Maintain strike threat
4. **NGO professionalization** → Member-funded, volunteer-led
5. **Infiltration** → Cell-based structure, rapid action

### Security Through Simplicity
- No central server to subpoena or shut down
- Anonymous chat participation
- Local-first data storage
- No tracking pixels or analytics

### Legal Framework (Nevada)
- **NRS Chapter 118A** protects tenant union organizing
- Anti-retaliation provisions for organizing activities
- 14-day repair timeline creates collective action leverage
- Civil remedies and DA enforcement available

---

## Planned Features (NOT YET IMPLEMENTED)

### Phase 2: Organizing Intelligence
- [ ] **Complaint pattern detection** - Identify systemic issues across buildings
- [ ] **Building organizing status** - Pipeline visualization (targeting → active → won)
- [ ] **Landlord profiles** - Public pages with violation history
- [ ] **Outreach logging** - Who's been contacted, by whom, when

### Phase 3: Campaign Coordination
- [ ] **Campaign dashboard** - Stages, demands, metrics, outcomes
- [ ] **Demand builder** - Template-based, votable demands
- [ ] **Strike coordination** - Real-time participation metrics
- [ ] **Victory archive** - Documented wins for recruitment proof

### Phase 4: Democratic Features
- [ ] **Elections system** - Annual nominations, voting, 2-year term limits
- [ ] **Bylaw amendments** - Proposal, discussion, vote process
- [ ] **Grievance process** - Internal accountability
- [ ] **Leadership rotation** - Term tracking, succession planning

### Phase 5: Community Features
- [ ] **Mutual aid board** - Needs/offers matching
- [ ] **Skills directory** - Member capabilities inventory
- [ ] **Full bilingual** - Complete Spanish translation
- [ ] **Favorite properties** - Save buildings of interest
- [ ] **Rent comparison dashboard** - Size vs. price analysis

### Data Expansion
- [ ] **50,000+ additional properties** - Full county dataset
- [ ] **250,000 single-family homes** - Grouped by proximity
- [ ] **Code violation integration** - Live violation tracking
- [ ] **Eviction early warning** - Pattern detection system

### Technical Improvements
- [ ] **Organizer/Admin invite creation** - Currently tenant-only
- [ ] **Democratic moderation** - Community voting for bans
- [ ] **Matrix protocol integration** - Decentralized secure messaging
- [ ] **Mobile PWA** - App-like offline experience
- [ ] **Las Vegas expansion** - Clark County (680,000+ properties)

---

## Success Metrics

### What We Measure
- Rent reduced via strikes ($)
- Repairs secured (#)
- Evictions stopped (#)
- Buildings organized (#)
- Strike participation rate (%)
- Campaign win rate (%)

### What We DON'T Measure
- Social media followers
- Website traffic
- Email list size
- Meeting attendance (alone)

### Year 1 Goals
- 3-5 successful building strikes
- 500-800 active members across 15-20 buildings
- 2-3 rent reductions won
- 1-2 major repairs secured
- Media coverage of wins

### Year 2 Goals
- 15-20 simultaneous campaigns
- 2,000+ members
- Citywide landlord pressure
- Political leverage naturally follows

---

## User Experience

### For Tenants
1. Scan QR code from organizer
2. Create profile (2 minutes)
3. Link to your building
4. Enter rent info (anonymous aggregation)
5. Join building chat
6. See how your rent compares

### For Organizers
1. Get organizer invite from admin
2. Access canvassing tools
3. Track every door knocked
4. Create tenant invites with QR codes
5. View all profiles for coordination
6. Export data for analysis

### For Admins
1. Bootstrap with secret code
2. Create organizer invites
3. Manage document library
4. Export all system data
5. Change user roles

---

## Why This Will Work

### Strike Economics
- Landlord needs rent money—this is not optional
- Mass withholding forces negotiation within weeks
- Tenants provide the value landlords extract
- Tenants can withhold that value collectively

### Geographic Solution
- Reno's dispersed geography = distributed coordination problem
- Strike coordination is geography-agnostic
- Tools enable async communication and collective timing
- Don't need in-person meetings to organize a rent strike

### Psychological Reality
- People participate for concrete benefits (lower rent)
- Visible wins drive recruitment
- One successful strike creates proof-of-concept
- "I saw this happen, so it can work"

---

## The Ask

This platform is ready for field testing. What's needed:

1. **Organizers** willing to use canvassing tools
2. **Buildings** with active tenant concerns
3. **Feedback** on what works and what doesn't
4. **Time** to iterate based on real organizing

The technology is built. Now it needs to be used.

---

*"This platform is not a community hub, a social network, or a discussion forum. It is a strike coordination weapon."*

**Every feature exists to answer: "Does this help us win a rent strike?"**

---

## Contact

Built for the Reno-Sparks Tenants Union.
Open source and available for adaptation by other tenant unions.

*"Homes for People, Not for Profit"*
