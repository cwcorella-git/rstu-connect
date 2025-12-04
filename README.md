# RSTU Connect - Reno-Sparks Tenants Union Organizing Platform

**Live Site:** https://rstu-connect.neocities.org
**Main Organization:** https://renosparkstenantsunion.org

This repository contains the web platform for the Reno-Sparks Tenants Union (RSTU), Nevada's first tenants union.

**Mission:** "Homes for People, Not for Profit" - Organizing for tenant power, one building at a time.

---

## Features

### 🏢 Organize Tab
- **Building Directory:** Searchable list of 15 largest apartment complexes in Reno-Sparks
- **Building Chat Rooms:** Anonymous, no-login chat via Tlk.io for tenant coordination
- **Property Information:** Owner, units, assessed value, year built, square footage
- **Resizable Panels:** Customize your view with adjustable sidebar width

### 📚 Reading Library (1,738 Documents)
- **Comprehensive Collection:** Tenant organizing guides, labor union resources, political theory
- **12 Categories:** Classic theory, contemporary analysis, historical movements, housing/rent, labor unions, organizing action, police enforcement, property/landlords, strikes, and more
- **Search & Filter:** Full-text search across titles and excerpts
- **Reading Progress:** Automatic bookmark and scroll position saving
- **Favorites:** Star documents to keep them at the top
- **Share Documents:** Copy links to specific documents

### 🔒 Admin Panel (Ctrl+Shift+A)
- **Document Curation:** Edit titles, hide/show documents, mark as deleted
- **Inline Controls:** Edit, hide, and delete buttons on each document card
- **localStorage Persistence:** All admin edits saved locally

---

## Technology Stack

### Frontend
- **Framework:** Next.js 14 App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS (custom RSTU red theme: #cc0000)
- **State Management:** React Context + localStorage
- **Markdown Rendering:** react-markdown with gray-matter frontmatter parsing

### Chat System
- **Platform:** Tlk.io embedded iframes
- **Features:** No login required, mobile-friendly, persistent message history
- **Why Tlk.io:** Zero friction for tenants, free unlimited rooms, no CSRF/auth issues

### Deployment
- **Hosting:** Neocities (free tier)
- **Method:** Next.js static export (SSG)
- **CI/CD:** GitHub Actions (automatic on push to main)
- **Build Time:** ~30 seconds
- **Output:** Pure static HTML/CSS/JS (no backend)

### Data Storage
- **User Data:** localStorage (reading progress, favorites, admin state)
- **Documents:** Markdown files with YAML frontmatter
- **Build-time Manifest:** JSON index of all documents generated during build

---

## Repository Structure

**📖 See [REPO_STRUCTURE.md](./REPO_STRUCTURE.md) for detailed documentation**

### Key Directories

```
rstu-connect/
├── src/                    # Next.js application source
│   ├── app/               # Pages and layouts
│   ├── components/        # React components
│   ├── contexts/          # State management
│   └── lib/               # Utilities and interfaces
├── docs/                   # 1,738 organizing documents (source)
│   ├── additional/
│   ├── classic-theory/
│   ├── housing-rent-tenants/
│   ├── labor-unions/
│   └── ...
├── data/                   # Property databases & datasets (not deployed)
│   └── databases/
│       └── main_properties.db  # 192,463 Washoe County properties
├── public/                 # Static assets
│   └── documents/         # Built documents (generated)
├── scripts/                # Build scripts
│   ├── generate-reading-manifest.js
│   └── fix-frontmatter.js
├── archive/                # Legacy systems (Gun.js, Matrix/Element, etc.)
└── .github/workflows/      # CI/CD configuration
```

---

## Development

### Prerequisites
- Node.js 18+
- npm

### Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
# Open http://localhost:3000

# Build static site
npm run build
# Output in out/ directory

# Deploy (build + copy to root for Neocities)
npm run deploy
```

### Adding New Documents

1. Add markdown files to `docs/` directory
2. Ensure proper YAML frontmatter:
   ```yaml
   ---
   title: "Document Title"
   author: "Author Name"
   date: 2025
   ---
   ```
3. Run `npm run build` to regenerate manifest
4. Commit and push (auto-deploys via GitHub Actions)

### Fix Malformed Frontmatter

If you add bulk documents and see "Invalid frontmatter" warnings:

```bash
node scripts/fix-frontmatter.js
npm run build
```

---

## Key Design Decisions

### 1. Static Site Generation (SSG)
**Why:** Free hosting, no server costs, fast performance, simple deployment

### 2. Tlk.io for Chat
**Why:** No login required (zero friction for tenants), mobile-friendly, free unlimited rooms, no authentication complexity

### 3. localStorage for User Data
**Why:** No backend needed, privacy-first, fast performance, simple implementation

### 4. YAML Frontmatter for Documents
**Why:** Human-readable, version control friendly, easy to edit, rich metadata

---

## Data & Intelligence Platform

### Property Database (Not Public)

The `data/` directory contains a comprehensive property intelligence platform:
- **192,463 Washoe County property records**
- Owner information, addresses, parcel data
- GPS coordinates (WGS84)
- Corporate landlord analysis
- Campaign tracking databases

**Status:** Preserved for future integration. Not currently used by live site.

**Future Plans:** Connect property data to Organize tab for building-specific resources.

---

## Documentation

- **[REPO_STRUCTURE.md](./REPO_STRUCTURE.md)** - Complete repository documentation
- **[SESSION_NOTES_2025-12-04.md](./SESSION_NOTES_2025-12-04.md)** - Recent development session notes
- **[CLAUDE.md](./CLAUDE.md)** - AI assistant project instructions
- **[ADMIN_GUIDE.md](./ADMIN_GUIDE.md)** - Admin panel usage guide
- **[archive/README.md](./archive/README.md)** - Legacy systems documentation

---

## Deployment

### Automatic Deployment
Every push to `main` branch triggers automatic deployment to Neocities:
1. GitHub Actions runs `npm run build`
2. Static files generated in `out/`
3. Files synced to Neocities hosting
4. Site live at https://rstu-connect.neocities.org

### Manual Deployment
```bash
npm run deploy
git add .
git commit -m "Your commit message"
git push origin main
```

---

## Statistics

### Current Scale
- **Documents:** 1,738 organizing resources
- **Categories:** 12
- **Buildings:** 15 with active chat rooms
- **Property Records:** 192,463 (archived, not deployed)
- **Code Size:** ~5,000 lines of TypeScript/React
- **Build Time:** ~30 seconds
- **Deploy Time:** ~2 minutes

### Recent Growth
- December 4, 2025: Added 869 documents from organizing-library
- December 4, 2025: Fixed 210 documents with malformed YAML
- December 4, 2025: Expanded from 417 to 1,738 total documents

---

## Future Roadmap

### Phase 1: Enhanced Reading Library
- [ ] PDF viewer for native PDF support
- [ ] Full-text search across document content
- [ ] Document annotations
- [ ] Category filtering with improved UI

### Phase 2: Property Integration
- [ ] Connect property database to Organize tab
- [ ] Building-specific organizing resources
- [ ] Property owner tracking
- [ ] Campaign progress tracking

### Phase 3: Collaborative Features
- [ ] Multi-user document editing
- [ ] Shared annotations
- [ ] Campaign coordination tools
- [ ] Member authentication

### Phase 4: Multilingual Support
- [ ] Spanish translations
- [ ] Language switcher
- [ ] Bilingual organizing materials

### Phase 5: Mobile Optimization
- [ ] Progressive Web App (PWA)
- [ ] Offline document access
- [ ] Field organizer tools

---

## Contributing

This is a private organizing platform for RSTU. If you're interested in adapting this for your tenant union:

1. **Fork the repository**
2. **Update building data** in `src/app/page.tsx`
3. **Replace documents** in `docs/` directory
4. **Update branding** (colors, logos, links)
5. **Deploy** to your preferred static host

### Key Configuration Points
- Building list: `src/app/page.tsx` (lines 23-177)
- RSTU red color: `tailwind.config.ts` (`#cc0000`)
- Organization links: `src/components/Navigation.tsx`
- Chat room slugs: Auto-generated from building addresses

---

## License

This project is open source and available for use by tenant unions and housing justice organizations.

**Property Data:** Washoe County open data (public domain)
**Organizing Documents:** Various sources, see individual document attribution

---

## Contact & Support

**Organization:** Reno-Sparks Tenants Union
**Website:** https://renosparkstenantsunion.org
**Get Involved:** https://docs.google.com/forms/d/e/1FAIpQLSc4Fgq0sW7BFHfFLDvM8NIUIKLtnkDTC9RwUQ1rLin8ZqyoSQ/viewform

**Repository:** https://github.com/cwcorella-git/rstu-connect
**Live Site:** https://rstu-connect.neocities.org

---

## Acknowledgments

Built with:
- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Tlk.io](https://tlk.io/) - Anonymous chat rooms
- [Neocities](https://neocities.org/) - Free static hosting
- [react-markdown](https://github.com/remarkjs/react-markdown) - Markdown rendering

Organizing resources compiled from:
- The Anarchist Library
- Labor Notes
- DSA Housing Justice Commission
- Tenant organizing networks nationwide

---

**"The platform serves organizing, organizing doesn't serve the platform."**

*Last Updated: December 4, 2025*
