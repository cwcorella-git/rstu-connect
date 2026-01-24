# RSTU Connect - Reno-Sparks Tenants Union Organizing Platform

**Live Site:** https://rstu-connect.neocities.org (via GitHub Pages)
**GitHub Pages:** https://cwcorella-git.github.io/rstu-connect/
**Main Organization:** https://renosparkstenantsunion.org

This repository contains the web platform for the Reno-Sparks Tenants Union (RSTU), Nevada's first tenants union.

**Mission:** "Homes for People, Not for Profit" - Organizing for tenant power, one building at a time.

---

## Features

### 🏢 Organize Tab
- **Building Directory:** 16,000+ searchable rental properties in Washoe County
- **Property Cards:** Owner info, units, value, organizing status, management company badges
- **Building Chat Rooms:** Real-time Socket.io chat for tenant coordination
- **Events Calendar:** RSVP-enabled events (meetings, actions, workshops, socials)
- **3D Property Map:** Interactive Mapbox visualization with neighboring buildings
- **Sorting & Filtering:** 13 sort options, 9 filter presets (corporate-owned, violations, evictions, etc.)
- **Organizing Progress:** Unit tracker badges showing tenant outreach status

### 📚 Reading Library (~2,900 Documents)
- **Comprehensive Collection:** Tenant organizing guides, labor union resources, political theory
- **20 Categories:** Classic theory, contemporary analysis, housing/rent, labor unions, organizing action, and more
- **Search & Filter:** Full-text search across titles and excerpts
- **Reading Progress:** Automatic bookmark and scroll position saving
- **Favorites:** Star documents to keep them at the top
- **Admin Panel:** Edit titles, hide/show documents (Ctrl+Shift+A)

### 🤝 Mutual Aid Tab
- **Needs & Offers:** Post and browse community requests/resources
- **Skills Directory:** Connect tenants with useful skills
- **Resource Library:** Shared community resources
- **Blocks:** Linked property groups with shared governance

### 🛠️ Tools Tab
- **Unit Tracker:** Door-to-door canvassing with tenant intake forms
- **Canvassing Mode:** Mobile-friendly field organizer interface
- **Power Map:** Relationship mapping for organizing targets
- **Campaigns:** Track organizing campaign progress
- **User Management:** Role-based access (organizer, steward, member)

### 👤 Profile Tab
- **User Profiles:** Display name, contact info, role badges
- **Rent Comparison:** Compare rent to area averages
- **Onboarding Wizard:** Guided profile setup for new users

### 🌐 Multilingual Support (5 Languages)
- **English** (en) - Default
- **Spanish** (es) - Español
- **Tagalog** (tl) - Filipino
- **Chinese** (zh) - 中文
- **Vietnamese** (vi) - Tiếng Việt

Language switcher in header with 938+ translated strings per locale.

---

## Technology Stack

### Frontend
- **Framework:** Next.js 14 App Router with static export
- **Language:** TypeScript
- **Styling:** Tailwind CSS (custom RSTU red theme: #cc0000)
- **State Management:** React Context + localStorage
- **Markdown Rendering:** react-markdown with gray-matter frontmatter parsing
- **Maps:** Mapbox GL JS with 3D building visualization
- **i18n:** Custom LanguageContext with 5 locales

### Chat System
- **Platform:** Socket.io server (self-hosted on Render)
- **Features:** Real-time messaging, server persistence, building-specific rooms
- **Server:** `rstu-gun-relay.onrender.com`

### Deployment
- **Hosting:** GitHub Pages (primary), Neocities iframe (legacy URL)
- **Method:** Next.js static export (SSG)
- **CI/CD:** GitHub Actions (automatic on push to main)
- **Build Time:** ~2 minutes
- **Output:** Pure static HTML/CSS/JS

### Data Storage
- **User Data:** localStorage (profiles, reading progress, favorites)
- **Cloud Sync:** Supabase (optional, for user profiles and admin state)
- **Documents:** Markdown files with YAML frontmatter
- **Properties:** SQLite database → JSON export at build time

---

## Repository Structure

```
rstu-connect/
├── src/                    # Next.js application source
│   ├── app/               # Pages and layouts
│   ├── components/        # React components
│   │   ├── BuildingList.tsx      # Property search/filter sidebar
│   │   ├── BuildingCard.tsx      # Property cards with badges
│   │   ├── PropertyView/         # Chat, Events, Map tabs
│   │   ├── Events/               # Calendar and event management
│   │   ├── SocketChat/           # Chat UI components
│   │   ├── Reading/              # Document library
│   │   ├── MutualAid/            # Needs, offers, skills, Blocks
│   │   ├── Tools/                # Organizer tools
│   │   └── Profile/              # User profiles, onboarding
│   ├── contexts/
│   │   ├── LanguageContext.tsx   # i18n with 5 locales
│   │   └── TabContext.tsx        # Global tab state
│   └── lib/                      # Utilities and storage
├── docs/                   # ~2,900 organizing documents (source)
├── data/                   # Property databases (not deployed)
│   └── databases/
│       ├── main_properties.db         # 192,463 properties
│       ├── landlord_accountability.db # Eviction records
│       └── organizing_targets.db      # Priority scores
├── public/                 # Static assets
│   └── data/              # Generated JSON (properties, manifest)
├── scripts/                # Build and data scripts
└── .github/workflows/      # CI/CD configuration
```

---

## Development

### Prerequisites
- Node.js 18+
- npm
- Python 3 (for property export script)

### Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
# Open http://localhost:3000

# Build static site (runs prebuild scripts automatically)
npm run build
# Output in out/ directory

# Run linter
npm run lint
```

### Adding New Documents

1. Add markdown files to `docs/{category}/` with YAML frontmatter:
   ```yaml
   ---
   title: "Document Title"
   author: "Author Name"
   date: 2025
   ---
   ```
2. Run `npm run build` to regenerate manifest
3. Push to main (auto-deploys via GitHub Actions)

### Fix Malformed Frontmatter

```bash
node scripts/fix-frontmatter.js
npm run build
```

---

## Key Design Decisions

### 1. Static Site Generation (SSG)
**Why:** Free hosting, no server costs, fast performance, simple deployment

### 2. Socket.io for Chat
**Why:** Real-time messaging, server persistence, building-specific rooms, mobile-friendly

### 3. localStorage + Supabase Hybrid
**Why:** Fast local performance with optional cloud sync for cross-device access

### 4. 5-Language i18n
**Why:** Serve diverse tenant communities in Reno-Sparks area

### 5. Property Intelligence
**Why:** Data-driven organizing with eviction records, corporate landlord tracking, priority scores

---

## Data & Intelligence Platform

### Property Database

The `data/` directory contains comprehensive property intelligence:
- **192,463 Washoe County property records**
- **16,127 rental properties** exported to JSON
- **7,500 eviction records** with landlord scorecards
- **48,593 corporate landlord entities**
- **Management company detection** (1,030 portfolios identified)

### Organizing Priority

Properties scored 0-10 based on:
- Unit count and density
- Corporate ownership
- Eviction history
- Code violations
- Habitability conditions (from canvass data)

---

## Deployment

### Automatic Deployment
Every push to `main` triggers:
1. GitHub Actions runs prebuild scripts + `npm run build`
2. Static files generated in `out/`
3. Deployed to GitHub Pages
4. Live at https://cwcorella-git.github.io/rstu-connect/

### Environment Variables
- `NEXT_PUBLIC_SOCKETIO_URL` - Socket.io server URL
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL (optional)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key (optional)

---

## Statistics

### Current Scale
- **Properties:** 16,127 rental units
- **Documents:** ~2,900 organizing resources
- **Categories:** 20 document categories
- **Languages:** 5 (EN, ES, TL, ZH, VI)
- **Translation Keys:** 938+ per locale
- **Build Time:** ~2 minutes
- **Bundle Size:** ~1.3 MB (first load)

---

## Contributing

This is an organizing platform for RSTU. To adapt for your tenant union:

1. **Fork the repository**
2. **Update property data** in `data/databases/`
3. **Replace documents** in `docs/` directory
4. **Update branding** (colors, organization name)
5. **Configure translations** in `src/contexts/LanguageContext.tsx`
6. **Deploy** to GitHub Pages or your preferred host

---

## License

This project is open source and available for use by tenant unions and housing justice organizations.

**Property Data:** Washoe County open data (public domain)
**Organizing Documents:** Various sources, see individual document attribution

---

## Contact & Support

**Organization:** Reno-Sparks Tenants Union
**Website:** https://renosparkstenantsunion.org
**Get Involved:** [Contact Form](https://docs.google.com/forms/d/e/1FAIpQLSc4Fgq0sW7BFHfFLDvM8NIUIKLtnkDTC9RwUQ1rLin8ZqyoSQ/viewform)

**Repository:** https://github.com/cwcorella-git/rstu-connect

---

## Acknowledgments

Built with:
- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Socket.io](https://socket.io/) - Real-time messaging
- [Mapbox GL JS](https://www.mapbox.com/) - Interactive maps
- [Supabase](https://supabase.com/) - Cloud database
- [react-markdown](https://github.com/remarkjs/react-markdown) - Markdown rendering

Organizing resources compiled from tenant organizing networks nationwide.

---

**"The platform serves organizing, organizing doesn't serve the platform."**

*Last Updated: January 2026*
