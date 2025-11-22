# RSTU Connect - Reno-Sparks Tenants Union Organizing Platform

This repository contains the organizing coordination platform for the Reno-Sparks Tenants Union (RSTU), the first tenants union in Nevada.

**Mission:** Organizing for tenant power, one building at a time.

## Technology Stack

- **Framework:** Next.js 14 with TypeScript
- **Styling:** Tailwind CSS
- **Database:** SQLite (build-time only, not deployed)
- **Hosting:** Neocities (static HTML/CSS/JS)
- **Deployment:** Automatic via GitHub Actions

## Website Structure

### Live Site (https://rstu-connect.neocities.org/)

- **`/`** - Two-column organizing dashboard
  - Left panel: Searchable list of 10 buildings with active Matrix rooms
  - Right panel: Embedded Element/Matrix chat for building coordination
- **`/toolkit`** - Organizing resources and templates
- **`/help`** - Tenant rights and support resources

### How It Works

This is a **Next.js static export** that:
1. Queries the SQLite database at build time
2. Generates static HTML/CSS/JS files
3. Deploys to Neocities via GitHub Actions
4. No backend or database needed at runtime

Every push to `main` branch triggers automatic deployment.

## What's NOT on the Website

The following are archived in this repository but **not published** to the public website:

### Full Organizing Platform

The complete RSTU organizing platform includes:
- Property and landlord database (192,000+ properties)
- Real-time campaign tracking and management
- Interactive maps and intelligence tools
- User authentication and member systems
- Backend API and data infrastructure

This full platform requires backend hosting and database infrastructure. It's designed for internal organizing use and is not part of the public website.

**Status:** Under development - not yet deployed.

## Repository Files

```
rstu-connect/
├── index.html                # Homepage
├── get-started/index.html    # Get started guide
├── join/index.html           # Join organizers
├── help/index.html           # Get help
├── blog/                     # Blog posts and articles
│   ├── index.html           # Blog index
│   └── *.md                 # Individual blog posts (markdown)
├── assets/                   # Images and media
├── resources/                # Educational resources
├── _next/                    # Next.js static assets
├── .github/workflows/        # GitHub Actions deployment
└── README.md                 # This file
```

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
```

### Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with header/footer
│   ├── page.tsx            # Homepage dashboard
│   └── globals.css         # Tailwind styles
├── components/
│   ├── BuildingList.tsx    # Left sidebar with building list
│   ├── BuildingCard.tsx    # Individual building card
│   ├── MatrixChatEmbed.tsx # Matrix/Element chat iframe
│   └── BuildingMetadata.tsx # Building info overlay
└── lib/
    └── getBuildingsData.ts # Database queries (build-time)
```

### Matrix Chat Embedding

**Important:** The Matrix chat requires a self-hosted Element instance to work in iframes.

The hosted `app.element.io` blocks iframe embedding. To enable chat in the dashboard:

1. **Follow setup guide:** See `docs/NETLIFY_ELEMENT_SETUP.md`
2. **Deploy Element to Netlify** (free, 15 minutes)
3. **Update the URL** in `src/components/MatrixChatEmbed.tsx`
4. **Rebuild and deploy**

Configuration templates are in `netlify-element-config/`.

### Adding New Buildings

1. Add Matrix room using `scripts/create_matrix_rooms.py`
2. Buildings are hardcoded in `src/app/page.tsx` (TODO: query from database at build time)
3. Run `npm run build` to regenerate static site
4. Deploy using instructions below

## Deployment

### Automatic Deployment (Recommended)

Push to `main` branch triggers GitHub Actions:

```bash
git add .
git commit -m "Update site content"
git push origin main
```

GitHub Actions will:
1. Install dependencies
2. Build Next.js site (`npm run build`)
3. Deploy `out/` directory to Neocities
4. Site updates within 1-2 minutes

### Manual Deployment

```bash
# Build and copy to root
npm run deploy

# Commit and push
git add .
git commit -m "Deploy: $(date)"
git push origin main
```

### Updating Content

- **Building list:** Edit `src/app/page.tsx`
- **Components:** Modify files in `src/components/`
- **Styles:** Update `tailwind.config.ts` or `src/app/globals.css`
- **Matrix rooms:** Run `scripts/create_matrix_rooms.py`

## Legal & Licenses

- Code and website design: Licensed under the LICENSE file
- Content: RSTU organizing materials and educational resources
- Third-party: Tailwind CSS and other libraries used in development

## Contact

- **Email:** renotenantsunion@gmail.com
- **Website:** https://rstu-connect.neocities.org/

## Organizing Resources

For information about tenant organizing, legal rights, and mutual aid:

- See the Blog section for educational content
- Contact RSTU directly for specific organizing support
- Visit the Help page for resources in your area

---

Built with Next.js, deployed on Neocities.
