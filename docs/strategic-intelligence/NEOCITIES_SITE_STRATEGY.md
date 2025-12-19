# RSTU Connect: Neocities Site Strategy

**Status**: Phase 1 Complete (Site Repositioning)
**Last Updated**: November 13, 2025

---

## Executive Summary

RSTU Connect is being repositioned as a **building-level organizing coordination hub** distinct from the main Reno-Sparks Tenants Union website (renosparkstenantsunion.org). The Neocities site will serve as the member-facing platform for real-time organizing coordination, with property intelligence and building-specific chat rooms as core features.

---

## The Two-Site Strategy

### Main RSTU Website (renosparkstenantsunion.org)
**WordPress-based public-facing organization hub**

**What it has:**
- Regular blog with policy analysis and advocacy content
- Member storytelling platform
- Volunteer signup forms
- Event listings
- Mutual aid request system
- Community information and contact

**Primary function:** Public education, advocacy, policy engagement, community organizing

**What it lacks:** Practical organizing tools, member-only space, property intelligence, building-specific coordination

---

### RSTU Connect (Neocities Site)
**Next.js static site for member coordination**

**What it will have:**
- Building-specific Matrix/Element chat rooms
- Searchable property database (192,463 Washoe County properties)
- Organizing toolkit (campaign templates, checklists, forms)
- Legal resources and partner contact information
- Building committee coordination tools
- Corporate landlord intelligence and portfolio analysis

**Primary function:** Member coordination, organizing tools, building-level campaigns, property research

**Clear distinction:** RSTU Connect is NOT a secondary blog or duplicate resource hub - it's the operational platform for active organizing.

---

## Design Principles

### 1. **No Content Duplication**
- Blog stays on main site
- Policy analysis stays on main site
- Member stories stay on main site
- Advocacy content stays on main site

**RSTU Connect hosts ONLY:**
- Building-specific organizing tools
- Campaign templates and checklists
- Documentation tools for organizing
- Legal reference materials NOT on main site
- Building community chat rooms
- Property database and landlord intelligence

### 2. **Clear Navigation Between Sites**
- Header banner on every RSTU Connect page links to main site
- Main site will link to RSTU Connect for specific tools
- Navigation clearly labels this as a member coordination hub

### 3. **Member-First Design**
- Initially public (site discoverability)
- Will eventually include authentication layers (as originally planned)
- Real-time coordination focus (not static documentation)
- Building-level interface (not organization-wide)

---

## Site Structure

### Current Pages (Phase 1)

```
RSTU Connect/
├── / (Home)
│   ├── Positioning banner
│   ├── Building-specific chat hub section (3 example buildings)
│   ├── Property database search section (coming soon)
│   └── Interest form
├── /buildings (formerly /properties)
│   ├── Active organizing campaigns by building
│   ├── Building status (Organizing, Early Organizing, etc.)
│   ├── Links to Element/Matrix chat rooms (coming soon)
│   └── How organizing works (Connect → Organize → Win)
├── /toolkit (formerly /resources)
│   ├── Campaign demand templates
│   ├── Habitability checklists
│   ├── Building committee meeting agendas
│   ├── Repair request documentation forms
│   ├── Tenant coalition letter templates
│   ├── Lease review checklists
│   ├── Rent increase response templates
│   ├── Northern Nevada Legal Aid (with correct link)
│   ├── Clark County Civil Self-Help Law Center (with correct link)
│   └── How to use these tools
├── /get-started
│   └── 5-step guide to organizing your building
├── /help
│   └── Tenant rights and housing problem help
└── /join
    └── Organizer recruitment

```

### Coming Soon (Phase 2-3)

- **Property Database Search** - Client-side searchable database
  - Search by address
  - Search by landlord name
  - See corporate ownership portfolios
  - Identify other tenants in same portfolio

- **Building Intelligence Pages** - Per-property detail pages
  - Owner/corporate structure information
  - Other properties in portfolio
  - Known issues and organizing status
  - Community organizing timeline

- **Matrix/Element Integration** - Live chat coordination
  - Embedded Matrix widget on building pages
  - Per-building organizing channels
  - Encrypted member-to-member communication
  - Task coordination and updates

- **Campaign Tracking** - Member dashboard features
  - Active campaigns by location
  - Organizing status updates
  - Task assignments
  - Victory celebration and documentation

---

## Toolkit Contents (Phase 1)

### Campaign Tools
1. **Campaign Demand Template** - Structure for clear, achievable demands
2. **Tenant Coalition Letter Template** - Multi-tenant demand letter
3. **Rent Increase Response Template** - Legal response to excessive increases

### Documentation Tools
1. **Habitability Checklist** - Nevada habitability standards
2. **Repair Request Documentation Form** - Track maintenance issues over time
3. **Lease Review Checklist** - Identify illegal lease terms

### Committee Tools
1. **Building Committee Meeting Agenda Template** - Structure for organizing meetings
2. (Coming soon: Power mapping, coalition strategy guides, escalation tactics)

### Legal Resources
1. **Northern Nevada Legal Aid** - Free legal assistance
   - Direct link: https://www.nnlegalaid.org/contact-us
   - Phone: (775) 284-5005

2. **Clark County Civil Self-Help Law Center** - Self-help forms for court
   - Direct link: https://clarkcountycourts.us/self-help-center/

### Legal Reference
1. **Nevada Tenant Rights Overview** - Summary of key tenant protections
2. **Lease Review Checklist** - What Nevada law requires in leases

---

## Technical Architecture

### Static Site (Neocities)
- **Platform**: Next.js 14.2 with static export
- **Hosting**: Neocities (free tier, no backend required)
- **CI/CD**: GitHub Actions with official `bcomnes/deploy-to-neocities` action
- **Styling**: Tailwind CSS
- **Deployment**: Automatic on push to main branch

### Database Strategy
- **Property data source**: Washoe County parcel records (already extracted)
- **Database size**: 192,463 properties, 99.97% success rate
- **Implementation**: Pre-generated static pages (for priority properties) + client-side JSON search for full database
- **Hosting**: Static files on Neocities (no API calls needed)

### Chat Integration
- **Platform**: Matrix/Element (end-to-end encrypted)
- **Per-building channels**: One channel per organizing campaign
- **Integration**: Embedded Element widget on building pages
- **Security**: Room invites controlled by RSTU organizers

---

## Differentiation from Main Site

| Feature | Main RSTU Site | RSTU Connect |
|---------|---|---|
| **Blog/News** | ✅ Active, monthly posts | ❌ No blog |
| **Member Stories** | ✅ Storytelling platform | ❌ No stories |
| **Advocacy Content** | ✅ Policy analysis, action alerts | ❌ No advocacy content |
| **Events Calendar** | ✅ Local event listings | ❌ No events |
| **Mutual Aid Requests** | ✅ Peer-to-peer support matching | ❌ Not on Connect |
| **Volunteer Signup** | ✅ "Get Involved" form | ❌ Specific to buildings |
| **Building Chat** | ❌ Not on main site | ✅ Per-building channels |
| **Property Database** | ❌ Not searchable | ✅ Searchable (coming soon) |
| **Organizing Templates** | ❌ Links to blog posts | ✅ Downloadable templates |
| **Campaign Coordination** | ❌ Not featured | ✅ Member dashboard (coming) |
| **Building Intelligence** | ❌ Not covered | ✅ Landlord portfolio analysis |
| **Legal Tools** | ❌ Links to providers | ✅ Integrated checklists/forms |

---

## Phase Roadmap

### Phase 1: Site Repositioning ✅ COMPLETE
- Remove duplicate blog section
- Replace generic resources with organizing-specific toolkit
- Fix partner legal aid links
- Create positioning banner and clear site messaging
- Update homepage with building chat hub focus
- Deploy repositioned site

**Status**: Deployed Nov 13, 2025

---

### Phase 2: Property Database Implementation (Next)
1. Generate client-side searchable JSON from 192K property database
2. Implement address-based and landlord-name search
3. Pre-generate detail pages for top 200-500 organizing priority properties
4. Create "Portfolio View" showing all landlord properties
5. Add corporate ownership intelligence and analysis

**Timeline**: 1-2 weeks

**Technical Approach:**
- Use Fuse.js for fast client-side search
- Pre-generate static HTML files for priority properties
- Fall back to JSON search for full database (light-weight, browser-based)

---

### Phase 3: Matrix Chat Integration (Next)
1. Set up Element/Matrix rooms for each building
2. Create room invite system (RSTU organizers manage access)
3. Embed Element widget on building pages
4. Create general RSTU organizing channel
5. Set up encrypted communications and security practices

**Timeline**: 1-2 weeks

**Security Considerations:**
- End-to-end encryption by default (Matrix protocol)
- Room moderation policies
- Organizer training on security best practices
- Private room vs. public room strategy

---

### Phase 4: Campaign Dashboard (Future)
1. Member authentication (email verification initially)
2. Personal dashboard showing active campaigns
3. Task assignment and tracking system
4. Building committee coordination tools
5. Campaign victory documentation and archival

**Timeline**: 4-6 weeks

**Authentication Strategy:**
- Phase 4a: Email verification (simple, secure)
- Phase 4b: Progressive authentication (time-based access tiers)
- Phase 4c: Advanced security (verified organizer tiers, Tor support)

---

## Legal Partner Integration

### Corrected Links (Phase 1)
- **Northern Nevada Legal Aid**: https://www.nnlegalaid.org/contact-us
  - Phone: (775) 284-5005
  - Services: Free legal assistance for low-income tenants

- **Clark County Civil Self-Help Law Center**: https://clarkcountycourts.us/self-help-center/
  - Services: Self-help forms and court navigation assistance

### Future Integration (Phase 4+)
- Direct referral system (track which tenants get legal help)
- Legal resource library (case law, sample documents)
- Attorney consultation scheduling (if partners agree)

---

## Success Metrics

### Phase 1 (Site Repositioning)
- ✅ No duplicate content with main RSTU site
- ✅ Clear positioning as member coordination hub
- ✅ 3 example buildings with chat integration planned
- ✅ Organizing toolkit with 10+ templates

### Phase 2 (Property Database)
- Property search functional (goal: 10,000+ searchable)
- Corporate landlord intelligence accessible
- "Find other tenants with same landlord" feature working

### Phase 3 (Chat Integration)
- 5+ active building chat rooms
- 100+ members using platform for coordination

### Phase 4 (Campaign Dashboard)
- Member authentication working
- 50%+ of organizing buildings using platform
- Campaign victory tracking showing real wins

---

## Implementation Notes

### What Changed in Phase 1
1. **Homepage redesign**: From "three pathways" to "building chat hub"
2. **Navigation simplification**: /blog → removed, /resources → /toolkit
3. **Positioning banner**: Amber banner clearly distinguishes from main site
4. **Resources overhaul**: Went from 6 resource links to 10 organizing tools
5. **Legal partner correction**: Updated to correct website URLs

### What Stayed the Same
- /properties page (now called /buildings) - still shows active campaigns
- /get-started guide (still 5-step organizing process)
- /help page (still for housing crisis situations)
- /join page (still recruits organizers)
- Google Form integration for interest signups
- Overall RSTU branding and visual identity

### Browser Cache Note
**Important**: First visit to updated site may show cached version. Visitors should hard refresh (Ctrl+Shift+R on Windows/Linux, Cmd+Shift+R on Mac) to see new content.

---

## Decision Log

### Why No Blog on RSTU Connect?
- Main site actively maintains regular blog
- Duplication creates confusion about where to find information
- RSTU Connect is operational tool, not news outlet
- Resources better served from single authoritative source

### Why These Specific Legal Partners?
- Northern Nevada Legal Aid: Serves Reno/Sparks area, specializes in tenant defense
- Civil Self-Help Law Center: Clark County court resource (includes Reno area courts)
- Both provide free or low-cost assistance specifically for tenants

### Why Property Database on Static Site?
- Static site limitation: Can't make live API calls
- Solution: Client-side search using pre-generated JSON or pre-built HTML pages
- Benefit: No backend needed, faster than API calls, privacy-preserving (no tracking)
- Scalability: Can generate 192K property pages statically if needed

### Why Matrix/Element for Chat?
- End-to-end encrypted by default (security for organizing)
- Decentralized (not dependent on single company)
- Open source (community control of infrastructure)
- Supports organizing across distributed buildings
- Federated (can connect to other organizing networks)

---

## Security Considerations

### Current (Phase 1)
- Public site (no authentication)
- Data available: Building addresses, organizing status, legal partner info
- No sensitive member information exposed

### Future (Phase 3-4)
- Matrix channels will require invite (RSTU organizer-controlled)
- Dashboard authentication to protect campaign status
- Progressive access tiers for advanced intelligence features
- Security training for organizers on digital security best practices

---

## Next Steps

1. **Immediately**:
   - Note: Site is live at neocities URL
   - Update main RSTU site with link to RSTU Connect
   - Share with organizers that organizing toolkit is available

2. **This week**:
   - Get feedback from organizers on toolkit content
   - Identify any additional templates needed
   - Prepare property database implementation

3. **Next week**:
   - Begin Phase 2: Property database search
   - Set up Matrix/Element rooms for buildings
   - Prepare Phase 3: Chat widget integration

4. **December**:
   - Launch property database with address search
   - Launch Matrix chat integration
   - Begin planning Phase 4: Dashboard

---

## Questions & Contact

For questions about RSTU Connect strategy:
- Site operations: renotenantsunion@gmail.com
- Technical implementation: See PROPERTY_DATABASE_IMPLEMENTATION.md and MATRIX_INTEGRATION_GUIDE.md

