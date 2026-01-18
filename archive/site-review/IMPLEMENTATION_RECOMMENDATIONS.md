# RSTU Connect: Implementation Recommendations

**Based on site analysis and FEATURE_IDEAS.md**
**Date:** December 17, 2025

---

## Executive Summary

The current site has a solid foundation with:
- Working Gun.js P2P chat per building
- Clean visual design with RSTU branding
- Two-tab system (Organize/Reading) with good content structure
- 15 buildings with metadata

**Critical issue:** Mobile layout is broken (fixed widths don't respond)

**Key opportunity:** The architecture can support new features with careful design

---

## Current Architecture

```
src/
├── app/
│   └── page.tsx          # Main page with tab switching
├── components/
│   ├── ClientLayout.tsx  # Header/footer wrapper
│   ├── Navigation.tsx    # Tab navigation (Organize/Reading)
│   ├── BuildingList.tsx  # Left sidebar (w-2/5 - NOT responsive)
│   ├── BuildingCard.tsx  # Individual building card
│   ├── BuildingChatEmbed.tsx  # Chat wrapper
│   ├── BuildingMetadata.tsx   # Building info overlay
│   ├── GunChat/
│   │   ├── MessageList.tsx
│   │   └── MessageInput.tsx
│   └── Reading/
│       ├── ReadingList.tsx
│       ├── ReadingContent.tsx
│       └── ...
├── contexts/
│   └── TabContext.tsx    # Tab state management
├── lib/
│   ├── gun.ts            # Gun.js initialization
│   └── ...
└── hooks/
    └── useGunChat.ts     # Gun.js chat hook
```

### Tab System

Current tabs via `TabContext`:
- `home` → Building list + chat (Organize button)
- `reading` → Document library

---

## Priority 1: Fix Mobile Layout (Critical)

### Problem
```tsx
// BuildingList.tsx line 28
<div className="w-2/5 ...">  // Fixed 40% width on ALL screen sizes

// page.tsx line 356
<div className="w-3/5 ...">  // Fixed 60% width on ALL screen sizes
```

### Solution

Change from fixed widths to responsive:

```tsx
// BuildingList.tsx
<div className="w-full md:w-2/5 ...">

// page.tsx - home view
<div className="flex flex-col md:flex-row h-screen" ...>
  <BuildingList ... />
  <div className="w-full md:w-3/5 ...">
```

### Mobile View Options

**Option A: Stacked Layout**
- Building list on top, chat below
- Scroll between them
- Simple but requires scrolling

**Option B: Tab Toggle (Recommended)**
- Toggle button: [List] [Chat]
- Only show one at a time on mobile
- Better UX for field organizers

```tsx
// Mobile toggle approach
const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');

// In render:
<div className="md:hidden flex border-b">
  <button onClick={() => setMobileView('list')}>List</button>
  <button onClick={() => setMobileView('chat')}>Chat</button>
</div>

<div className={`md:block ${mobileView === 'list' ? 'block' : 'hidden'}`}>
  <BuildingList />
</div>

<div className={`md:block ${mobileView === 'chat' ? 'block' : 'hidden'}`}>
  <BuildingChatEmbed />
</div>
```

---

## Priority 2: Navigation Restructure

### Current State
```
[Organize] [Reading] [Get Involved↗] [Main site↗]
    ↓          ↓
  Buildings   Documents
  + Chat      Library
```

### Proposed Structure

**Phase 1: Clarify existing**
```
[Buildings] [Reading] [Get Involved↗] [Main site↗]
```

**Phase 2: Add features**
```
[Buildings] [Resources ▼] [Events] [More ▼]
                |                      |
           - Reading              - Mutual Aid
           - Know Your Rights     - Report Issue
           - Templates            - About
```

**Phase 3: Full navigation**
```
[Home] [Buildings] [Events] [Resources] [Aid] [≡]
```

### Implementation

Extend TabContext or use Next.js routing:

```tsx
// Option A: Extend TabContext
type Tab = 'home' | 'buildings' | 'reading' | 'events' | 'aid' | 'report';

// Option B: Use query params for static export
// /?view=buildings
// /?view=events
// /?view=reading&doc=tenant-rights

// Option C: Hash routing
// /#/buildings
// /#/events
```

---

## Priority 3: Dashboard/Home View

### Concept

Transform the landing experience from "buildings + chat" to a hub:

```
┌─────────────────────────────────────────────────────────────────┐
│  RSTU Connect                                        [Profile]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Welcome to RSTU Connect                                        │
│  Organizing tools for Reno-Sparks tenants                      │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  🏢          │  │  📅          │  │  📚          │          │
│  │  Buildings   │  │  Events      │  │  Resources   │          │
│  │  15 listed   │  │  2 upcoming  │  │  Rights &    │          │
│  │              │  │              │  │  Guides      │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  🤝          │  │  ⚠️          │  │  💬          │          │
│  │  Mutual Aid  │  │  Report      │  │  Recent      │          │
│  │  Needs &     │  │  Issue       │  │  Activity    │          │
│  │  Offers      │  │              │  │              │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                 │
│  Recent Activity                                                │
│  • Message in 2500 E 2ND ST (2m ago)                           │
│  • New document: Rent Strike Guide                             │
│  • Mutual aid request: Moving help needed                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Implementation

```tsx
// src/components/Dashboard.tsx
export function Dashboard() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Welcome to RSTU Connect</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <DashboardCard
          icon="🏢"
          title="Buildings"
          subtitle="15 listed"
          onClick={() => setActiveTab('buildings')}
        />
        <DashboardCard
          icon="📅"
          title="Events"
          subtitle="2 upcoming"
          onClick={() => setActiveTab('events')}
        />
        {/* ... */}
      </div>

      <RecentActivityFeed />
    </div>
  );
}
```

---

## Priority 4: Events System

### Data Model (Gun.js)

```typescript
interface Event {
  id: string;
  title: string;
  description: string;
  date: string;  // ISO date
  time: string;
  location: string;
  virtualLink?: string;
  type: 'meeting' | 'action' | 'workshop' | 'tabling' | 'other';
  rsvps: string[];  // usernames
  createdBy: string;
  createdAt: number;
}

// Gun.js path: rstu/events/{eventId}
```

### UI

```
┌─────────────────────────────────────────────────────────────────┐
│  Upcoming Events                            [+ Add Event]       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 📅 Dec 22 • 10am                               TABLING   │   │
│  │ Farmer's Market Outreach                                 │   │
│  │ Victorian Square, Sparks                                 │   │
│  │                                                          │   │
│  │ [RSVP: 3 going]                           [Details →]   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 📅 Jan 8 • 6pm                              MEETING     │   │
│  │ January General Meeting                                  │   │
│  │ Hybrid: TBD + Zoom                                       │   │
│  │                                                          │   │
│  │ [RSVP: 5 going]                           [Details →]   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Priority 5: Mutual Aid Board

### Data Model (Gun.js)

```typescript
interface MutualAidPost {
  id: string;
  type: 'need' | 'offer';
  category: 'rent' | 'moving' | 'food' | 'transport' | 'legal' | 'other';
  title: string;
  description: string;
  location?: string;  // neighborhood
  contact?: string;   // optional
  anonymous: boolean;
  postedBy: string;   // username if not anonymous
  postedAt: number;
  status: 'open' | 'fulfilled' | 'expired';
  expiresAt: number;  // auto-expire after 30 days
}

// Gun.js path: rstu/aid/{postId}
```

### UI

```
┌─────────────────────────────────────────────────────────────────┐
│  Mutual Aid                    [Post Need] [Post Offer]         │
├─────────────────────────────────────────────────────────────────┤
│  [All] [Needs] [Offers]     Filter: [All categories ▼]         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  NEED • Moving help                              3 days ago    │
│  Need 2 people with truck to move couch. Can pay gas.          │
│  📍 Midtown                                        [Respond]   │
│                                                                 │
│  ─────────────────────────────────────────────────────────     │
│                                                                 │
│  OFFER • Legal clinic referrals                  1 week ago    │
│  I have contacts at NNLA, can help connect tenants.            │
│  By: Maria                                        [Request]    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Priority 6: Report/Complaint System

### Data Model (Gun.js + Optional Local)

```typescript
interface Complaint {
  id: string;
  category: 'maintenance' | 'rent' | 'harassment' | 'eviction' | 'other';
  buildingAddress?: string;
  landlord?: string;
  description: string;
  dateOccurred?: string;
  anonymous: boolean;
  reportedBy?: string;
  reportedAt: number;
  // Evidence stored separately or as references
}

// Gun.js path: rstu/complaints/{complaintId}
// Or: Keep local only with optional share
```

### UI

Simple form with categories, description, optional building selection.

---

## Gun.js Data Architecture

### Current
```
rstu/
└── chat/
    └── {buildingSlug}/
        └── messages/
            └── {messageId}
```

### Proposed Extension
```
rstu/
├── chat/
│   └── {buildingSlug}/
│       └── messages/
├── events/
│   └── {eventId}
├── aid/
│   └── {postId}
├── complaints/
│   └── {complaintId}
├── activity/
│   └── feed/
│       └── {activityId}
└── users/
    └── {username}/
        └── profile
```

---

## Component Architecture

### Proposed New Components

```
src/components/
├── Dashboard/
│   ├── Dashboard.tsx
│   ├── DashboardCard.tsx
│   └── ActivityFeed.tsx
├── Events/
│   ├── EventList.tsx
│   ├── EventCard.tsx
│   ├── EventDetail.tsx
│   └── EventForm.tsx
├── MutualAid/
│   ├── AidBoard.tsx
│   ├── AidPost.tsx
│   ├── AidForm.tsx
│   └── AidFilters.tsx
├── Report/
│   ├── ReportForm.tsx
│   └── ComplaintCategories.tsx
├── Profile/
│   ├── UserProfile.tsx
│   └── ActivityHistory.tsx
└── shared/
    ├── BottomNav.tsx      # Mobile navigation
    ├── ResponsiveLayout.tsx
    └── LoadingState.tsx
```

---

## Implementation Phases

### Phase 1: Foundation (1-2 days)
- [ ] Fix mobile responsive layout
- [ ] Add mobile view toggle for buildings
- [ ] Test on actual mobile devices

### Phase 2: Navigation (2-3 days)
- [ ] Restructure navigation component
- [ ] Add route handling (query params or hash)
- [ ] Create Dashboard component
- [ ] Add feature cards

### Phase 3: Events (3-4 days)
- [ ] Create Event data model in Gun.js
- [ ] Build EventList component
- [ ] Build EventForm component
- [ ] Add RSVP functionality
- [ ] Add ICS export for calendar

### Phase 4: Mutual Aid (3-4 days)
- [ ] Create Aid data model in Gun.js
- [ ] Build AidBoard component
- [ ] Build AidForm component
- [ ] Add filtering and categories
- [ ] Implement expiration

### Phase 5: Profile & Activity (2-3 days)
- [ ] Create user profile storage
- [ ] Build activity feed
- [ ] Track user actions
- [ ] Add preferences

### Phase 6: Reporting (2-3 days)
- [ ] Create complaint form
- [ ] Add building selection
- [ ] Implement categories
- [ ] Optional: aggregate by landlord

---

## Mobile Navigation Recommendation

### Bottom Tab Bar

```tsx
// src/components/shared/BottomNav.tsx
export function BottomNav() {
  const { activeTab, setActiveTab } = useTab();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2 z-50">
      <NavItem icon="🏠" label="Home" tab="home" active={activeTab === 'home'} />
      <NavItem icon="🏢" label="Buildings" tab="buildings" active={activeTab === 'buildings'} />
      <NavItem icon="📅" label="Events" tab="events" active={activeTab === 'events'} />
      <NavItem icon="🤝" label="Aid" tab="aid" active={activeTab === 'aid'} />
      <NavItem icon="≡" label="More" tab="more" active={activeTab === 'more'} />
    </nav>
  );
}
```

Add to ClientLayout:

```tsx
<main className="min-h-screen flex flex-col pb-16 md:pb-0">
  {/* ... */}
</main>
<BottomNav />
```

---

## Summary

1. **Immediate**: Fix mobile layout (few hours)
2. **This week**: Add dashboard + navigation structure
3. **Next week**: Events system
4. **Following week**: Mutual aid board
5. **Ongoing**: Profile, reporting, refinements

The existing architecture is solid. Gun.js can handle all the new data needs. The main work is:
- Responsive CSS fixes
- New React components
- Gun.js data models
- UI polish

All achievable within the static site constraints.
