# RSTU Connect: The Most Comprehensive Tenant Organizing Platform Ever Built

**A Strike Coordination Weapon for Nevada's First Tenants Union**

**Live Demo:** https://cwcorella-git.github.io/rstu-connect/

---

## The Story

In August 2024, the **Tenant Union Federation** launched—the first national tenant union federation in decades. KC Tenants won $300,000 in rent forgiveness through an 8-month strike. Brooklyn tenants won $250,000 in waived rent after a 4-year campaign. LA Tenants Union secured a 10-year affordability covenant after nearly 6 years of organizing.

These victories share one thing: **organized tenants using collective power to win material gains.**

But these unions are in major metros. What about Nevada—a state with the **2nd highest rate of cost-burdened renters** in America, where corporate landlords own **15-25% of single-family homes**, and where over **272,000 renters** struggle while legislation dies in committee?

Nevada needs its own tenant union. And that union needs the best organizing technology ever built.

**RSTU Connect is that technology.**

---

## The Opportunity: 100,000 Doors in 60 Days

### The Canvassing Vision

> *"Tenants across Reno-Sparks are dealing with the same problems—rising rents, poor maintenance, utility costs, and harassment—but are often isolated by building. Organizing is strongest when tenants are connected to their neighbors and supported with real information."*

This project proposes an unprecedented canvassing operation:

| Metric | Scale |
|--------|-------|
| **Doors knocked** | 100,000 |
| **Timeline** | 60 days |
| **Target area** | Reno-Sparks metro |
| **Properties covered** | 16,000+ rental properties |
| **Data captured** | Issues, organizing interest, contact preferences |

**What we'll do at each door:**
1. Have respectful conversations with tenants
2. Ask three clear questions:
   - What issues are you dealing with?
   - Are you interested in organizing with other tenants?
   - How do you want to be contacted?
3. Enter information into the RSTU Connect database organized by building
4. Identify buildings ready to organize **now**

**Industry benchmarks:** Professional canvassers knock 50-80 doors per shift (4 hours). With the right support structure, 100,000 doors in 60 days is achievable with a small team working full-time.

### Why This Scale Matters

Research shows:
- **8.7 percentage point** increase in engagement through personal door-knocking vs. control groups
- Door-to-door contact is the **most consistently effective method** of mobilization
- **2/3 of canvassing time should be listening**—this builds trust and identifies real concerns

After 60 days, RSTU will have:
- A clear picture of tenant issues **by building and by corporate owner**
- Connections between tenants in the same complex
- Identification of which buildings are **ready to strike now**
- Intelligence on eviction patterns and landlord accountability
- A foundation for multi-year organizing campaigns

---

## What's Already Built

RSTU Connect isn't a concept—it's deployed and functional. Here's what exists today:

### 1. The Largest Rental Property Intelligence Database in Nevada

**16,000+ rental properties** filtered from 192,463 Washoe County parcels:

| Data Point | Coverage |
|------------|----------|
| Owner name & mailing address | 100% |
| Number of units | 100% |
| Year built | 89% |
| Assessed value | 100% |
| GPS coordinates | 99% |
| Neighborhood | 100% |
| Eviction history | 7,500 records |
| Landlord accountability scores | 20 profiles |
| Organizing priority (1-10) | 5,695 properties |

**Source data pipeline:**
```
Washoe County Assessor (192,463 parcels)
    → SQLite databases (~1.5 GB total)
    → Corporate landlord identification (48,593 entities)
    → Eviction records + landlord scorecards
    → Priority scoring (1-10 scale)
    → JSON export for website (~4.3 MB)
```

**Corporate landlord intelligence:**
- **48,593 corporate entities** identified (34.2% of owners)
- **627 large portfolios** (10+ properties each)
- **$930+ million** in tracked portfolio value

### 2. Interactive 3D Property Map

- **MapLibre GL JS** powered visualization
- All 16,000+ properties plotted with coordinates
- Click any building for instant owner info, unit count, assessed value
- 3D rotation, pitch control, fullscreen mode
- Free tile service (no API costs)

### 3. Building-Specific Chat & Events

- **Socket.IO** real-time messaging—one room per property
- **No login required** for initial participation (zero friction)
- Connection status indicators with automatic reconnection

**Meeting Coordination:**
- Tenants propose meetings with location, time, and notes
- Up/down voting on proposals
- **3+ votes automatically creates building calendar event**
- Calendar with RSVP tracking (going/maybe/not going)
- Event types: meetings, actions, workshops, social, intake

**Issue Reporting:**
- Tenants report issues by category (maintenance, rent increases, harassment, etc.)
- Issues gain support through voting
- High-support issues escalate to building-wide demands

### 4. Role-Based Profile System

**Three roles with clear access levels:**

| Role | Capabilities |
|------|-------------|
| **Tenant** | Chat, view property info, rent comparison |
| **Organizer** | + Canvassing tools, create tenant invites, view all profiles |
| **Admin** | + Document management, create organizer invites, role changes |

**Trust verification system:**
- `Self-registered` — Created without invite (lowest trust)
- `Invited` — Created via invite code (medium trust)
- `Verified` — Vouched by organizer or admin (highest trust)

**Invite code system for field onboarding:**
- 6-character codes with QR generation
- Configurable: role granted, max uses, expiration date
- Field workflow: Scan QR → Create profile → Linked to building
- Track usage, revoke codes, prevent abuse

**Profile data collected (32 fields):**
- Contact info (phone, email, preferred method, language)
- Household (occupants, children, pets, accessibility needs)
- Rent data (amount, lease type, move-in date, increases, deposit)
- Availability (work hours, best times, preferred days)
- Complaints (16 categories from maintenance to harassment)
- Organizing interest (7 levels from "attend meeting" to "take leadership")

### 5. Canvassing Tools (Organizer Access)

**Unit-by-Unit Tracking:**
```
Contact Pipeline:
Not Contacted → No Answer → Contacted → Interested → Active Member
```

Features:
- Add units individually or in ranges (e.g., "101-150", "A101-A110")
- Filter by status, sort by unit/status/updated
- Progress visualization per building
- Track who knocked which door and when

**32-Field Unit Intake Form:**
- Complete rent and lease details
- 16 complaint categories with free-text details
- Maintenance ratings and response times
- Community connections and organizing interest
- Follow-up scheduling with reminders

**Data Discrepancy Tracking:**
- Actual unit count vs. county records
- Actual property name (marketing vs. legal name)
- Property management company identification
- Verification tracking for data quality

**Export/Import:** Full JSON backup of all canvassing data

### 6. Document Library: ~850 Organizing Resources

**Categories:**
- Tenant rights and legal resources
- Organizing guides and playbooks
- Strike coordination templates
- Historical tenant movements
- Theoretical foundations
- Nevada-specific law (NRS 118A)
- Educational materials

**Features:**
- Search and filter across all documents
- Favorites system for quick access
- Reading progress tracking (resume where you left off)
- **Admin controls:** Hide, edit titles, delete, restore documents

### 7. Mobile-First Field Design

- Responsive layout optimized for phones
- Touch-friendly large tap targets
- Offline-capable (localStorage + IndexedDB)
- Back navigation and smooth transitions
- Works in spotty cellular coverage

---

## The Theoretical Foundation: Why Strikes Win

### The Economics of Rent Extraction

> *"Landlords demand rent for what is altogether incapable of human improvement. Rent is extracted purely by possession of property, requiring NO labor, care, or productive activity from the landlord."* — Marx, 1844

> *"The landlord endeavors to leave the tenant no greater share of the produce than what is sufficient to keep them alive and working."*

**Core insight:** Rent is not a policy failure—it's a **power relationship**. Landlords extract value that tenants produce. This extraction continues because tenants are isolated and unorganized.

### Why Collective Action Works

> *"If 100 units in a building go on rent strike, the landlord immediately loses $50,000/month. A landlord can hire security, threaten evictions, issue notices—but they cannot compel payment."*

**The landlord's only weapon is eviction. But:**
- Mass evictions are slow (months in court)
- Mass evictions are expensive (legal fees per unit)
- Mass evictions create media attention (bad for business)
- Mass evictions create empty units (no revenue)

> *"Strikes expose that landlords need tenants more than tenants need landlords."*

### Why Legislation Fails

> *"A Nevada senator will not vote to limit landlord profits. Their campaign funding, real estate portfolios, and ideological commitment to 'property rights' prevents this."*

> *"Legislation assumes the landlord class will voluntarily surrender extractive power. They won't."*

> *"A senator won't act for 6 years. A landlord notices a rent strike immediately."*

**Historical reality:** Every housing victory came from strikes, organized withholding, and collective refusal—not legislation. Rent control is a **concession extracted through demonstrated power**, not a gift from politicians.

### The Visibility Principle

> *"20 families winning $100/month rent reduction spreads faster than 800 Twitter followers."*

When one building wins:
- Neighboring buildings see concrete proof
- Word spreads through existing social networks
- Recruitment becomes organic
- Power builds on power

---

## What Other Tenant Unions Have Won

### KC Tenants (Kansas City, 2024)

**8-month rent strike** at Quality Hill Towers and Independence Towers:
- **$300,000** in rent withheld and ultimately forgiven
- HVAC repairs committed with rent reduction until completion
- Building-wide repairs completed before year-end
- 3-week grace period before any future eviction proceedings
- **First rent strike in the area since 1980**

### East Harlem Tenants (NYC, 2023-2024)

**16-month rent strike** across five buildings:
- **$500,000** settlement for back rent and repairs
- Tenants received **6 months rent credit**
- Court-appointed receiver obligated to complete repairs

### Brooklyn Tenant Association (2020-2024)

**4-year campaign** at 1616 President St:
- **$250,000** in rental arrears waived by court
- Judge ruled repairs were necessary, landlord at fault
- Tenants remained in their homes

### LA Tenants Union (Hillside Villa)

**Nearly 6-year campaign:**
- **10-year extension** of building affordability covenant
- Nearly 4 years of active rent strike
- All tenants kept affordable rents and remained housed

### NYC Statewide (2019)

**Housing Justice for All** coalition victory:
- Extended protections to **2.4 million renters** in New York State
- Closed loopholes for deregulating rent-stabilized apartments
- Limits on security deposits
- Eviction protections

**May 1, 2020 pandemic strike:**
- **17,000+ tenants** went on rent strike statewide
- Nearly 2,000 tenants in 60 buildings with active tenant unions
- 15,000+ people who couldn't pay joined the movement

---

## Nevada's Housing Crisis: The Numbers

### Rent Burden

| Statistic | Data |
|-----------|------|
| Nevada ranking for cost-burdened renters | **2nd highest** (behind Florida) |
| Nevada renters spending >30% on housing | **Over 50%** |
| Extremely low-income renters in Nevada | **101,413** |
| % of ELI renters severely burdened (>50% income) | **86%** |

### Reno-Sparks Specifics

| Metric | Value |
|--------|-------|
| Average 1-bedroom rent | **$1,402/month** |
| Annual income needed for 1BR | **$47,800** |
| Median home price | **$543,000** (Feb 2025) |
| Months of housing supply | **1.51** (vs. 3.3 national avg) |

**The wage gap:**
- 4 of 5 top occupations in Nevada pay under **$42,000/year**
- Only management workers (median $93,600) can comfortably afford rent
- Food prep, admin, transportation, sales workers **cannot afford median 1BR**

### Corporate Landlord Takeover

| Entity | Properties |
|--------|------------|
| Pretium Partners (NY hedge fund) | **3,190+ homes** in Clark County |
| Institutional investors (5+ homes) | **15% of Las Vegas SFH** |
| North Las Vegas investor-owned | **25% of SFH** |

**Our database tracks:**
- **48,593 corporate entities** in Washoe County
- **627 large portfolios** (10+ properties)
- **$930+ million** in portfolio value

**Top priority targets identified:**
1. TOLL NORTH RENO LLC — 534 properties
2. GAGE VILLAGE COMMERCIAL DEV LLC — 361 properties, 3,335 units
3. MG LAKERIDGE LIVING APARTMENTS LLC — 440 properties
4. SWD-QUARRY BSV LLC — 341 properties
5. FCA REDFIELD RIDGE LLC — 300 properties

---

## Why RSTU Connect is Different

### Compared to Existing Tools

**Action Network** (used by most tenant unions):
- General-purpose advocacy platform
- No property intelligence
- No building-specific organization
- No canvassing tools

**KC Tenants toolkit:**
- Excellent templates and guides
- No integrated technology platform
- Requires manual tracking

**LA Tenants Union's Answer Tool:**
- Specific to eviction defense filing
- California-focused
- Single-purpose

**RSTU Connect:**
- Purpose-built for tenant organizing
- Integrated property database with corporate landlord tracking
- Building-specific chat and canvassing
- Role-based access with field onboarding
- Complete document library
- **All in one mobile-first platform**

### What Technology Leaders Say

> *"The much-more dominant trend is that landlords are using tech against us, to surveil and to anonymize and distance themselves from impact on tenants. Tech can help tenants, but we're behind. We need to catch up."* — Tara Raghuveer, Tenant Union Federation

> *"Tech is not going to solve the tenant rights crisis. What we need to be angling for is supporting organizing efforts, supporting building a movement, so that tenants are able to have more power."*

**RSTU Connect is exactly this:** technology that supports organizing, not technology that replaces it.

---

## The Philosophy: What We Build and Don't Build

### What We DON'T Build

| Anti-Pattern | Why It Kills Movements |
|--------------|----------------------|
| Forums for philosophy debates | People discuss instead of organize |
| Social media metrics | Followers don't show up to strikes |
| Meetings for meetings' sake | Energy on process, not outcomes |
| Bureaucracy for every decision | Paralysis, volunteer burnout |
| Leaderless democracy | Consensus paralysis, nothing happens |
| Vetting paranoia | Time spent vetting, not organizing |
| Aesthetic over action | Pretty graphics, no real wins |

### What We DO Build

| Pattern | Why It Works |
|---------|--------------|
| Clear goals per campaign | People know what winning looks like |
| Action-oriented culture | Every discussion ends with "what's next?" |
| Decentralized execution | Multiple campaigns in parallel |
| Visible wins documented | Proof that organizing works |
| Distributed leadership | No single point of failure |
| Term limits | Prevents entrenchment |
| Public strategy | Members spot co-optation |

### The Core Metric

**NOT:** "How many followers do we have?"
**YES:** "How much rent did our strikes reduce this month?"

---

## Legal Foundation: Nevada Protects Organizing

**Nevada Revised Statutes Chapter 118A** explicitly protects tenant organizing:

- **NRS 118A.510:** Prohibits landlord discrimination against tenant union members
- **NRS 118A.520:** Prohibits retaliation for organizing activities
- **14-day repair timeline:** Creates legal leverage for collective action
- **Tenants' right to meet** in common areas for organizing
- **District attorney enforcement** powers available

> *"Nevada is one of few states with explicit statutory protection for tenant organizing. This is our legal shield."*

---

## Technical Architecture

### Why Static + Decentralized

**Cost:** $0/month for hosting
- GitHub Pages (free static hosting)
- Render.com free tier (chat relay)
- No central database (data sovereignty)

**Resilience:**
- No central server to subpoena
- No single point of failure
- Data stored in users' browsers
- Can't be shut down by one action

**Privacy:**
- Anonymous chat participation
- Local-first data storage
- No tracking pixels or analytics
- No data sold to third parties

### Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Mapping | MapLibre GL JS (open source) |
| Real-time | Socket.IO |
| Data processing | SQLite, Python |
| Storage | localStorage, IndexedDB |
| Deployment | GitHub Actions → GitHub Pages |

### Data Scale

| Dataset | Size |
|---------|------|
| Washoe County parcels | 192,463 |
| Rental properties tracked | 16,000+ |
| Eviction records | 7,500 |
| Corporate entities | 48,593 |
| Large portfolios (10+) | 627 |
| Organizing documents | ~850 |
| Database size | ~1.5 GB |

---

## Roadmap

### Completed Core Features
- Property intelligence (evictions, landlord scores, organizing priority)
- Building-specific chat with governance proposals
- Campaign dashboard with victory archive
- Event calendar with RSVP and meeting voting
- Mutual aid network (needs, offers, skills, library)
- Blocks system (property groups with autonomous governance)
- Role-based profiles with invite codes
- Canvassing tools with 32-field intake
- Supabase cloud sync for user data

### In Development
- Complaint pattern detection across buildings
- Demand builder with templates
- Strike coordination dashboard

### Future Expansion
- Full bilingual Spanish translation
- Code violation integration
- Eviction early warning system
- Las Vegas expansion (680,000+ properties)

---

## What We Measure

### Success Metrics

| Metric | Why It Matters |
|--------|----------------|
| Rent reduced via strikes ($) | Material wins |
| Repairs secured (#) | Living conditions improved |
| Evictions stopped (#) | Displacement prevented |
| Buildings organized (#) | Geographic coverage |
| Strike participation rate (%) | Collective power |
| Campaign win rate (%) | Strategy effectiveness |

### What We DON'T Measure

| Metric | Why It's Misleading |
|--------|---------------------|
| Social media followers | Don't show up to strikes |
| Website traffic | Pageviews ≠ organizing |
| Email list size | Unopened emails don't help |
| Meeting attendance alone | Meetings aren't victories |

---

## The Ask: Full-Time Organizing Support

### What's Needed

To execute 100,000 doors in 60 days and build Nevada's most powerful tenant union:

| Support | Purpose |
|---------|---------|
| **Housing** | Full-time focus on organizing |
| **Essentials** | Food, transportation, supplies |
| **$200/month** | Claude API for continued platform development |
| **Priority complex list** | Target buildings with highest organizing potential |

### What You Get

After 60 days:
- **Complete tenant intelligence** for 16,000+ properties
- **Building-by-building organizing readiness** assessment
- **Identified strike-ready buildings** with documented demands
- **Connected tenants** across shared landlords
- **The most reliable tenant union canvassing tool ever built**

### Timeline

| Week | Milestone |
|------|-----------|
| 1-2 | Finalize target complexes, messaging, data protocols |
| 3-8 | Active canvassing (100,000 doors) |
| 9 | Data analysis, building prioritization |
| 10 | Present findings, launch first campaigns |

---

## Why This Will Win

### The Math

- 100,000 doors × 35% contact rate = **35,000 conversations**
- 35,000 conversations × 20% interested = **7,000 potential members**
- 7,000 members across 16,000+ properties = **building-level density**
- Building-level density = **strike-ready committees**

### The Psychology

> *"People participate in strikes for concrete benefit (lower rent). People tell others about strikes because the outcome is real and observable."*

- One successful strike creates proof-of-concept
- Proof-of-concept creates recruitment momentum
- Momentum creates more strikes
- More strikes create political leverage

### The History

Every tenant movement that won did so through:
1. Identifying shared grievances
2. Building trust through personal contact
3. Organizing building-level committees
4. Coordinating collective action (strikes)
5. Winning material gains
6. Spreading the model

**RSTU Connect enables every step of this process.**

---

## Voices from the Movement

> *"We all have the same problems but landlords keep tenants isolated."*

> *"Housing is a human right, not a commodity."*

> *"Everyone needs housing, but no one needs a landlord."*

> *"An injury to one is an injury to all."*

> *"This platform is not a community hub, a social network, or a discussion forum. It is a strike coordination weapon."*

> *"Homes for People, Not for Profit."*

---

## In Summary

**RSTU Connect is:**
- The most comprehensive tenant organizing platform in Nevada
- Property intelligence on 16,000+ rentals from 192,463 total parcels
- Eviction history, landlord scores, and organizing priority data
- Building-specific chat, canvassing tools, and document library
- Role-based access with field onboarding via QR codes
- Mobile-first, offline-capable, privacy-respecting
- Free to host, impossible to shut down

**The 100,000 door campaign is:**
- The largest tenant canvassing operation in Nevada history
- 60 days of direct tenant contact
- Building-by-building organizing intelligence
- Identification of strike-ready buildings

**The goal is:**
- Material wins: rent reduced, repairs secured, evictions stopped
- Power demonstrated through collective action
- A model that spreads across Nevada and beyond

---

**The technology is built. The strategy is proven. The moment is now.**

*"Every feature exists to answer one question: Does this help us win a rent strike?"*

---

## Contact

Built for the Reno-Sparks Tenants Union — Nevada's first tenants union.

Open source and available for adaptation by other tenant unions.

*"Homes for People, Not for Profit"*
