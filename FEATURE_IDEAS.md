# Feature Ideas & Roadmap

## Current Status

### Completed Features
- Property directory (16,127 rentals from 192,463 parcels)
- Property search with Supabase FTS + inverted index fallback
- Building-specific chat (Socket.io real-time)
- Meeting suggestions with voting → auto-event creation
- Events calendar with RSVP and Heroicons
- Canvassing tools (unit tracker, 32-field intake form)
- Rent fairness dashboard (vs FMR, building avg, age-adjusted)
- Lease tracker
- Document library (~858 organizing resources)
- Role-based profiles (tenant/organizer/admin) with invite codes
- User list for organizers/admins
- Linked properties (multi-parcel grouping)
- Property badges (owner type, management company, portfolio)
- Building organizing status

---

## In Development

### Complaint Pattern Detection
Identify buildings with shared issues across tenants.
- Aggregate complaint data from canvassing
- Surface common problems (maintenance, rent increases, harassment)
- Flag buildings with high complaint density
- Cross-landlord analysis (same issues across portfolio)

### Demand Builder
Templates for collective action.
- Pre-written demand letters (rent reduction, repairs, etc.)
- Customizable templates with building/landlord fields
- PDF export for printing
- Track which demands have been sent

### Strike Coordination Dashboard
Central view for active campaigns.
- Building-by-building strike status
- Rent withheld totals
- Timeline of actions
- Victory tracking

---

## High Priority Features

### Rent Increase Tracker
Log and visualize rent increase history.
- Per-unit increase history with dates
- Building-wide increase patterns
- Compare to CPI/inflation
- Alert when increases exceed guidelines
- Export for legal/media use

### Issue Voting in Chat
Surface common problems through tenant voting.
- Tenants propose issues in building chat
- Up/down voting on issues
- High-vote issues escalate to building demands
- Track issue resolution

### Building Organizing Score
Visual indicator of organizing readiness.
- % of units contacted
- % interested in organizing
- Active member count
- Strike-readiness indicator (threshold-based)
- Compare buildings for prioritization

### Victory Archive
Document and share wins.
- Rent reductions secured ($ amounts)
- Repairs completed
- Evictions stopped
- Timeline and tactics used
- Searchable by landlord/building

### Push Notifications
Alert tenants to important updates.
- New messages in building chat
- Upcoming events/meetings
- Vote thresholds reached
- Demand responses received

---

## Medium Priority Features

### Direct Messaging
Private organizer-to-tenant communication.
- 1:1 messaging between organizers and tenants
- Contact history
- Follow-up reminders
- Privacy controls

### Multilingual UI
Expand accessibility.
- Spanish translation (priority - large Reno population)
- Language selector in profile
- Translated document library subset
- RTL support infrastructure

### Print Canvass Sheets
Offline door-knocking support.
- Generate printable sheets per building
- QR codes linking to digital intake
- Offline data entry sync
- Route optimization suggestions

### Building Announcements
Organizer broadcasts to building tenants.
- Push notification to all building members
- Pinned messages in chat
- Announcement history
- Read receipts (optional)

### Landlord/Property Management Ratings
Tenant-sourced accountability.
- Rate responsiveness, maintenance, communication
- Aggregate scores per landlord
- Compare across portfolio
- Flag patterns of neglect

---

## Lower Priority Features

### PWA Install Prompt
Improve mobile experience.
- "Add to home screen" prompt
- App-like experience
- Faster load times
- Offline capability indicator

### Offline Mode Improvements
Queue actions when disconnected.
- Local-first data storage
- Sync queue for pending actions
- Conflict resolution
- Clear sync status indicator

### Admin Analytics Dashboard
Metrics for organizing leadership.
- Total users by role
- Active buildings
- Canvassing progress
- Event attendance rates
- Growth over time

### Code Violation Integration
Pull from city databases.
- Washoe County code violations
- Link to properties
- Track resolution
- Evidence for demands

### Eviction Early Warning
Monitor court filings.
- Washoe County court records
- Alert affected buildings
- Rapid response coordination
- Legal resource connection

---

## Technical Debt

### Test Coverage
- Unit tests for critical functions
- Integration tests for auth flow
- E2E tests for core user journeys

### Error Boundaries
- Graceful failure handling
- User-friendly error messages
- Error reporting to admins

### Accessibility Audit
- Screen reader compatibility
- Keyboard navigation
- Color contrast verification
- ARIA labels

### Performance Monitoring
- Core Web Vitals tracking
- Error rate monitoring
- API latency tracking

---

## Future Expansion

### Las Vegas Market
Expand to Clark County.
- 680,000+ properties
- Separate database
- Local organizing partnerships
- Shared platform infrastructure

### Statewide Coordination
Connect Nevada tenant unions.
- Cross-city campaign coordination
- Shared resources/documents
- State-level policy tracking
- Joint actions

---

## Success Metrics

**What we measure:**
| Metric | Why |
|--------|-----|
| Rent reduced via strikes ($) | Material wins |
| Repairs secured (#) | Living conditions improved |
| Evictions stopped (#) | Displacement prevented |
| Buildings organized (#) | Geographic coverage |
| Strike participation rate (%) | Collective power |

**What we don't measure:**
| Metric | Why it's misleading |
|--------|---------------------|
| Social media followers | Don't show up to strikes |
| Website traffic | Pageviews ≠ organizing |
| Email list size | Unopened emails don't help |

---

*"Every feature exists to answer one question: Does this help us win a rent strike?"*
