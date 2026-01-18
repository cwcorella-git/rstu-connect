# RSTU Connect Site Analysis

**Date:** December 17, 2025
**URL:** https://rstu-connect.neocities.org/ (iframes from https://cwcorella-git.github.io/rstu-connect/)

---

## Current State Summary

### Architecture
- **Hosting**: Neocities serves a wrapper page with an iframe
- **Actual App**: Hosted on GitHub Pages at `cwcorella-git.github.io/rstu-connect`
- **Framework**: Next.js with Tailwind CSS
- **Chat**: Gun.js P2P real-time messaging

### Current Features
1. **Building Directory** - 15 buildings listed with:
   - Address
   - Unit count
   - Owner/landlord name
   - "Organizing" status badge

2. **Per-Building Chat** - Real-time P2P messaging:
   - No login required
   - Username saved locally
   - Messages sync via Gun.js relay

3. **Navigation** - Header with:
   - Organize (tab/button)
   - Reading (tab/button)
   - Get Involved (external Google Form link)
   - Main site (external link to renosparkstenantsunion.org)

4. **Building Info** - "Show building info" button (functionality unclear from static view)

---

## Layout Analysis

### Desktop (1440px)
```
┌─────────────────────────────────────────────────────────────────────┐
│  RSTU Connect          Organize  Reading  Get Involved  Main site  │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌────────────────────────────────────────┐   │
│  │ Search...       │  │ 2500 E 2ND ST, RENO, NV 89502         │   │
│  │ 15 buildings    │  │ Real-time organizing chat • No login  │   │
│  │                 │  │                                        │   │
│  │ ▌2500 E 2ND ST  │  │    ● Connecting...    [Show info]     │   │
│  │   Organizing    │  │                                        │   │
│  │                 │  │                                        │   │
│  │ 500 WEST ST     │  │        No messages yet                 │   │
│  │   Organizing    │  │                                        │   │
│  │                 │  │                                        │   │
│  │ 130 W 6TH ST    │  │                                        │   │
│  │   Organizing    │  │ ┌────────────────────────────────────┐│   │
│  │                 │  │ │ Your Name (saved locally)          ││   │
│  │ ...             │  │ │ [Enter name...        ] [Set Name] ││   │
│  │                 │  │ │ [Type a message...    ] [Send]     ││   │
│  └─────────────────┘  └────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────┤
│                RSTU Main Site · Contact · © 2025                    │
└─────────────────────────────────────────────────────────────────────┘

Left column: ~40% width (w-2/5)
Right column: ~60% width (w-3/5)
```

### Mobile (390px) - BROKEN
- Two columns remain side-by-side instead of stacking
- Content is cramped and truncated
- Horizontal scrollbar appears
- "Show building info" button overlaps content
- Search input is cut off

---

## Issues Identified

### Critical Issues

#### 1. Mobile Layout Broken
- **Problem**: Flex columns don't stack on mobile
- **Impact**: Unusable on phones (primary use case for field organizers)
- **Fix**: Add responsive breakpoints (`md:flex-row flex-col`)

#### 2. No Clear Navigation Structure
- **Problem**: "Organize" and "Reading" tabs exist but purpose unclear
- **Impact**: Users don't know what content is available
- **Fix**: Clear tab content or convert to page navigation

### UX Issues

#### 3. Building Selection Unclear
- **Problem**: Only visual indicator is red left border
- **Impact**: Easy to miss which building is selected
- **Fix**: More prominent selection state, background color change

#### 4. Chat Status Confusion
- **Problem**: "Connecting..." state with gray dot unclear
- **Impact**: Users unsure if chat is working
- **Fix**: Clearer loading states, connection status messages

#### 5. No Onboarding
- **Problem**: New users land on chat with no context
- **Impact**: Confusion about purpose, how to participate
- **Fix**: Welcome message, quick guide, or onboarding modal

#### 6. Building Info Hidden
- **Problem**: "Show building info" button purpose unclear
- **Impact**: Important landlord info may be missed
- **Fix**: Default to showing key info, or make button more prominent

### Missing Foundational Elements

#### 7. No Home/Dashboard
- Current: Jumps straight into building list + chat
- Needed: Central hub showing activity, events, quick actions

#### 8. No User Profile
- Current: Only username stored locally
- Needed: Way to set preferences, view activity, manage identity

#### 9. No Navigation Hierarchy
- Current: Flat structure with tabs
- Needed: Clear information architecture for features

---

## Recommendations for Feature Integration

### Navigation Architecture

Proposed navigation structure to support new features:

```
┌─────────────────────────────────────────────────────────────────────┐
│  RSTU Connect    [Buildings ▼]  [Resources ▼]  [Events]  [≡ Menu]  │
└─────────────────────────────────────────────────────────────────────┘

Buildings dropdown:
├── Building Directory (current view)
├── Building Map
└── Add a Building

Resources dropdown:
├── Know Your Rights
├── Organizing Playbook
├── Landlord Lookup
└── Document Templates

Events:
├── Upcoming Events
├── Meeting Calendar
└── Past Events

Menu (hamburger):
├── My Profile
├── My Activity
├── Mutual Aid
├── Report an Issue
├── Settings
└── About RSTU
```

### Page/View Structure

Instead of tabs, use distinct views with URL routing:

```
/                     → Dashboard/Home
/buildings            → Building directory + chat (current)
/buildings/[slug]     → Single building detail + chat
/resources            → Resource library
/resources/rights     → Know Your Rights
/events               → Event calendar
/events/[id]          → Single event detail
/mutual-aid           → Needs/offers board
/report               → Report complaint/issue
/profile              → User profile (local storage based)
```

### Layout Options for New Features

#### Option A: Sidebar Navigation
```
┌────┬──────────────────────────────────────────────────────┐
│    │  [Current page content]                              │
│ ☰  │                                                      │
│    │                                                      │
│ 🏠 │                                                      │
│ 🏢 │                                                      │
│ 📚 │                                                      │
│ 📅 │                                                      │
│ 🤝 │                                                      │
│ ⚙️ │                                                      │
│    │                                                      │
└────┴──────────────────────────────────────────────────────┘
```
- Collapsible icon sidebar (40px collapsed, 200px expanded)
- Works well on desktop, collapses to bottom nav on mobile

#### Option B: Top Navigation with Tabs
```
┌─────────────────────────────────────────────────────────────────────┐
│  RSTU Connect                                              [≡]     │
├─────────────────────────────────────────────────────────────────────┤
│  [Buildings]  [Resources]  [Events]  [Mutual Aid]  [Report]        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│                     [Page content]                                  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```
- Familiar horizontal tabs
- Mobile: becomes hamburger menu or bottom tabs

#### Option C: Hub-and-Spoke (Recommended)
```
Dashboard (Hub):
┌─────────────────────────────────────────────────────────────────────┐
│  RSTU Connect                                        [👤] [⚙️]     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │
│  │ 🏢 Buildings │  │ 📅 Events   │  │ 🤝 Mutual   │                 │
│  │ 15 active   │  │ 2 upcoming  │  │ Aid         │                 │
│  └─────────────┘  └─────────────┘  └─────────────┘                 │
│                                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │
│  │ 📚 Resources│  │ ⚠️ Report   │  │ 📊 Activity │                 │
│  │ Rights &    │  │ Issue       │  │ Feed        │                 │
│  │ Guides      │  │             │  │             │                 │
│  └─────────────┘  └─────────────┘  └─────────────┘                 │
│                                                                     │
│  Recent Activity                                                    │
│  ─────────────────────────────────────────────────────             │
│  • New message in 2500 E 2ND ST chat (2 min ago)                   │
│  • Event: Tabling at Farmer's Market (Tomorrow)                    │
│  • Mutual Aid: Moving help needed - Downtown                       │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```
- Home dashboard as central hub
- Cards link to feature areas
- Activity feed shows recent happenings
- Mobile: Cards stack vertically

---

## Implementation Priority

### Phase 1: Fix Critical Issues (Immediate)
1. **Fix mobile responsive layout**
   - Add `flex-col md:flex-row` to main container
   - Stack building list above chat on mobile
   - Or: Add toggle to switch between list and chat on mobile

2. **Clarify navigation**
   - Make Organize/Reading tabs functional or remove
   - Add clear labels

### Phase 2: Add Dashboard & Navigation (Week 1-2)
1. Create home dashboard with feature cards
2. Implement basic routing for views
3. Add profile/settings area (local storage)

### Phase 3: Core Features (Week 3-4)
1. Events page (simple list, can use Gun.js)
2. Resources page (static content)
3. Mutual Aid board (Gun.js powered)

### Phase 4: Organizing Features (Week 5-6)
1. Complaint reporting form
2. Building info detail view
3. Activity tracking

---

## Technical Considerations

### Routing on Static Site
Since it's a static export, use hash-based routing or query params:
```
/#/buildings
/#/events
/#/resources
?view=buildings
?view=events
```

Or leverage Next.js static generation with `getStaticPaths` for known routes.

### State Management
Current: Component state + Gun.js
Recommended:
- Local state for UI
- Gun.js for shared/synced data
- localStorage for user preferences

### Data Storage Strategy
```
localStorage:
├── username
├── preferences (theme, language)
├── viewed buildings
└── activity history

Gun.js:
├── chat messages per building
├── events (shared)
├── mutual aid posts
├── activity feed
└── building status
```

---

## Mobile-First Redesign Suggestion

Given that field organizers are the primary users, consider mobile-first:

```
Mobile Navigation (Bottom):
┌─────────────────────────────────────────────────────────────────────┐
│  [Page content fills screen]                                        │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│    🏠      🏢       📅       🤝       ≡                             │
│   Home  Buildings Events   Aid    More                              │
└─────────────────────────────────────────────────────────────────────┘
```

Buildings view on mobile:
```
┌─────────────────────────────────────────────────────────────────────┐
│  ← Buildings           [🔍] [≡]                                     │
├─────────────────────────────────────────────────────────────────────┤
│  [List] [Chat] tabs                                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  When "List" tab active:                                           │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Search buildings...                                          │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │ 2500 E 2ND ST                           [Organizing]        │   │
│  │ 1495 units • GAGE VILLAGE...                                 │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │ 500 WEST ST                             [Organizing]        │   │
│  │ 906 units • CCR NEWCO LLC                                   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  When "Chat" tab active:                                           │
│  [Full screen chat for selected building]                          │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│    🏠      🏢       📅       🤝       ≡                             │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Summary

The current site has a solid foundation:
- Clean visual design with RSTU branding
- Working Gun.js P2P chat
- Building directory with key info

Key improvements needed:
1. **Fix mobile layout** (critical)
2. **Add navigation structure** for features
3. **Create dashboard** as home base
4. **Implement feature views** incrementally

The architecture (Next.js + Gun.js + static hosting) can support all proposed features from FEATURE_IDEAS.md with careful planning.
