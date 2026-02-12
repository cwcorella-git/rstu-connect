# Navigation Pattern Research

## Current Navigation Order

**Desktop:** Home → Organize → Reading → Resources → Mutual Aid → Tools → Profile

**Analysis of each tab:**

---

## 1. HOME (Landing Page)
**Access:** Public (everyone)
**Primary Action:** "Enter" the app
**Language Pattern:** Welcome, introduction, call-to-action
**User Can:**
- View mission/manifesto
- See what the app does
- Navigate to specific sections
- Get oriented before diving in

**Key Pattern:** **Gateway** - First impression, orientation

---

## 2. ORGANIZE (Building Directory)
**Access:** Restricted - Requires profile (tenants, organizers, admins)
**Primary Actions:** Browse properties, view building details, chat, link buildings into blocs
**Language Pattern:** "Buildings", "Properties", "Chat", "Map", "Events"
**User Can:**
- Search 16,000+ rental properties
- View property details (owner, units, value, violations, evictions)
- Join building-specific chat rooms
- Create/join events (meetings, actions, workshops)
- Link properties into organizing blocs (Ctrl+click)
- View 3D map with nearby buildings
- Coordinate with neighbors

**Key Pattern:** **Core Organizing Tool** - Where tenant power is built through connection and coordination

**Access Control:**
```typescript
if (!canAccessOrganizeTab) {
  return (
    <div>
      <h2>Create a Profile to Access Organize</h2>
      <p>This section is for tenants organizing in their buildings.</p>
    </div>
  );
}
```

---

## 3. READING (Document Library)
**Access:** Public (everyone)
**Primary Actions:** Browse, read, search educational materials
**Language Pattern:** "Reading Library", "Documents", "Categories"
**User Can:**
- Browse 2,254 organizing documents across 14 categories
- Search full-text (Supabase FTS or client-side fallback)
- Read articles about:
  - Labor organizing & strikes
  - Tenant rights & housing
  - Theory (anarchism, socialism)
  - Abolition (police/prison)
  - Environmental justice
  - Historical movements
  - Direct action tactics
- Favorite documents (stored locally)
- View "RSTU Curated" featured selections

**Admin Can:**
- Edit document titles
- Hide/show documents
- Delete documents
- Feature documents in "RSTU Curated"

**Key Pattern:** **Education Hub** - Self-education, knowledge building, historical context

**Categories (14):**
1. Abolition
2. Arts Culture Music
3. Contemporary Analysis
4. Economic Alternatives
5. Environmental Justice
6. Feminist Theory
7. Housing
8. International Solidarity
9. Labor
10. Notes
11. Organizing
12. Technology Digital Justice
13. Theory
14. Youth Student Organizing

---

## 4. RESOURCES (External Organizations)
**Access:** Public (everyone)
**Primary Actions:** Find external help/services
**Language Pattern:** Organizations, services, categories
**User Can:**
- Browse ~80 external organizations by category:
  - Emergency Services (shelters, crisis lines, food banks)
  - Legal Aid (tenant law, eviction defense)
  - Housing Support (vouchers, advocacy)
  - Health & Wellness (mental health, medical)
  - Community Services (mutual aid orgs)
  - Government Agencies
  - Youth & Education
  - Employment
  - Specialty Services
- View contact info, hours, eligibility
- Filter by service type
- Search organizations

**Key Pattern:** **External Help Directory** - Connecting to established services

**Data Source:** `data/external-resources.json` (80 organizations)

---

## 5. MUTUAL AID (Neighbor-to-Neighbor Support)
**Access:** Restricted - Requires profile
**Primary Actions:** Share needs/offers, lend tools, offer skills
**Language Pattern:** "Needs", "Offers", "Skills", "Library"
**User Can:**
- **Needs Tab:** Post and respond to needs (food, rides, childcare, etc.)
- **Offers Tab:** Post and respond to offers of help
- **Skills Tab:** Share skills (repair, translation, legal knowledge, etc.)
- **Library Tab:** Share tools/equipment for checkout
  - Tools, appliances, books, etc.
  - Check out/return tracking
  - Building-based pickup

**Categories:**
- Needs/Offers: Food, Housing, Childcare, Transportation, Financial, Medical, Other
- Skills: Repair, Legal, Medical, Translation, Childcare, Tech, Advocacy, Organizing
- Library: Tools, Appliances, Books, Equipment

**Key Pattern:** **Mutual Aid Network** - Direct peer support, building community resilience

**Access Control:**
```typescript
if (!hasProfile) {
  return (
    <div>
      <h2>Mutual Aid</h2>
      <p>Mutual Aid is available to registered tenants only.</p>
      <p>Create a profile to join the mutual aid network...</p>
    </div>
  );
}
```

---

## 6. TOOLS (Organizer Toolbox)
**Access:** Restricted - Organizers & Admins only
**Primary Actions:** Track units, canvass, analyze power structures, manage campaigns
**Language Pattern:** "Unit Tracker", "Canvassing", "Power Map", "Campaigns", "Tasks"
**User Can:**
- **Unit Tracker:** Door-knocking database
  - Track every unit in building
  - Record tenant contact attempts, interest level
  - Notes on accessibility, household composition
  - Activity tracking for organizing metrics
- **Intake Form:** Structured tenant intake questionnaire
- **Canvassing (Field Mode):** Mobile-optimized door-knocking interface
- **Power Map:** Landlord research & analysis
  - Track corporate landlords
  - Eviction rates by landlord
  - Portfolio analysis
  - Violation tracking
- **Campaigns:** Issue-based organizing campaigns
- **Building Conditions:** Habitability dashboard with filters
- **Tasks:** Task management for organizing work
- **Users:** Directory of active organizers

**Key Pattern:** **Organizer Workspace** - Professional organizing tools for building power

**Access Control:**
```typescript
const { canAccessToolsTab } = useAuth()
// Only organizers and admins
```

---

## 7. PROFILE (User Settings & Account)
**Access:** Public (can create profile) / Authenticated (view/edit own profile)
**Primary Actions:** Login, create profile, manage settings, view messages
**Language Pattern:** "Profile", "Login", "Settings", "Messages"
**User Can:**
- Create tenant profile (building selection, role)
- View/edit profile info
- See organizing activity stats
- Direct messages inbox
- Rent fairness comparison
- Language preferences
- Display settings
- Governance participation (if delegate)

**Key Pattern:** **Account Management** - Identity, settings, personalization

---

## Language & Terminology Patterns

### Action Verbs by Tab:
- **Home:** Browse, Search, Select, Chat, Coordinate, Link
- **Organize:** (same as Home)
- **Reading:** Read, Learn, Search, Favorite, Browse
- **Resources:** Find, Contact, Browse, Filter
- **Mutual Aid:** Share, Request, Offer, Check Out, Help
- **Tools:** Track, Canvass, Analyze, Campaign, Map
- **Profile:** Login, Edit, Message, Configure

### Access Levels:
1. **Public** (no login): Home (Landing), Reading, Resources
2. **Tenant** (profile required): Organize, Mutual Aid, Profile
3. **Organizer/Admin** (elevated role): Tools

### User Mental Model:
Looking at the patterns, there appear to be 3 distinct user journeys:

**Journey A: Learning → Action**
- Visitor explores **Reading** (education)
- Creates profile to access **Organize** (action)
- Uses **Tools** (if organizer) to deepen organizing

**Journey B: Need → Community**
- Visitor finds help via **Resources** (external services)
- Creates profile for **Mutual Aid** (peer support)
- Joins **Organize** (collective power)

**Journey C: Already Organizing**
- Goes straight to **Organize** (main workspace)
- Uses **Tools** for systematic organizing
- References **Reading** for tactics/theory

---

## Functional Hierarchy (By User Action Frequency)

Based on what users actually *do* in each section:

### High-Frequency (Daily/Weekly Use):
1. **Organize** - Chat, coordinate, view events (social/coordination)
2. **Profile** - Messages, activity check (personal)
3. **Mutual Aid** - Check needs/offers, fulfill requests (community care)

### Medium-Frequency (Weekly/Monthly Use):
4. **Tools** - Canvassing sessions, power map updates (organizing work)
5. **Resources** - Find services when needed (crisis/referral)

### Low-Frequency (Reference/Occasional):
6. **Reading** - Learn tactics, research theory (education/reference)
7. **Home (Landing)** - One-time entry point

---

## Recommendations for Ordering

### Option 1: Action-First (Active Organizers)
```
Home → Organize → Tools → Mutual Aid → Profile → Resources → Library
```
**Rationale:** Prioritize organizing work, assumes users are already engaged

**Pros:**
- Organizers get to tools faster
- Emphasizes action over education
- Reflects high-frequency use patterns

**Cons:**
- "Library" buried at end
- Less accessible to newcomers

---

### Option 2: Public-First (Accessible Entry)
```
Home → Library → Resources → Organize → Mutual Aid → Tools → Profile
```
**Rationale:** Education and help resources first, action tools after login

**Pros:**
- **Library** gets prominence as education hub
- Public-facing content up front
- Natural progression: learn → act
- Accessible to visitors/researchers

**Cons:**
- Organizing tools deeper in nav
- May feel less action-oriented

---

### Option 3: Balanced (Learning + Action)
```
Home → Organize → Library → Mutual Aid → Resources → Tools → Profile
```
**Rationale:** Core organizing first, education second, support third

**Pros:**
- **Organize** (main workspace) stays prominent
- **Library** (renamed from Reading) elevated to position 3
- Balances action + education
- Natural flow for engaged tenants

**Cons:**
- Resources somewhat buried

---

### Option 4: Community-First (Care + Power)
```
Home → Mutual Aid → Organize → Library → Resources → Tools → Profile
```
**Rationale:** Emphasize mutual aid culture, then organizing, then education

**Pros:**
- Foregrounds solidarity/care
- Shows non-transactional organizing
- **Library** still in top 4

**Cons:**
- Mutual Aid requires login, blocks public access early
- Less intuitive for first-time visitors

---

## Data-Driven Insights

### Access Funnel:
```
Public (3 tabs) → Tenant (5 tabs) → Organizer (6 tabs)
         ↓                ↓                  ↓
   Reading          Organize            Tools
   Resources        Mutual Aid
   Home             Profile
```

### Most Important Rename:
**"Reading" → "Library"** (or "Resources & Library" to distinguish)

Current conflict: "Resources" = external orgs, "Reading" = documents
Better: "Organizations" vs "Library" or "Services" vs "Library"

### Suggested Additional Renames:
- **Resources** → **Organizations** or **Services** (clearer purpose)
- **Reading** → **Library** (more professional, less passive)
- **Organize** → Could stay, or become **Buildings** (more concrete)

---

## Final Recommendation

**Recommended Order:**
```
Home → Organize → Library → Mutual Aid → Services → Tools → Profile
```

**Renamed tabs:**
- ~~Reading~~ → **Library**
- ~~Resources~~ → **Services** (or Organizations)

**Rationale:**
1. **Home** - Entry point (landing page)
2. **Organize** - Core function (buildings/chat/events) - most used by active members
3. **Library** - Education hub - elevated from position 3→3, renamed for clarity
4. **Mutual Aid** - Community support - high-frequency, requires profile
5. **Services** - External help - renamed for clarity vs Library
6. **Tools** - Organizer workspace - restricted, specialized
7. **Profile** - Account/settings - utility function

This ordering:
- Keeps **Organize** prominent as main workspace
- Elevates **Library** (was Reading) to position 3
- Distinguishes **Services** (external) from **Library** (educational)
- Flows logically: buildings → education → mutual aid → external help → organizer tools → account
- Works for both new visitors (public content up front) and active organizers (core tools accessible)
