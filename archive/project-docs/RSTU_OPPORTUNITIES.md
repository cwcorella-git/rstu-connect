# RSTU Connect: Platform Enhancement Opportunities

**Document Created:** 2025-12-26
**Based On:** Analysis of 1,738+ organizing documents, platform architecture, and RSTU's anarchist organizing framework

---

## Overview

RSTU is building a revolutionary organizing toolkit for tenant power through:
- **Education:** 1,738+ curated documents on housing justice, abolition, labor, and revolutionary theory
- **Building Organization:** Direct democracy voting, complaint escalation, demand coordination
- **Mutual Aid:** Needs/offers matching, skills commons, survival coordination
- **Intelligence:** Landlord power mapping, property data, habitability tracking
- **Dual Power:** Creating alternatives to landlordism through collective tenant control

This document outlines 10 high-impact opportunities to strengthen these goals, with detailed specifications for implementation.

---

## Priority Matrix

| Priority | Feature | Effort | Impact | Category |
|----------|---------|--------|--------|----------|
| 🔴 Critical | Habitability Database | Medium | Very High | Organizing |
| 🔴 Critical | Rent Strike Toolkit | Medium | Very High | Direct Action |
| 🟠 High | Landlord Accountability Dashboard | Medium | High | Intelligence |
| 🟠 High | Eviction Defense Network | Medium | High | Mutual Aid |
| 🟠 High | Multilingual Support (Spanish) | Medium | High | Accessibility |
| 🟡 Medium | Direct Action Escalation Timeline | Small | Medium | Organizing |
| 🟡 Medium | Rent Comparison Enhancements | Small | Medium | Intelligence |
| 🟡 Medium | Reading Library Integration | Small | Medium | Education |
| 🟢 Low | Tenant Action History Archive | Small | Medium | Institutional Memory |
| 🟢 Low | Mobile Canvassing (PWA) | Large | High | Field Tools |

---

## OPPORTUNITY 1: Habitability Database

### Current State
- Unit tracker records maintenance complaints
- No systematic habitability scoring
- No pattern detection across building

### Gap Identified
Explicitly mentioned in RSTU's own code comments as Phase 2 need

### Proposed Feature

**Building Habitability Report** (new component for Profile/Property pages)

```
┌─────────────────────────────────────────┐
│ BUILDING CONDITION & HABITABILITY       │
├─────────────────────────────────────────┤
│                                          │
│ Overall Score: 58/100 (Fair)            │
│ ████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│                                          │
│ CRITICAL ISSUES (15 units reporting):   │
│ 🔴 Roaches: 15 units (65%)             │
│ 🔴 Mold/Moisture: 8 units (35%)        │
│ 🟠 Heat Maintenance: 5 units (22%)     │
│ 🟠 Plumbing: 4 units (17%)             │
│                                          │
│ ISSUE TIMELINE:                         │
│ Roach complaints: Jan (2) → Feb (4)     │
│ → Mar (9) [ESCALATING ⚠️]               │
│                                          │
│ COMPARISON:                              │
│ Your rent: $1,200/mo                    │
│ Habitability: 58/100                    │
│ → You're paying premium for substandard │
│   conditions                            │
│                                          │
│ TENANT SUMMARY:                         │
│ "Heat doesn't work in winter"           │
│ "Roaches in every apartment"            │
│ "Landlord ignores maintenance requests" │
│                                          │
│ NEXT STEPS:                              │
│ [📝 File Complaint] [👥 Join Demands]   │
└─────────────────────────────────────────┘
```

### Implementation Details

**Backend (lib/canvassStorage.ts):**
- Add `getHabitabilityScore(chatSlug)` function
- Calculate score from complaint frequency:
  - Roaches: -20 points per 10% of units
  - Mold/moisture: -15 points per 10%
  - Heat/cooling: -15 points per 10%
  - Plumbing: -10 points per 10%
  - Lead/asbestos: -25 points (any report)
  - Landlord responsiveness: +5 points per 10% of complaints resolved
- Base score: 100, min 0
- Track 90-day trend (improving vs. worsening)

**Component (Profile/HabitabilityReport.tsx):**
- Aggregate maintenance data from unit tracker
- Show issue frequencies and percentages
- Timeline visualization of escalation
- Comparison to rent paid (value proposition)
- Direct link to "File Complaint" form

**Integration:**
- Display on Building/Property page (alongside Power Map)
- Display on Profile page (tenant's own building conditions)
- Show in ToolsPage Unit Tracker (organizer view)
- Flag for organizing: Buildings with habitability score <50 get organizing priority boost

### Why RSTU Needs This
- **Immediate Evidence:** Tenants see they're not alone ("15 units have roaches")
- **Negotiation Leverage:** "80% of building reporting X issue = systematic landlord negligence"
- **Legal Documentation:** Complaint trail proves pattern for tenant rights advocacy
- **Organizing Ammunition:** Demonstrates when to escalate to demands/strikes
- **Community Education:** Shows habitability as human right, not luck

### Success Metrics
- Tenants filing complaints increases 20%
- Buildings with <50 habitability score trigger organizing (instead of random)
- Complaint data creates pattern evidence for legal cases

---

## OPPORTUNITY 2: Rent Strike Toolkit

### Current State
- Reading library has strike tactics docs (Autonomous Tenants Union materials)
- No platform tools to prepare for/execute strikes
- Tools exist for canvassing but not strike coordination

### Proposed Feature

**Rent Strike Planning & Coordination Module** (new section in Tools or Building pages)

```
┌──────────────────────────────────────────┐
│ RENT STRIKE READINESS                    │
├──────────────────────────────────────────┤
│                                           │
│ LEGAL FOUNDATION (Nevada):                │
│ ✓ Understand your rights [Read Guide]    │
│ ✓ Document habitability issues [Done: 5] │
│ ✓ Make written repair request [Template] │
│ ✓ Wait 30 days (landlord duty period)   │
│ □ Establish tenant fund [Calculator]     │
│ □ Consult legal clinic [Find in RSTU]   │
│ □ Plan with neighbors [Start chat]       │
│ □ Prepare money hold [How much?]         │
│                                           │
│ COLLECTIVE PREPARATION:                  │
│ Tenants ready to participate: 12/23 (52%)│
│ ◀ Need 65%+ to move forward               │
│ [👥 Build Support] [💬 Discuss in Chat] │
│                                           │
│ MONEY & LOGISTICS:                       │
│ Total monthly rent: $28,000               │
│ Projected strike length: 60 days         │
│ Total held: $56,000                      │
│ Per-tenant average: $2,435                │
│ Escrow account setup: [Guide] [Find Bank]│
│                                           │
│ MUTUAL AID NEEDS:                        │
│ □ Food support for strikers              │
│ □ Childcare coordination                 │
│ □ Emergency fund for evictions           │
│ □ Legal defense fund                     │
│ [Activate Mutual Aid]                    │
│                                           │
│ COMMUNICATION PREP:                      │
│ □ Tenant letter to landlord [Template]   │
│ □ Media statement [Template]             │
│ □ Social media posts [Scheduled]         │
│ □ Legal clinic letter [Template]         │
│                                           │
│ POLICE/EVICTION DEFENSE:                 │
│ □ Know your legal protections [Read]     │
│ □ Organize witness list [12 signed up]   │
│ □ Know eviction timeline [Guide]         │
│ □ Legal clinic contact [Saved]           │
│ [🛡️ Eviction Defense Plan]               │
│                                           │
│ DECISION POINT:                           │
│ When conditions met, vote to strike       │
│ Estimated readiness: 2 weeks              │
│ [Current status: Not Ready (52% < 65%)]  │
└──────────────────────────────────────────┘
```

### Implementation Details

**Component (Building/RentStrikeToolkit.tsx):**
- Checklist: Legal prep, collective readiness, money, mutual aid, communication
- Money calculator: Total rent × strike days → per-tenant amount
- Escrow account finder: Nevada credit unions offering rent escrow
- Template library: Tenant letter, media statement, legal clinic referral
- Strike voting: Track who's committed, identify holdouts
- Timeline visualization: "When should we strike?" based on readiness level

**Integration Points:**
- Live in: Building organizing page (for organizers) + Building page (for tenants)
- Links to: Reading library (strike guides), mutual aid system, governance voting
- Data from: Habitability score, complaint timeline, building rent data

**Legal Content (Nevada-specific):**
- NRS 118A.240: Repair and deduct law
- NRS 118A.200: Habitability standards
- Eviction timelines and legal protections
- Links to Legal Clinic and Nevada Tenants Rights Center

### Why RSTU Needs This
- **Demystifies Power:** Tenants see the concrete path to strike
- **Reduces Fear:** "Here's exactly what to expect, here's legal protection, here's mutual aid"
- **Prevents Mistakes:** Checklists catch gaps (didn't document repair requests, didn't get 65%, didn't plan money)
- **Increases Success:** Prepared strikes are longer, more cohesive, higher win rates
- **Scalability:** Standardized templates & processes allow rapid scaling

### Success Metrics
- First strike initiated through toolkit (proof of concept)
- Strike duration increases 30% (better preparation = longer endurance)
- Win rate increases (documented cases, legal preparation, mutual aid support)

---

## OPPORTUNITY 3: Landlord Accountability Dashboard

### Current State
- Power Map shows landlord portfolio size
- No violation/action history
- No pattern detection across their buildings

### Proposed Feature

**Enhanced Landlord Profile** with accountability history

```
┌─────────────────────────────────────────┐
│ LANDLORD: Michael Barmettler            │
├─────────────────────────────────────────┤
│                                          │
│ PORTFOLIO:                               │
│ • 7 properties owned/controlled         │
│ • 1,130 units under management          │
│ • Est. monthly revenue: $1.35M          │
│ • Corporate structure: [View Map]       │
│                                          │
│ TENANT COMPLAINT ACTIVITY:               │
│ Last 12 months:                          │
│ • 45 complaints filed (avg 6.4/property)│
│ • 8 formal demands issued                │
│ • 2 petition campaigns                   │
│ • 1 strike action (ongoing)              │
│                                          │
│ COMPLAINT HEATMAP:                       │
│ 🔥 2500 E 2nd St: 18 complaints (4x avg)│
│ 🔥 1234 Mill St: 12 complaints (2x avg) │
│ 🟠 456 Oak Ave: 8 complaints             │
│ 🟡 789 Pine Rd: 4 complaints             │
│ 🟢 111 Main St: 2 complaints             │
│                                          │
│ ISSUE PATTERNS:                          │
│ Most common: Roaches (24 complaints)    │
│ Trend: ESCALATING [⚠️ Up 50% YoY]       │
│ Responsiveness: 15% (most ignore)       │
│                                          │
│ TENANT ACTION TIMELINE:                  │
│ Jan 2024: First complaint filed          │
│ Mar 2024: Demand for heat repair         │
│ May 2024: Petition campaign (85 signed) │
│ Jul 2024: Rent strike authorized        │
│ Sep 2024: Strike ongoing (60 days)      │
│                                          │
│ PREVIOUS WINS:                           │
│ 2500 E 2nd St:                           │
│   ✓ Heat system repair (6 months)       │
│   ✓ Pest control program (ongoing)      │
│   ✓ $200 rent reduction (2 units)       │
│                                          │
│ ORGANIZING STRATEGY:                     │
│ Pressure Point: 2500 E 2nd St (most     │
│ complaints, highest visibility)          │
│ Goal: Force city habitability inspection │
│ Timeline: Next 90 days escalate here     │
│                                          │
│ CORPORATE OWNERSHIP:                     │
│ Michael Barmettler                       │
│   └─ Barmettler LLC                     │
│       └─ Manages 7 properties            │
│ [View all properties] [View similar      │
│  landlords]                              │
└─────────────────────────────────────────┘
```

### Implementation Details

**Backend (lib/landlordProfileStorage.ts expansion):**
- Track complaint history per property per date
- Calculate complaint frequency, trend (up/down), responsiveness rate
- Identify "pressure point" properties (highest complaint density)
- Link to tenant actions (demands, strikes, petitions)

**Component (PowerMap/LandlordAccountabilityDashboard.tsx):**
- Complaint timeline with heatmap (which buildings generating complaints)
- Action timeline (when did tenants escalate, what was outcome)
- Win archive (what improvements have tenants won)
- Organizing strategy widget (where should organizers focus next)
- Corporate structure visualization

**Integration:**
- Replace/expand LandlordDetail.tsx
- Link from Power Map
- Use for organizer strategy planning
- Show tenants "you're not alone" (see history of complaints at this landlord)

### Why RSTU Needs This
- **Identifies Targets:** Which landlords are vulnerable? Which have patterns?
- **Builds Institutional Memory:** "We won heat here in 2022, pest control in 2023"
- **Shows Patterns:** "Complaints at 2500 E 2nd escalating every quarter"
- **Strategic Focus:** Organizers see where to concentrate resources
- **Public Accountability:** Creates permanent record of landlord behavior

### Success Metrics
- Complaint data informs 80% of organizing decisions
- Organizers identify "pressure points" faster
- Landlords see organized tracking (deters egregious behavior)

---

## OPPORTUNITY 4: Eviction Defense Network

### Current State
- Mutual aid system exists (generic needs/offers)
- No specific eviction case tracking
- No coordinated eviction defense infrastructure

### Proposed Feature

**Eviction Defense Coordination** (mutual aid specialization)

```
┌──────────────────────────────────────────┐
│ EVICTION EMERGENCY RESPONSE              │
├──────────────────────────────────────────┤
│                                           │
│ ACTIVE CASES (Immediate Support Needed):  │
│                                           │
│ 🚨 URGENT                                │
│ • Sarah M. at 2500 E 2nd St, Unit 4     │
│   Court date: Feb 14, 2025               │
│   Case type: Nonpayment (legitimate)     │
│   Issue: Landlord withheld security      │
│          deposit for retaliation         │
│   Legal status: Consulting clinic        │
│   Mutual aid needs:                      │
│   - Legal fund: $2,500 for attorney      │
│   - Moving fund: $1,500 if evicted       │
│   - Childcare during court: 1 week       │
│   Response: 3 volunteers signed up       │
│   [Contribute] [Volunteer] [Share]       │
│                                           │
│ 🟠 IN PROGRESS                           │
│ • James K. at 789 Mill St, Unit 12      │
│   Court date: Mar 21, 2025               │
│   30 days until hearing                  │
│   Support plan: Ongoing legal clinic     │
│   [View Details] [Offer Support]         │
│                                           │
│ ADVOCACY OPPORTUNITIES:                   │
│ Feb 14 Court Hearing (Sarah's case)     │
│ Location: Regional Justice Center       │
│ Need: 20 tenants as visible support     │
│ Signup: [12 committed, need 8 more]     │
│ Orientation: [Legal clinic, Feb 12]     │
│                                           │
│ EVICTION DEFENSE PLAYBOOK:                │
│ Nevada-specific legal protections:       │
│ □ Know key dates (3-day, 5-day, etc.)   │
│ □ Know your rights as defendant         │
│ □ Continuance tactics (buy time)        │
│ □ Witness testimony (habitability)      │
│ [Read Full Guide] [Find Legal Clinic]   │
│                                           │
│ FINANCIAL SUPPORT LAUNCHED:              │
│ "Emergency Rent & Legal Fund"            │
│ Goal: $5,000 (for 2-3 families)         │
│ Raised: $2,100 (42%)                    │
│ [View Fundraiser] [Contribute]           │
│                                           │
│ PREVENTION (CASES AT RISK):               │
│ At-risk tenants (rent <$900, in         │
│ habitability dispute):                   │
│ • Maria S., 456 Oak Ave - Proactive     │
│   support?                               │
│ [Register] [Offer Support]               │
└──────────────────────────────────────────┘
```

### Implementation Details

**New Storage (evictionDefenseStorage.ts):**
- Track eviction cases: Defendant, property, court date, status, legal outcome
- Mutual aid mapping: Case → specific needs (legal, moving, childcare, etc.)
- Advocacy signup: Court appearance witness lists
- Defense resource library: Nevada-specific legal guides

**Component (MutualAid/EvictionDefenseNetwork.tsx):**
- Active case dashboard with urgency levels
- Needs tracker (legal fund, moving costs, support)
- Court appearance signup (with training)
- Playbook/legal guide links
- Prevention alerts (at-risk tenants)
- Fundraiser coordination

**Integration:**
- Part of Mutual Aid tab
- Link from user profiles (if eviction in progress)
- Alert organizers when case is critical
- Track outcomes (won, settled, prevented, lost) for learning

### Why RSTU Needs This
- **Mutual Aid Core:** Evictions are existential threat; coordinated response demonstrates power
- **Turns Trauma → Power:** Individual desperation becomes collective action
- **Legal Scaffolding:** Prevents amateur mistakes, ensures legal clinic involvement
- **Institutional Learning:** Outcomes inform future cases
- **Preventive:** Identifying at-risk tenants early enables earlier action

### Success Metrics
- 80% of evicted tenants have legal representation (vs. current rates)
- Prevention: At-risk tenants supported early
- Winning streak: Eviction cases won increase from baseline

---

## OPPORTUNITY 5: Direct Action Escalation Timeline

### Current State
- Governance system has voting (65% strike threshold)
- No visualization of the escalation path
- Tenants don't see concrete next steps

### Proposed Feature

**Campaign Status Widget** (small component for Building pages)

```
BUILDING CAMPAIGN STATUS:

COMPLAINT FILED ✓ Jan 15
↓ [17 days in complaint phase]
DEMAND PUBLISHED ✓ Feb 1 (landlord response deadline: Mar 1)
↓ [28 days in negotiation]
NEGOTIATION IN PROGRESS ○ [14 days remaining]
↓
PETITION COLLECTING ○ [X signatures: 12/23 needed for vote]
↓
DEMAND VOTE ○ [Not yet collected]
↓
STRIKE AUTHORIZATION VOTE ○ [Need 65%: 0% ready]
↓
STRIKE ACTION ○ [Not authorized]

NEXT MILESTONE: Reach 23 signatures on petition (12 so far)
[View petition] [Get more signatures]

WHEN DO WE STRIKE? Calculator:
- Current support: 52% (need 65%)
- Estimated when ready: 3 weeks
- Conditions to accelerate: More habitability complaints
```

### Implementation Details

**Backend (buildingOrganizingStorage.ts expansion):**
- Track phase progression with dates
- Calculate % progress toward next phase
- Estimate timeline to strike readiness

**Component (Building/CampaignStatusWidget.tsx):**
- Visual timeline with current phase highlighted
- Progress toward next milestone (e.g., "15/23 signatures")
- Calculator: "When do we strike?"
- Links to action (sign petition, file complaint, vote)

**Integration:**
- Display on Building page (high visibility)
- Show on individual tenant's profile (their building's status)
- Organizer view shows all buildings' timelines

### Why RSTU Needs This
- **Demystifies Process:** Tenants see exactly where campaign is
- **Maintains Momentum:** Clear next steps encourage participation
- **Reduces Uncertainty:** "We need 11 more signatures, that's 2 more conversations"
- **Shows Power:** "50 days ago we were at step 1, now we're at step 3"

### Success Metrics
- Petition signature collection rate increases 30%
- Tenant engagement on building campaigns increases
- Strike readiness reaches faster (clear path accelerates momentum)

---

## OPPORTUNITY 6: Rent Comparison Enhancements

### Current State
- Rent comparison shows metrics on profile
- Static "your rent is X% above/below benchmark"
- No tracking over time or comparing across landlords

### Proposed Enhancements

**Add to existing RentComparisonSection:**

1. **Rent Increase Tracker:**
   ```
   YOUR RENT HISTORY:
   Jan 2023: $1,000
   Jan 2024: $1,050 (+5%)
   Jan 2025: $1,100 (+4.7%) 🚨 Unusual jump

   Reno average increase: 3% yearly
   Your increase: 4.7% (above average)

   Alert: Two unusual jumps in row
   [Join rent strike planning]
   ```

2. **Landlord Comparison:**
   ```
   HOW DOES YOUR LANDLORD COMPARE?

   This landlord (avg): $1,200 for 1BR
   Other landlords:
   - Lowest: $950 [Property name]
   - Median: $1,050 [Most common]
   - Yours: $1,200 [Above 90th percentile]
   ```

3. **Regional Context:**
   ```
   YOUR RENT IN CONTEXT:
   Building average: $1,150
   Reno average (1BR): $1,050
   Market premium: $150/mo ($1,800/year)
   ```

### Implementation Details

**Backend (rentFairnessCalculations.ts expansion):**
- Track historical rent (add `rentHistory: {date, amount}[]` to profile)
- Calculate YoY increase percentage
- Compare to regional averages

**Component (Profile/RentHistoryChart.tsx):**
- Line chart of rent over time
- Flag unusual spikes
- Compare to other tenants and region
- Show cumulative impact ("You've paid $2,400 extra vs. regional average")

**Integration:**
- Add tab to RentComparisonSection: "Your Rent" | "History" | "Comparison"
- Use for organizing: "Unusual spikes trigger Rent Strike Toolkit"

### Why RSTU Needs This
- **Identifies Trends:** Catches aggressive landlords early
- **Builds Evidence:** Historical data = pattern documentation
- **Comparison = Power:** Tenants see they're being overcharged vs. others
- **Triggering Action:** Unusual spikes prompt strike toolkit review

### Effort: Low | Impact: Medium
Easy to implement on existing rent tracking infrastructure

---

## OPPORTUNITY 7: Reading Library Integration

### Current State
- 1,738 documents in organized categories
- No linking to platform actions
- Tenant must know what to search for

### Proposed Feature

**Contextual Document Recommendations**

At moment of action, surface relevant reading:

**Scenario 1 - Filing a complaint:**
```
BEFORE YOU FILE: Read these
□ "Tenant Rights in Nevada" [3 min read]
□ "How to Document Repairs" [5 min read]
□ "Your Legal Protection as Renter" [8 min read]
[I'm ready to file]
```

**Scenario 2 - Considering rent strike:**
```
THINKING ABOUT STRIKING? Learn first:
□ "Autonomous Tenants Union Tactics" [15 min]
□ "How to Organize a Rent Strike" [10 min]
□ "Legal Protections During Strikes" [8 min]
[Start Strike Toolkit]
```

**Scenario 3 - Power Map viewing:**
```
UNDERSTANDING LANDLORD POWER:
□ "In Defense of Housing" (property theory) [30 min]
□ "How to Read Corporate Structures" [5 min]
□ "Identifying Landlord Vulnerabilities" [10 min]
```

### Implementation Details

**Add to components:**
- Small "📚 Learn" widget on complaint form
- Sidebar on Tools/Power Map pages
- Pre-action education in modals

**Backend (simple mapping):**
```typescript
const contextualDocs = {
  'filing_complaint': ['tenant_rights', 'documenting_repairs'],
  'rent_strike': ['strike_tactics', 'legal_protections'],
  'power_map': ['landlord_power', 'corporate_structures'],
  'eviction_defense': ['eviction_playbook', 'legal_rights']
}
```

### Effort: Low | Impact: Medium
Leverages existing reading library, just adds contextual display

---

## OPPORTUNITY 8: Tenant Action History Archive

### Current State
- No permanent record of building campaigns
- Organizing wins go undocumented
- New organizers can't learn from past campaigns

### Proposed Feature

**"Our Wins" Dashboard + Case Study Archive**

```
BUILDING VICTORY ARCHIVE:

2500 E 2nd St:
✓ 2022: Heat system repair (60-day campaign)
   - 45 tenants participated
   - 3 escalations (complaint → demand → action notice)
   - Outcome: Landlord replaced heating system
   - Cost savings: ~$300/tenant/winter

✓ 2023: Pest control program (30-day campaign)
   - 38 tenants participated
   - Method: Petition + legal clinic threat
   - Outcome: Monthly pest control service added
   - Cost: Landlord absorbed (no rent increase)

Case Study: "How We Won Heat at 2500 E 2nd"
[Read 2,000-word detailed write-up about strategy, timeline, lessons]

RSTU ORGANIZING SUMMARY (2023-2024):
- Buildings organized: 12
- Successful campaigns: 8
- Tenant actions taken: 23
- Repairs won: 47
- Rent reductions: 3
- Strikes authorized: 2 (1 ongoing)
- Evictions prevented: 4
- Total units represented: 580
```

### Implementation Details

**Backend (new storage):**
- Campaign archive: building × date × outcome
- Lessons learned database
- Success metrics per campaign

**Component (Archive/VictoriesArchive.tsx):**
- Timeline of organization
- Case study write-ups (with photos, quotes from tenants)
- Impact metrics dashboard
- Searchable by building/landlord/year

**Integration:**
- Accessible from Power Map (previous wins at this landlord)
- Accessible from Building page (this building's history)
- Show in onboarding (proof that organizing works)

### Effort: Low | Impact: Medium
Primarily data entry and component building (leverages existing data)

---

## OPPORTUNITY 9: Multilingual Support (Spanish)

### Current State
- Platform entirely in English
- Documents entirely in English
- ~35% of Reno is Hispanic population

### Proposed Enhancements

**Phase 1: Critical paths only (10 languages)**
- User interface (UI strings)
- Tenant rights documents (5 most important)
- Complaint filing process
- Mutual aid needs posting

**Phase 2: Full platform (all documents)**
- Complete UI translation
- All 1,738+ documents in Spanish
- Building-specific language detection (80% Spanish-speaking building → default Spanish)

### Implementation Details

**Frontend (i18n framework):**
```typescript
// Use existing i18n library (simple setup)
npm install i18next react-i18next

// Key pages to translate:
- Profile/Complaint filing
- MutualAid/Needs posting
- Reading library
- Building pages (tenant rights)
```

**Content (Translation strategy):**
- Phase 1: Professional translation service for 30 highest-impact documents ($2-3K)
- Ongoing: Community volunteers for other documents

### Effort: Medium | Impact: High
Major accessibility improvement, reaches 35% of population

---

## OPPORTUNITY 10: Mobile Canvassing (PWA)

### Current State
- Tools require desktop/laptop
- Field organizers go home to record data
- No offline support

### Proposed Feature

**Progressive Web App (PWA) with field tools**

```
MOBILE CANVASSING INTERFACE:

[🏠 2500 E 2nd St] [Unit: 4A] [⬅️ Back]

TENANT: Maria Gonzalez
Phone: (775) 555-1234
Last contact: Jan 10 (3 weeks ago)
Status: Receptive / Neutral / Hostile

QUICK ACTIONS:
□ [🤝 Contact Made]
□ [💬 Take Notes]
□ [📸 Photo]
□ [✓ File Complaint]

UNIT STATUS:
Heat: Working ✓
Hot Water: Working ✓
Roaches: REPORTED ❌ [Mark complaint]
Mold: No
Plumbing: No

NOTES:
"Maria mentioned roach problem since December,
landlord ignored her complaint"

[Save & Next Unit] [Save & End Shift]
```

### Implementation Details

**Frontend (PWA setup):**
- Next.js PWA plugin (minimal change)
- IndexedDB for offline storage
- Sync when back online

**Mobile Features:**
- QR code scanning (opens unit form)
- One-touch complaint filing
- Visual unit map (see progress)
- Offline storage (works without wifi)

**Data sync:**
- Records locally on phone
- Syncs when reconnected
- No data loss

### Effort: Large | Impact: High
Requires PWA infrastructure but enables field organizing (long-term ROI)

---

## RECOMMENDED FIRST INTEGRATION

**Pick One: Habitability Database**

### Why This First?

1. **Fills Explicit Gap:** RSTU identified this as Phase 2 need
2. **Builds on Recent Work:** Integrates with existing complaint infrastructure
3. **High-Impact:** Directly informs organizing strategy
4. **Moderate Effort:** Uses existing data, new aggregation/display layer
5. **Proof of Concept:** Demonstrates value, unblocks other features

### Implementation Path

1. **Step 1:** Add `getHabitabilityScore()` function to `canvassStorage.ts`
2. **Step 2:** Create `HabitabilityReport.tsx` component (like RentComparisonSection)
3. **Step 3:** Add to Building page + Property page + Profile (tenant's own building)
4. **Step 4:** Add habitability score to organizing priority scoring
5. **Step 5:** Test, document, deploy

### Expected Timeline
- Design: 1 day
- Implementation: 3-4 days
- Testing: 1-2 days
- **Total: 5-7 days**

---

## Next Steps

1. **Choose one feature** from Priority Matrix (recommended: Habitability Database)
2. **Design detailed specifications** (I can do this)
3. **Implement in phases** (start small, iterate)
4. **Get feedback from RSTU members** (does it match their needs?)
5. **Deploy and measure impact** (did organizing improve?)

---

## Questions to Guide Decision

- Which feature will RSTU use most immediately?
- What's the current bottleneck in organizing? (complaints not escalating? strikes failing? organizing unfocused?)
- Do you have capacity to implement now, or planning for future?
- Any features that RSTU specifically asked for?

The platform is solid—these enhancements transform it from **tool infrastructure** into **organizing powerhouse**.
