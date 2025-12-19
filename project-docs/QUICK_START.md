# Quick Start Guide

Get the RSTU organizing platform up and running in 5 minutes.

## Prerequisites

- **Node.js** 18+ with npm 9+
- **Python** 3.9+
- **Make** (optional, but recommended)
- **Git** (for version control)

## Installation (2 minutes)

```bash
# Navigate to project directory
cd rstu-0.03

# Install all dependencies
make install

# Or manually:
npm install
npm install --prefix apps/web
pip install -r apps/api/requirements.txt
```

## Starting Development Servers (1 minute)

```bash
# Start both frontend and backend together
make dev

# Or manually:
npm run dev
```

You should see output like:
```
> concurrently "npm run dev:web" "npm run dev:api"

[0] compiled client and server successfully
[1] INFO:     Uvicorn running on http://0.0.0.0:8000
```

## Accessing the Platform (1 minute)

Open your browser to:

**Frontend:** http://localhost:3002
**API:** http://localhost:8000

### Verify Everything Works

1. **Frontend loads:** You should see the RSTU home page
2. **API responds:** Visit http://localhost:8000/health
   - You should see: `{"status":"ok","database_connected":true,...}`

## What to Try

### 1. Homepage
- URL: http://localhost:3002/
- Explore the three user pathways
- See active campaigns

### 2. Search Properties
- URL: http://localhost:3002/landlords
- Try searching: "Marina" or "Reno" or any property address
- Click "View Details" to see property information

### 3. View Campaigns
- URL: http://localhost:3002/buildings
- See Marina's Edge and Redfield Ridge campaigns
- Filter by status
- Click on a campaign to see details

### 4. Fill Out Canvassing Form
- URL: http://localhost:3002/canvassing/intake
- This is what organizers use to record door-knock conversations
- Try filling it out and submitting

### 5. Learn About Organizing
- URL: http://localhost:3002/get-started
- 5-step guide for organizing a building

### 6. Join as Organizer
- URL: http://localhost:3002/join
- See what organizers actually do

### 7. Tenant Rights
- URL: http://localhost:3002/help
- Information about tenant rights and legal resources

## Useful Commands

```bash
# Start development servers
make dev

# Start frontend only (on custom port)
PORT=3003 make dev-web

# Start backend only
make dev-api

# Check if API is running
make health
# or: npm run health

# Run linting
make lint

# Clean up and stop processes
make clean

# View all available commands
make help
```

## Stopping the Servers

Press `Ctrl+C` in your terminal to stop the servers.

To clean up background processes:
```bash
make clean
```

## Troubleshooting

### Frontend won't start
```bash
# Clear Next.js cache
rm -rf apps/web/.next

# Reinstall dependencies
cd apps/web && npm install

# Try again
make dev-web
```

### API won't start
```bash
# Check if port 8000 is already in use
lsof -i :8000

# Install Python dependencies
pip install -r apps/api/requirements.txt

# Try again
make dev-api
```

### Property database not found
The database file should be at: `data/databases/washoe_properties_production.db`

If missing, you may need to extract the database from the original data source.

### Port 3002 already in use
```bash
# Use a different port
PORT=3003 npm run dev:web
```

## File Structure Overview

```
rstu-0.03/
├── apps/
│   ├── web/              # Next.js frontend
│   │   └── src/app/      # Pages
│   └── api/              # Python API
│       └── main.py       # FastAPI application
├── data/
│   └── databases/        # SQLite databases with real data
├── content/              # Educational materials
├── DEVELOPMENT.md        # Detailed development guide
├── BUILD_SUMMARY.md      # What was built
└── Makefile             # Development commands
```

## Next Steps

1. **Explore the codebase:** Look at `/apps/web/src/app/page.tsx` to understand the structure
2. **Read documentation:** See `DEVELOPMENT.md` for comprehensive guide
3. **Test the API:** Try different search queries at http://localhost:3002/landlords
4. **Customize:** Modify pages, add features, experiment

## Key Features

✓ **Property Database:** Search 192,463 Washoe County properties
✓ **Campaign Tracker:** View organizing campaigns and status
✓ **Canvassing Forms:** Record door-knock conversations
✓ **Tenant Education:** Resources and rights information
✓ **Organizer Recruitment:** Join as an organizer

## Architecture Overview

```
User Browser (Frontend)
        ↓
Next.js 14 App (React)
        ↓
Axios HTTP Calls
        ↓
FastAPI Backend (Python)
        ↓
SQLite Databases
        ↓
Property Data & Campaign Data
```

## Documentation

- **`DEVELOPMENT.md`** - Complete development guide with all details
- **`BUILD_SUMMARY.md`** - What was built and why
- **`site-outline.html`** - Strategic direction and design principles
- **Meeting notes** in `content/meetings/` - Organizing context

## Getting Help

1. Check `DEVELOPMENT.md` for detailed documentation
2. Look at page source code in `apps/web/src/app/`
3. Review API code in `apps/api/main.py`
4. Check browser console for errors (F12)
5. Check terminal output for API errors

## Ready to Start?

```bash
cd rstu-0.03
make dev
```

Then visit: http://localhost:3002

Enjoy organizing! 🔴
