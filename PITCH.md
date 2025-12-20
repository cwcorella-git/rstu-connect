# RSTU Connect: Tenant Organizing Platform
## A Technical Pitch Document

---

## Executive Summary

RSTU Connect is a mobile-first web application designed to empower tenant organizing in Washoe County. It combines property intelligence, secure peer-to-peer communication, and field canvassing tools into a single platform that puts organizing power directly in tenants' hands.

**Live Demo:** https://cwcorella-git.github.io/rstu-connect/

---

## What's Built (Current Features)

### 1. Property Intelligence Database
- **14,158 properties** (multi-unit + LLC single-family rentals)
- **365 properties with marketing names** (The Vintage, Sierra Vista, etc.)
- Data includes: owner, units, year built, assessed value, cost/unit, zoning, GPS coordinates

### 2. Interactive 3D Map
- MapLibre GL JS visualization with all properties plotted
- Click any building for details, 3D pitch/rotation

### 3. Decentralized Chat (Gun.js P2P)
- Per-building chat rooms, no central server to censor
- Anonymous, real-time, offline-capable

### 4. Profile System + Invite Codes
- Roles: Tenant, Organizer, Admin
- QR code invites for field onboarding
- Cross-device sync via relay server

### 5. Canvassing Tools
- Unit-by-unit tracking (contact status, tenant info, issues)
- Organizer notes, export/import data

### 6. Document Library
- 857 documents, 7 categories, admin controls

---

## Planned Features (Not Yet Implemented)

- [ ] **Favorite Properties** - Save buildings of interest
- [ ] **Rent Comparison Dashboard** - Size vs. price, quality ratings
- [ ] **Organizer/Admin invites** - Currently tenant-only
- [ ] **50,000+ additional properties** - Full county dataset
- [ ] **250,000 single-family homes** - Grouped by proximity
- [ ] **Corporate landlord mapping** - Connect properties by ownership
- [ ] **Democratic moderation** - Community voting for bans
- [ ] **Anonymous data aggregation** - Building averages, issue heatmaps

---

## Technical Stack

**Frontend:** Next.js 14, TypeScript, Tailwind, MapLibre GL JS
**Backend:** Gun.js (P2P), Socket.IO relay (Render.com), SQLite (build-time)
**Hosting:** GitHub Pages (free), GitHub Actions CI/CD

---

## Why This Matters

- **Decentralized** - Can't be shut down
- **Free** - No hosting costs
- **Field-ready** - Built for door-knocking
- **Privacy-first** - Tenants control their data

---

*"Homes for People, Not for Profit"*
