# RSTU Connect Feature Ideas

**Compiled from organizing documentation archives**
**Date:** December 17, 2025

This document compiles feature ideas gathered from RSTU's bylaws, theoretical foundation documents, organizing intelligence platform plans, meeting notes, educational materials, and organizing guides. All ideas are designed to work within the constraints of a static site hosted on Neocities with Gun.js P2P functionality.

---

## Table of Contents

1. [Democratic Governance & Rotating Leadership](#1-democratic-governance--rotating-leadership)
2. [Membership & Activity Tracking](#2-membership--activity-tracking)
3. [Outreach & Contact Tracking](#3-outreach--contact-tracking)
4. [Lease & Tenant Intelligence](#4-lease--tenant-intelligence)
5. [Complaints & Grievance Collection](#5-complaints--grievance-collection)
6. [Demand Compilation & Campaign Management](#6-demand-compilation--campaign-management)
7. [Strike Coordination](#7-strike-coordination)
8. [Events & Meetings](#8-events--meetings)
9. [Task & Action Coordination](#9-task--action-coordination)
10. [Education & Theory](#10-education--theory)
11. [Mutual Aid Network](#11-mutual-aid-network)
12. [Communication Infrastructure](#12-communication-infrastructure)
13. [Landlord Accountability](#13-landlord-accountability)
14. [Resource Library](#14-resource-library)
15. [Avoiding Movement-Killing Patterns](#15-avoiding-movement-killing-patterns)
16. [Technical Implementation Approaches](#16-technical-implementation-approaches)
17. [Bilingual / Language Justice](#17-bilingual--language-justice)
18. [Mobile-First Field Organizing](#18-mobile-first-field-organizing)
19. [Metrics That Matter](#19-metrics-that-matter)
20. [Quotes & Inspiration](#20-quotes--inspiration)

---

## 1. Democratic Governance & Rotating Leadership

### Elections System

- **Annual officer elections** with 2-year term limits (no consecutive terms beyond 2)
- **Position nominations** (self or others) with 2-week lead time
- **Virtual ballot system** with 1-week voting window
- **Bilingual ballots** (English/Spanish default, others by request)
- **Special elections** for mid-term vacancies

### Leadership Positions to Track

| Position | Time Commitment | Key Responsibilities |
|----------|-----------------|---------------------|
| Intake Coordinator(s) | 2-4 hrs/week | Point of contact for new members, coordinate 1:1 meetings |
| Secretary | 2-4 hrs/week | Maintain membership records, send meeting invites/agendas |
| External Communications Coordinator | 2-4 hrs/week | Press releases, interview coordination, messaging |
| Treasurer | TBD | Required when dues/bank account established |
| Committee Contact Persons | Varies | 1-2 per committee |

### Voting Types

| Type | Scope | Threshold | Use Cases |
|------|-------|-----------|-----------|
| Local Majority | Present at meeting | >50% | Routine decisions |
| Simple Majority | All voting members, 7-day window | >50% | Elections, strike authorization, expulsion |
| Supermajority | All voting members, 7-day window | >66% | Bylaws changes, core values changes |

### Quorum

- 15% of membership required for simple/supermajority votes

### Static Site Implementation

- Gun.js graph stores election data, timestamps, votes
- Anonymous voting via cryptographic identifiers
- Public tallies, private individual votes
- Could integrate with external anonymous voting tools (e.g., Helios, CIVS)

---

## 2. Membership & Activity Tracking

### Member Status Levels

| Status | Definition | Rights |
|--------|------------|--------|
| Voting Member | Tenant who doesn't control own/others' housing | Vote, hold office, full participation |
| Non-Voting Member | Supporter who controls own housing | Attend meetings, join committees, volunteer |
| Good Standing | Attended 3+ meetings in 6 months | Eligible for elected positions |
| Excluded | Landlords, property managers, real estate speculators, police, landlord lawyers | No membership allowed |

### Activity Metrics to Track

- Meeting attendance (general + committee)
- Task completion rate
- 1:1 conversations conducted
- Committee participation
- Phone banking hours
- Canvassing participation
- Training completed

### Member Profile Fields (Private/Encrypted)

```
- Username/alias (public in chat)
- Building assignment
- Skills inventory:
  - Languages spoken
  - Legal connections
  - Media experience
  - Organizing experience
  - Translation ability
  - Technical skills
- Availability/capacity
- Communication preference (Signal, phone, email)
- "Strike Ready" pledge status (yes/no/maybe)
- Join date
- Good standing status
```

### Static Site Implementation

- Gun.js for encrypted member data
- Username stored in localStorage only
- Self-reported activity logging
- Peer attestation for meeting attendance
- Privacy-first: minimal data collection

---

## 3. Outreach & Contact Tracking

### Contact Status Tracking

| Status | Description |
|--------|-------------|
| Not Contacted | No outreach yet |
| Contacted | Initial conversation happened |
| Interested | Expressed interest in organizing |
| Not Interested | Declined involvement |
| Follow-up Needed | Requires additional outreach |
| Active Member | Joined and participating |

### Tenant Questions Template

From organizing documents - questions for 1:1 conversations:

1. How long have you been here?
2. How much is your rent?
3. Can I ask how much you get paid? (optional)
4. How many hours do you work?
5. What days do you have off?
6. How reliable has maintenance been?
7. Are there changes you'd like to see?
8. What additions would be good to have?
9. How many people live here?
10. Do you have any pets?
11. What would the ideal rent be?
12. Do you know any of your neighbors?
13. How can I contact you?

### Building Organizing Status Pipeline

```
1. UNINFORMED
   ↓ (Initial contact made)
2. AWARE
   ↓ (Interest expressed)
3. INTERESTED
   ↓ (Commitment obtained)
4. COMMITTED
   ↓ (Strike pledge signed)
5. STRIKE READY
```

### Static Site Implementation

- Canvassing app that syncs via Gun.js
- Offline-first (IndexedDB) for field work
- Aggregate stats public, individual contacts private
- Export to spreadsheet for backup

---

## 4. Lease & Tenant Intelligence

### Personal Lease Tracker

Fields for tenants to track their own situation:

```
- Lease start date
- Lease end date
- Monthly rent amount
- Rent history (previous amounts, increase dates)
- Month-to-month status (yes/no)
- Security deposit amount
- Last rent increase date
- 60-day notice received (date)
- Landlord/management company
- Building address
```

### Building-Level Intelligence

```
- Total units
- Estimated vacancy rate
- Common grievances (aggregated from complaints)
- Maintenance response time (average)
- Corporate owner
- Owner portfolio size
- Organizing status
```

### Important Date Alerts

| Timeline | Event | Nevada Law Reference |
|----------|-------|---------------------|
| 60 days | Rent increase notice required | NRS 118A |
| 48 hours | Essential services repair deadline | NRS 118A |
| 14 days | Habitability repair deadline | NRS 118A |
| 24 hours | Landlord entry notice required | NRS 118A |
| 30 days | New rules enforcement notice | NRS 118A |

### Static Site Implementation

- Personal lease tracker stored in browser (localStorage/IndexedDB)
- Optional encrypted backup to Gun.js
- Calendar reminders via ICS export
- Browser notifications for approaching deadlines

---

## 5. Complaints & Grievance Collection

### Complaint Categories

- [ ] Maintenance neglect
- [ ] Rent increases (excessive)
- [ ] Illegal fees
- [ ] Harassment
- [ ] Retaliation for organizing
- [ ] Security deposit theft
- [ ] Bed bugs/pests
- [ ] Mold
- [ ] Utilities issues
- [ ] Eviction threats
- [ ] Privacy violations (entry without notice)
- [ ] Discrimination
- [ ] Lease violations by landlord
- [ ] Other

### Complaint Documentation Form

```
Date of incident: ___________
Category: ___________
Building: ___________
Landlord/Management: ___________

Description:
[Free text field]

Evidence available:
- [ ] Photos
- [ ] Videos
- [ ] Written correspondence
- [ ] Receipts
- [ ] Witnesses

Actions taken:
- [ ] Reported to landlord
- [ ] Filed with code enforcement
- [ ] Consulted legal aid
- [ ] None yet

Resolution status:
- [ ] Unresolved
- [ ] In progress
- [ ] Resolved
- [ ] Escalated to campaign

Anonymous submission: [ ] Yes [ ] No
```

### Internal Accountability (Member Grievances)

Per bylaws, grounds for grievances include:

1. Working with landlords against tenants
2. Harassment, discrimination, bullying
3. Taking bribes or corruption
4. Using RSTU resources for personal gain
5. Espionage against the group
6. Undermining trust of tenants in union
7. Failure to fulfill officer duties

### Static Site Implementation

- Complaint form stores to Gun.js (anonymous option available)
- Photo upload to IPFS or similar decentralized storage
- Pattern detection: aggregate complaints by building/landlord
- Export for legal aid referrals

---

## 6. Demand Compilation & Campaign Management

### Demand Building Process

```
Step 1: Collect individual grievances
        ↓
Step 2: Identify common issues (pattern analysis)
        ↓
Step 3: Draft collective demands
        ↓
Step 4: Legal review (volunteer lawyers or legal aid)
        ↓
Step 5: Member approval vote (simple majority)
        ↓
Step 6: Formal presentation to landlord
```

### Campaign Lifecycle Stages

| Stage | Description | Key Activities |
|-------|-------------|----------------|
| 1. Intelligence | Building grievances identified | Initial contact, data gathering |
| 2. Organizing | 1:1 conversations happening | Demand discussions, leadership emerging |
| 3. Commitment | Tenant committee formed | Demands drafted, members known to each other |
| 4. Preparation | Ready for action | Legal review, agreements signed, date set |
| 5. Active Strike | Rent being withheld | Negotiations ongoing, media engaged |
| 6. Resolution | Agreement reached | Terms documented, outcome posted |

### Campaign Dashboard Fields

```
Campaign Name: ___________
Building(s): ___________
Landlord: ___________
Stage: [1-6]
Start Date: ___________
Current Stage Date: ___________

Demands:
1. ___________
2. ___________
3. ___________

Next Action: ___________
Next Action Date: ___________

Tenant Committee Size: ___________
Participation Rate: ___%

Outcome: [Pending/Won/Lost/Partial]
Outcome Details: ___________
```

### Static Site Implementation

- Gun.js stores campaign states
- Public campaign status visible to all (recruitment)
- Sensitive details (committee member names) encrypted
- Victory archive as static content

---

## 7. Strike Coordination

### Strike Authorization Requirements

- [ ] Simple majority vote within building/chapter
- [ ] Clear demands documented and approved
- [ ] Timeline established
- [ ] Legal protections reviewed with members
- [ ] Support network activated
- [ ] Media strategy prepared

### Strike Metrics Dashboard

```
┌─────────────────────────────────────────────────┐
│  BUILDING X RENT STRIKE - DAY [##]              │
├─────────────────────────────────────────────────┤
│  Participation: [##] / [##] units ([##]%)       │
│  Monthly Rent Withheld: $[#####]                │
│  Total Impact to Date: $[#####]                 │
│  Landlord Response: [None/Negotiating/Agreed]   │
│  Media Coverage: [##] stories                   │
└─────────────────────────────────────────────────┘
```

### Financial Impact Calculator

```
Units participating × Average rent × Days on strike = Total impact

Example:
50 units × $1,200/month × 30 days = $60,000 withheld
```

### Strike Support Infrastructure

| Support Type | Description |
|--------------|-------------|
| Emergency Fund | Financial assistance for striking tenants |
| Grocery Support | Food distribution coordination |
| Legal Defense | Eviction defense contacts, know-your-rights |
| Media Support | Press releases, talking points, spokesperson training |
| Solidarity Actions | Support from other buildings, community allies |
| Childcare | Coverage during actions/meetings |

### Historical Wins Database

```
Building: ___________
Landlord: ___________
Strike Dates: ___________ to ___________
Duration: ___________ days

Demands Made:
1. ___________
2. ___________

Outcomes Achieved:
1. ___________
2. ___________

Rent Reduction: $___/month
Repairs Secured: ___________
Other Wins: ___________

Participation Rate: ___%
Member Testimonies: [Anonymous quotes]
```

### Static Site Implementation

- Real-time strike dashboard via Gun.js
- Financial impact auto-calculated client-side
- Victory stories as static content (powerful for recruitment)
- Strike pledge signatures via Gun.js (encrypted)

---

## 8. Events & Meetings

### Event Types

| Type | Frequency | Purpose |
|------|-----------|---------|
| General Meeting | Regular intervals | Union-wide business, votes |
| Committee Meeting | As needed | Specific workgroup tasks |
| 1:1 Intake Meeting | Ongoing | New member onboarding |
| Educational Workshop | Monthly? | Know Your Rights, organizing skills |
| Tabling Event | Biweekly? | Public outreach, recruitment |
| Direct Action | As needed | Demonstrations, landlord visits |
| Strike Support Event | During strikes | Solidarity, material support |

### Meeting Requirements (from bylaws)

- [ ] Announced to all members via email
- [ ] Agenda sent 2+ days in advance
- [ ] Facilitator assigned (rotate through membership)
- [ ] Notetaker assigned (rotate through membership)
- [ ] Timekeeper assigned (rotate through membership)
- [ ] Virtual option provided with link in agenda
- [ ] Virtual moderator designated
- [ ] Notes stored and sent to all members after

### Event Listing Fields

```
Event Title: ___________
Type: [General Meeting/Committee/Workshop/Action/etc.]
Date: ___________
Time: ___________
Location: ___________ (or "Virtual")
Virtual Link: ___________

Description:
[Text]

Agenda:
1. ___________
2. ___________
3. ___________

RSVP: [Yes/No/Maybe]
Childcare needed: [ ]
Interpretation needed: [Language]
```

### Static Site Implementation

- Events page with Gun.js RSVPs
- ICS calendar export for personal calendars
- Embed Google Calendar or similar free service
- Meeting notes archive as static markdown files
- Automatic reminder system via browser notifications

---

## 9. Task & Action Coordination

### Task Types

| Task | Skills Needed | Time Estimate |
|------|---------------|---------------|
| Phone Banking | Communication | 2-4 hours |
| Flyer Distribution | Mobility | 1-2 hours |
| Door Knocking | Communication | 2-3 hours |
| 1:1 Conversation | Trained | 30-60 min |
| Document Translation | Bilingual | Varies |
| Legal Review | Legal knowledge | Varies |
| Media Coordination | Writing, PR | 2-4 hours |
| Grocery Support | Transportation | 1-2 hours |
| Meeting Facilitation | Trained | 2 hours |
| Note Taking | Writing | 2 hours |
| Social Media | Digital skills | 1-2 hours |

### Task Board Features

```
┌─────────────────────────────────────────────────┐
│  TASK: Phone bank for Riverside Apartments      │
├─────────────────────────────────────────────────┤
│  Campaign: Riverside Rent Strike                │
│  Deadline: December 20, 2025                    │
│  Skills needed: Communication, English/Spanish  │
│  Time estimate: 2 hours                         │
│  Slots available: 3                             │
│  Signed up: Maria, [2 slots open]               │
│                                                 │
│  [SIGN UP] [MARK COMPLETE] [ADD FEEDBACK]       │
└─────────────────────────────────────────────────┘
```

### Task Workflow

```
OPEN → CLAIMED → IN PROGRESS → COMPLETED
                     ↓
                  BLOCKED (needs help)
```

### Workload Balancing

- Track hours per volunteer
- Flag when someone has 10+ hours/week
- Suggest redistribution
- Recognition for completed tasks

### Static Site Implementation

- Kanban-style task board via Gun.js
- Self-service sign-up
- Completion attestation (self-report + optional peer confirm)
- Public recognition feed

---

## 10. Education & Theory

### Rent Theory Education

Key concepts from theoretical foundation documents:

#### Why Rent is Extraction

> "Landlords demand rent for what is altogether incapable of human improvement (natural fertility, location). Rent is extracted purely by possession of property, requiring NO labor, care, or productive activity from the landlord." - Marx, 1844

#### Why Strikes Work

- Landlord needs rent money (mortgages, operations, profit)
- 100 units on strike = $50,000-$150,000/month loss
- Mass evictions are slow, expensive, create bad press
- Tenants can withhold labor (rent) collectively
- The landlord's business model depends on tenant cooperation
- Strikes expose that landlords need tenants more than tenants need landlords

#### Why Legislation Alone Won't Save Us

- Senators have campaign funding from real estate
- Legislation assumes landlords will voluntarily surrender power
- Rent control is a concession extracted through threat of action
- "A senator won't act for 6 years. A landlord notices a rent strike immediately."
- Every housing victory in history came from strikes and collective refusal

### Tenant Rights Library (Nevada)

| Right | Law | Details |
|-------|-----|---------|
| Habitable conditions | NRS 118A | Heat, water, electricity, functioning locks |
| Essential services repair | NRS 118A | 48 hours after written notice |
| Habitability repair | NRS 118A | 14 days after written notice |
| Rent increase notice | NRS 118A | 60 days written notice required |
| Late fee cap | NRS 118A | Maximum 5% of periodic rent |
| Security deposit cap | NRS 118A | Maximum 3x monthly rent |
| Entry notice | NRS 118A | 24 hours notice required (except emergency) |
| Organizing protection | NRS 118A | Explicit protection for tenant union members |
| Anti-retaliation | NRS 118A | Landlord cannot retaliate for organizing |

### Educational Content Formats

- [ ] Quick-reference cards (printable)
- [ ] Zines (8-page printable format)
- [ ] Know Your Rights quiz
- [ ] "Rate Your Landlord" interactive display
- [ ] Common landlord tactics list
- [ ] How to organize a tenant association guide
- [ ] Video explainers
- [ ] Social media graphics

### Key Vocabulary

| Term | Definition |
|------|------------|
| TOPA | Tenant Opportunity to Purchase Act - right to buy before sale |
| Right to Remain | Protection against displacement |
| Rent Control | Limits on rent increases |
| Rent Stabilization | Gradual, predictable rent increase limits |
| Community Land Trust | Nonprofit owns land, residents own buildings |
| Limited Equity Cooperative | Residents own shares with resale restrictions |
| Shared Equity Cooperative | Collective ownership with shared equity gains |
| Deed Restriction | Legal limit on resale price for affordability |
| Mutual Aid | Community members supporting each other directly |

### Static Site Implementation

- Static pages with all educational content
- Interactive quiz via JavaScript
- Printable PDF zines (pre-generated)
- Multi-language versions (English/Spanish minimum)
- Search functionality

---

## 11. Mutual Aid Network

### Needs/Offers Board

```
┌─────────────────────────────────────────────────┐
│  NEED: Help moving furniture - Dec 20          │
├─────────────────────────────────────────────────┤
│  Posted by: [Anonymous/Username]                │
│  Location: Midtown                              │
│  Details: Need 2 people with truck to move      │
│           couch and bed. Can pay gas money.     │
│  Status: [OPEN]                                 │
│                                                 │
│  [OFFER TO HELP]                                │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  OFFER: Free legal clinic referrals            │
├─────────────────────────────────────────────────┤
│  Posted by: Maria                               │
│  Details: I have contacts at NNLA, can help     │
│           connect tenants facing eviction.      │
│  Availability: Weekday evenings                 │
│  Status: [ONGOING]                              │
│                                                 │
│  [REQUEST THIS]                                 │
└─────────────────────────────────────────────────┘
```

### Mutual Aid Categories

- Rent/bill assistance
- Moving help
- Food/groceries
- Transportation
- Childcare
- Legal referrals
- Translation
- Tech support
- Emotional support
- Housing search help
- Job referrals

### Skills Directory

```
Username: ___________
Skills offered:
- [ ] Translation (Languages: ___________)
- [ ] Legal knowledge
- [ ] Media/PR
- [ ] Graphic design
- [ ] Tech support
- [ ] Transportation (have vehicle)
- [ ] Physical labor
- [ ] Childcare
- [ ] Cooking/food prep
- [ ] Other: ___________

Availability: ___________
Contact preference: ___________
```

### Time Banking (Optional Feature)

- Hours contributed to community
- Hours requested from community
- Balance tracking
- No debt/obligation, purely voluntary

### Static Site Implementation

- Gun.js for needs/offers board
- Anonymous option for sensitive requests
- Community verification for fulfillment
- Expiring posts (auto-archive after 30 days)

---

## 12. Communication Infrastructure

### Communication Channels

| Channel | Purpose | Platform |
|---------|---------|----------|
| Building Chat | Per-building organizing | Gun.js (existing) |
| Campaign Channels | Specific campaign coordination | Gun.js |
| Committee Channels | Workgroup communication | Gun.js |
| Emergency Broadcast | Urgent alerts | Gun.js + email |
| General Announcements | Union-wide updates | Static page + email |

### Announcement Types

- Meeting reminders
- Action alerts
- Victory announcements
- New resource notifications
- Solidarity requests
- Event promotions

### Security Recommendations

From organizing documents:

- **Basic**: Signal for sensitive 1:1 conversations
- **Intermediate**: Tor Browser, VPN for research
- **Advanced**: Burner devices for high-risk situations
- **Always**: No personal info in public channels

### Static Site Implementation

- Gun.js chat rooms (existing infrastructure)
- Consider Matrix protocol integration via iframe for federation
- Email list via external service (Action Network, Mailchimp)
- RSS feed for announcements

---

## 13. Landlord Accountability

### Landlord Profile Fields

```
Landlord/Entity Name: ___________
Type: [Individual/LLC/Corporation/REIT]
Properties Owned: [List or count]
Total Units: ___________
Portfolio Value: $___________

Complaint Summary:
- Maintenance complaints: [##]
- Rent increase complaints: [##]
- Eviction filings: [##]
- Code violations: [##]

Campaign History:
- [Date]: [Campaign name] - [Outcome]

Response to Demands: [Cooperative/Resistant/Hostile]

"Worst Landlord" Score: [##]/100
```

### Corporate Landlord Intelligence

From database (192,463 properties mapped):

- **48,636 corporate entities** identified (34.2% of owners)
- **627 large portfolios** (10+ properties)
- **Top 19 high-priority targets** (priority 8+/10)

#### Top Corporate Targets Identified

| Entity | Properties | Units | Priority |
|--------|------------|-------|----------|
| TOLL NORTH RENO LLC | 534 | 534 | 9/10 |
| GAGE VILLAGE COMMERCIAL DEV LLC | 361 | 3,335 | 9/10 |
| MG LAKERIDGE LIVING APARTMENTS LLC | 440 | 439 | 8/10 |
| SWD-QUARRY BSV LLC | 341 | 338 | 8/10 |
| FCA REDFIELD RIDGE LLC | 300 | 300 | 8/10 |

### Public Accountability Tools

- Annual "Worst Corporate Landlord" report
- Searchable complaint database by landlord
- Campaign history and outcomes by landlord
- Property lookup by address → landlord profile

### Static Site Implementation

- Static JSON data export from main_properties.db
- Client-side search and filter
- Property lookup by address
- Public accountability pages for major landlords
- Update data periodically via build process

---

## 14. Resource Library

### Organizing Playbook Documents

| Document | Purpose |
|----------|---------|
| Building Organizing Checklist | Step-by-step guide for new campaigns |
| Demand-Drafting Template | How to write effective demands |
| Negotiation Strategies | What to ask for, escalation tactics |
| Direct Action Toolkit | Flyers, petitions, demonstration planning |
| Strike Logistics Guide | How to sustain a strike for weeks |
| Tenant Rights by Scenario | Quick reference for common situations |
| Phone Banking Script | What to say when calling tenants |
| Door Knocking Script | What to say at the door |
| 1:1 Conversation Guide | How to conduct organizing conversations |

### Downloadable Templates

- [ ] Demand letter to landlord
- [ ] Repair request letter (48-hour notice)
- [ ] Habitability complaint (14-day notice)
- [ ] Rent strike pledge form
- [ ] Meeting agenda template
- [ ] Meeting notes template
- [ ] Flyer templates (editable)
- [ ] Social media graphics

### Partner Resources

| Organization | Services | Contact |
|--------------|----------|---------|
| Northern Nevada Legal Aid | Legal assistance | nnla.org |
| Nevada Legal Services | Legal assistance | nevadalegalservices.org |
| Washoe County Human Services | Housing assistance | washoecounty.gov |
| Nevada Housing Coalition | Policy advocacy | nevadahousingcoalition.org |

### Static Site Implementation

- All documents as static pages
- Downloadable templates (PDF, DOCX)
- Printable zine versions (8-page format)
- Search functionality across resources

---

## 15. Avoiding Movement-Killing Patterns

### What NOT to Build

From "How to Destroy a Movement" analysis:

| Anti-Pattern | Why It Kills Movements |
|--------------|----------------------|
| Forums for philosophy without action | People debate instead of organize |
| Social media metrics as success | Followers don't show up to strikes |
| Meetings for meetings' sake | Energy spent on process, not outcomes |
| Bureaucracy for every decision | Slows everything, burns out volunteers |
| Leaderless democracy | Consensus paralysis, nothing happens |
| Celebrity leadership | Movement dies when leader leaves |
| Vetting paranoia | Spend time vetting, not organizing |
| Aesthetic over action | Pretty social media, no real wins |

### What TO Build

| Pattern | Why It Works |
|---------|--------------|
| Clear, concrete goals per campaign | People know what winning looks like |
| Action-oriented culture | Every discussion leads to "what's next?" |
| Decentralized execution | Multiple campaigns in parallel |
| Rapid iteration | Try, learn, adjust, try again |
| Visible wins documented | Proof that organizing works |
| Distributed leadership | No single point of failure |
| Term limits | Prevents entrenchment |
| Public strategy | Members can spot co-optation |

### The Metric That Matters

**NOT:** "How many followers do we have?"
**YES:** "How much rent did our strikes reduce this month?"

---

## 16. Technical Implementation Approaches

### Working Around Static Site Limitations

#### Gun.js Extensions (Already in Use)

Gun.js can be extended for:

- Member profiles (encrypted)
- Elections/voting (anonymous)
- Task boards (sign-up, completion)
- Campaign tracking (stages, metrics)
- Needs/offers board (mutual aid)
- Activity logging (attendance, participation)
- Lease tracking (personal data)
- Complaint collection (anonymous option)

#### External Services (Embeddable/Linkable)

| Service | Use Case | Integration |
|---------|----------|-------------|
| Google Forms | Intake forms, surveys | Embed iframe |
| Calendly | 1:1 scheduling | Embed or link |
| Google Calendar | Event calendar | Embed iframe |
| Mailchimp/Action Network | Email lists | Signup embed |
| Formspree | Contact forms | Form action |
| When2meet | Meeting scheduling | Link |

#### GitHub Pages Additions

- Secondary hosting for larger interactive apps
- Serverless functions via Cloudflare Workers or similar
- Static data exports from databases (JSON)

#### Decentralized Storage

- IPFS for evidence photos, documents
- Decentralized backup of critical data

#### Browser-Native Features

| Feature | Use Case |
|---------|----------|
| localStorage | User preferences, session data |
| IndexedDB | Offline-first data (canvassing) |
| Service Worker | PWA, offline access |
| Web Notifications | Meeting reminders, alerts |
| Web Share API | Easy sharing on mobile |

### Data Flow Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    STATIC SITE (Neocities)              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   Pages     │  │  Resources  │  │   Assets    │     │
│  │  (HTML/JS)  │  │   (PDF/MD)  │  │  (CSS/IMG)  │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
              │                              │
              ▼                              ▼
┌─────────────────────────┐    ┌─────────────────────────┐
│    Gun.js P2P Network   │    │   Browser Storage       │
│  ┌─────────────────┐    │    │  ┌─────────────────┐    │
│  │  Chat messages  │    │    │  │  localStorage   │    │
│  │  Campaign data  │    │    │  │  (preferences)  │    │
│  │  Task boards    │    │    │  ├─────────────────┤    │
│  │  Voting data    │    │    │  │  IndexedDB      │    │
│  │  Member profiles│    │    │  │  (offline data) │    │
│  └─────────────────┘    │    │  └─────────────────┘    │
└─────────────────────────┘    └─────────────────────────┘
              │
              ▼
┌─────────────────────────┐
│  Relay Server (Render)  │
│  (NAT traversal only)   │
└─────────────────────────┘
```

---

## 17. Bilingual / Language Justice

### Requirements (from bylaws)

> "We are committed to language justice and aspire to create fully bilingual spaces. We believe everyone has the right to understand and to be understood in the language in which they are most comfortable."

### Implementation Checklist

- [ ] All interface strings in English AND Spanish
- [ ] Language toggle in header/footer
- [ ] Document translations for all resources
- [ ] Meeting interpretation coordination system
- [ ] Language preference in member profile
- [ ] Auto-detect browser language preference
- [ ] Bilingual ballots for elections
- [ ] Bilingual flyers and zines
- [ ] Spanish-language phone banking scripts

### Technical Approach

```javascript
// i18n structure
const strings = {
  en: {
    nav: {
      home: "Home",
      buildings: "Buildings",
      resources: "Resources"
    }
  },
  es: {
    nav: {
      home: "Inicio",
      buildings: "Edificios",
      resources: "Recursos"
    }
  }
};
```

---

## 18. Mobile-First Field Organizing

### PWA Requirements

- [ ] Installable to home screen
- [ ] Works offline (critical for canvassing)
- [ ] Fast load times on mobile networks
- [ ] Touch-friendly interface
- [ ] Large tap targets

### Field Organizing Features

| Feature | Why Important |
|---------|---------------|
| Quick tenant questions | Pull up prompts at the door |
| One-tap complaint submission | Capture issues immediately |
| Offline contact logging | No cell signal in some buildings |
| Building lookup by address | Find building info in the field |
| GPS-optional | Privacy for sensitive locations |

### Mobile UI Priorities

1. Building chat (existing)
2. Event calendar with RSVPs
3. Task sign-up
4. Contact logging
5. Complaint submission
6. Resource quick-reference

---

## 19. Metrics That Matter

### Track These

| Metric | Why It Matters |
|--------|----------------|
| Rent reduced via strikes ($) | Material wins |
| Repairs secured (#) | Living conditions improved |
| Evictions stopped (#) | Displacement prevented |
| Buildings organized (#) | Geographic coverage |
| Strike participation rate (%) | Collective power |
| Campaign win rate (%) | Strategy effectiveness |
| Members in good standing (#) | Active participation |
| 1:1 conversations (#) | Relationship building |

### Don't Obsess Over

| Metric | Why It's Misleading |
|--------|---------------------|
| Social media followers | Don't show up to strikes |
| Website traffic | Pageviews ≠ organizing |
| Email list size | Unopened emails don't help |
| Meeting attendance alone | Meetings aren't victories |

### Victory Documentation

Every win should be documented:

```
Date: ___________
Building: ___________
Landlord: ___________
Type of Win: [Rent reduction/Repairs/Eviction stopped/Other]
Quantified Impact: $_____ saved / [##] units affected
How Long It Took: ___________
Tactics Used: ___________
Member Quote: "___________"
```

---

## 20. Quotes & Inspiration

### From Theoretical Foundation

> "We all have the same problems but landlords keep tenants isolated."

> "A senator won't act for 6 years. A landlord notices a rent strike immediately."

> "Tenants provide the labor that landlords extract profit from. Tenants can withhold that labor collectively."

> "20 families winning $100/month rent reduction spreads faster than 800 Twitter followers."

> "Rent is legalized theft. The landlord owns nothing they created. They extract what tenants produce."

> "Strike wins create recruitment momentum."

### From Core Values

> "Housing is a human right, not a commodity."

> "Everyone needs housing, but no one needs a landlord."

> "An injury to one is an injury to all."

> "We fight for tenants, not for housing. The crisis in our region is not due to a lack of housing."

> "Houselessness is an inevitable consequence of treating housing like a commodity."

### On Organizing Strategy

> "The tool has ONE job: Enable distributed rent strike coordination at scale."

> "Every feature answers: Does this help coordinate a strike or prepare the ground for one?"

> "The platform serves organizing. Organizing doesn't serve the platform."

> "Homes for People, Not for Profit."

---

## Implementation Priority Suggestions

### Phase 1: Foundation (Builds on Existing)

1. **Member activity tracking** - extend Gun.js profiles
2. **Event system** - calendar, RSVPs, meeting notes
3. **Task board** - sign-ups, completion tracking
4. **Educational content** - static pages with tenant rights

### Phase 2: Organizing Intelligence

5. **Complaint collection** - form with Gun.js storage
6. **Building status tracking** - organizing pipeline
7. **Landlord profiles** - static data from database
8. **Outreach logging** - who's been contacted

### Phase 3: Campaign Coordination

9. **Campaign dashboard** - stages, demands, outcomes
10. **Demand builder** - template-based, votable
11. **Strike coordination** - metrics, support network
12. **Victory archive** - documented wins

### Phase 4: Democratic Features

13. **Elections system** - nominations, voting, terms
14. **Bylaw amendments** - proposal, discussion, vote
15. **Grievance process** - internal accountability
16. **Leadership rotation** - term tracking, succession

### Phase 5: Community Features

17. **Mutual aid board** - needs/offers matching
18. **Skills directory** - member capabilities
19. **Time banking** - optional hour tracking
20. **Full bilingual** - complete Spanish translation

---

## Source Documents

This compilation draws from:

- `RSTU_THEORETICAL_FOUNDATION_AND_OPERATIONAL_STRATEGY.md`
- `TENANT_ORGANIZING_INTELLIGENCE_PLATFORM.md`
- `Current Bylaws Draft - Google Docs.md`
- `blueprint-for-community-resilience-and-mutual-aid-networks.md`
- `How to Organize a Tenants Association - Google Docs.md`
- `Tenants Rights In Nevada - Google Docs.md`
- `Mission Statement and Core Values - Google Docs.md`
- `rstu-suggestions.txt`
- `Educational Material Planning 06-20-25 - Google Docs.md`
- `Common Tactics Of Landlords - Google Docs.md`
- `COMPREHENSIVE_PLANNING_ANALYSIS.md`
- Various meeting notes and agendas
- `rstu-notes`

---

*Last Updated: December 17, 2025*
