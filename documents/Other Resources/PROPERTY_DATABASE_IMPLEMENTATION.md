# Property Database Implementation Plan

**Status**: Planning (Phase 2)
**Last Updated**: November 13, 2025

---

## Overview

RSTU Connect will feature a searchable property database for Washoe County, allowing tenants to:
1. Research who owns their building
2. Find all properties owned by their landlord
3. Identify other tenants in the same portfolio
4. Access corporate landlord intelligence

**Database Size**: 192,463 Washoe County parcels (99.97% success rate)
**Corporate Landlords Identified**: 48,636 entities, 627 with 10+ properties

---

## Challenge: Static Site Limitation

**Problem**: Neocities is a static hosting platform - no backend database or API support.

**Solution**: Three-tier approach using static-compatible technologies:

### Tier 1: Full Database JSON (Client-Side Search)
- Generate JSON file with all 192,463 properties
- Use Fuse.js for instant client-side fuzzy search
- No server calls needed (privacy-preserving)
- Lightweight (~5-10MB gzipped)

### Tier 2: Pre-Generated Detail Pages
- Create static HTML pages for top 500-1000 priority properties
- High-priority = corporate landlords with 10+ properties
- Direct links: `/properties/123-main-st/` → property details

### Tier 3: Portfolio Pages
- Aggregate pages for major landlords
- Show all properties owned by single entity
- Example: `/landlords/toll-north-reno-llc/` → all 534 properties

---

## Implementation: Three Approaches

### Approach A: Full JSON + Fuse.js (Recommended)

**Technology Stack:**
- JSON file with all 192,463 properties
- Fuse.js library for client-side search
- Next.js dynamic route for search page
- Gzip compression to reduce file size

**Pros:**
- Simple implementation
- Instant search (no loading delay)
- Privacy-preserving (no server logs)
- Works offline
- Scales to millions of records

**Cons:**
- Initial JSON load (~5-10MB)
- Memory usage on client
- Search performance depends on client CPU

**Data Structure:**
```json
[
  {
    "id": "12345",
    "address": "123 Main Street, Reno, NV 89501",
    "owner": "TOLL NORTH RENO LLC",
    "owner_entity_id": "E-001234",
    "parcels": 1,
    "units": 12,
    "status": "Organizing",
    "organizing_priority": 8,
    "in_portfolio": 534,
    "portfolio_url": "/landlords/toll-north-reno-llc/"
  },
  ...
]
```

**Implementation Steps:**
1. Extract property database (already done: 192K+ records)
2. Generate JSON from SQLite database
3. Implement search page `/search` or `/properties/search`
4. Use Fuse.js for search functionality
5. Display results with:
   - Property address
   - Owner name
   - Number of units
   - Organizing status (if known)
   - Link to landlord portfolio page
   - Link to Matrix chat (if available)

---

### Approach B: Pre-Generated HTML Pages (Fallback)

**Technology Stack:**
- Node.js script to generate static HTML
- Create page per property (192,463 files)
- Index page with search form
- Dynamically generate links

**Pros:**
- No JavaScript required
- Works on slow connections
- Best SEO

**Cons:**
- 192K+ HTML files (large deployment)
- Neocities storage limits (10GB free tier)
- Search requires client-side JavaScript or server redirect

**Implementation:**
```bash
# Generate one HTML file per property
node scripts/generate-property-pages.js

# Output structure:
out/
├── properties/
│   ├── index.html (search page)
│   ├── 123-main-st-reno-nv/
│   │   └── index.html (property details)
│   └── ... (192,462 more)
```

**Storage Estimate:**
- ~5-10KB per property file
- Total: ~1-2TB (too large for Neocities!)

**Solution**: Generate only high-priority properties (500-1000), use JSON for remainder.

---

### Approach C: Hybrid (Recommended Implementation)

**Combine both approaches:**

1. **Full Database JSON** (5-10MB gzipped)
   - All 192,463 properties
   - Fuse.js client-side search
   - Page: `/properties/search`

2. **Pre-Generated Priority Pages** (top 500-1000)
   - Highest priority organizing targets
   - Pre-built detail pages
   - URLs: `/properties/123-main-st-reno-nv/`
   - Pre-generated landlord portfolios

3. **Dynamic Fallback**
   - If priority page doesn't exist, show search results
   - Link back to Fuse.js search

---

## Detailed Implementation (Approach C)

### Step 1: Prepare Data

**Source**: Existing extraction in `/home/user/Projects/MAKE-SENSE-OF/`

```bash
# Validate database
sqlite3 properties.db "SELECT COUNT(*) FROM properties;"
# Expected: 192463

# Check fields
sqlite3 properties.db "PRAGMA table_info(properties);"
# Need: id, address, owner, units, owner_id
```

**Data Cleaning:**
- Remove NULL values
- Standardize addresses (capitalize, abbreviate St/Ave/Blvd)
- Remove duplicate entries
- Map owner names to owner_id (corporate structure)

### Step 2: Generate JSON Database

**Script**: `scripts/generate-property-json.js`

```javascript
// Export all properties to JSON
const sqlite3 = require('sqlite3');
const fs = require('fs');
const zlib = require('zlib');

const db = new sqlite3.Database('properties.db');

db.all('SELECT * FROM properties ORDER BY address', (err, rows) => {
  // Transform data
  const properties = rows.map(row => ({
    id: row.id,
    address: row.address,
    owner: row.owner_name,
    owner_id: row.owner_id,
    units: row.units || 0,
    status: getOrganizingStatus(row.property_id), // From campaigns table
    priority: getOrganizingPriority(row.owner_id), // 1-10 scale
    in_portfolio: countPortfolioSize(row.owner_id),
    portfolio_url: `/landlords/${slugify(row.owner_name)}/`
  }));

  // Write and compress
  const json = JSON.stringify(properties);
  fs.writeFileSync('out/data/properties.json', json);

  // Also generate gzipped version
  fs.createReadStream('out/data/properties.json')
    .pipe(zlib.createGzip())
    .pipe(fs.createWriteStream('out/data/properties.json.gz'));
});
```

**Output**: `public/data/properties.json.gz` (~5-10MB → ~1-2MB compressed)

### Step 3: Implement Search Page

**File**: `/home/user/Projects/MAKE-SENSE-OF/apps/web/src/app/properties/search/page.tsx`

```typescript
'use client'

import { useState, useEffect } from 'react'
import Fuse from 'fuse.js'

interface Property {
  id: string
  address: string
  owner: string
  units: number
  status: string
  in_portfolio: number
  portfolio_url: string
}

export default function PropertySearchPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load JSON database on component mount
    fetch('/data/properties.json')
      .then(r => r.json())
      .then(data => {
        setProperties(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load properties database', err)
        setLoading(false)
      })
  }, [])

  // Search with Fuse.js
  useEffect(() => {
    if (loading || !query) {
      setResults([])
      return
    }

    const fuse = new Fuse(properties, {
      keys: ['address', 'owner'],
      threshold: 0.3, // Fuzzy matching tolerance
      minMatchCharLength: 2
    })

    const searchResults = fuse.search(query)
    setResults(searchResults.map(r => r.item).slice(0, 20))
  }, [query, properties, loading])

  return (
    <div>
      {/* Search Form */}
      <section className="bg-red-600 text-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Search Properties</h1>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by address or landlord name..."
            className="w-full px-4 py-2 rounded text-gray-900"
          />
        </div>
      </section>

      {/* Results */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          {loading && <p>Loading database...</p>}
          {!loading && query && results.length === 0 && (
            <p>No properties found matching "{query}"</p>
          )}

          {results.map(property => (
            <div key={property.id} className="border rounded-lg p-4 mb-4">
              <h3 className="font-bold">{property.address}</h3>
              <p className="text-gray-700">{property.owner}</p>
              <p className="text-sm text-gray-600">
                {property.units} units | {property.in_portfolio} total properties owned
              </p>
              <a href={property.portfolio_url} className="text-red-600 font-semibold">
                View all properties by this owner →
              </a>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
```

### Step 4: Generate Priority Property Pages

**Script**: `scripts/generate-priority-properties.js`

Priority = properties with 10+ units OR landlord with 10+ properties

```javascript
const fs = require('fs');
const db = new sqlite3.Database('properties.db');

// Get properties where:
// - landlord has 10+ properties OR
// - landlord is known corporate entity with 10+ properties
// - property has 10+ units OR
// - property is in an active organizing campaign

const sql = `
  SELECT p.*
  FROM properties p
  WHERE landlord_portfolio_count >= 10
    OR unit_count >= 10
    OR organizing_status IS NOT NULL
  ORDER BY landlord_priority DESC
  LIMIT 1000
`;

db.all(sql, (err, rows) => {
  rows.forEach(property => {
    const html = generatePropertyDetailHTML(property);
    const path = `out/properties/${slugifyAddress(property.address)}/index.html`;
    fs.mkdirSync(path.split('/').slice(0, -1).join('/'), { recursive: true });
    fs.writeFileSync(path, html);
  });
});
```

### Step 5: Generate Landlord Portfolio Pages

**Script**: `scripts/generate-landlord-portfolios.js`

Shows all properties owned by a single landlord

```javascript
// For each landlord with 2+ properties, create portfolio page
const portfolios = groupPropertiesByOwner(properties);

portfolios.forEach(({ owner_name, owner_id, properties }) => {
  const html = generateLandlordPortfolioHTML(owner_name, properties);
  const path = `out/landlords/${slugify(owner_name)}/index.html`;
  fs.mkdirSync(path.split('/').slice(0, -1).join('/'), { recursive: true });
  fs.writeFileSync(path, html);
});
```

**Example Portfolio Page**:
- Title: "TOLL NORTH RENO LLC Properties (534 total)"
- Overview: "This corporate landlord owns 534 properties in Washoe County with 3,847 total units"
- Table of all properties with organizing status
- Links to chat rooms (if organizing)
- Cumulative rent, violations, eviction data

---

## Organizing Intelligence Features

### Priority Scoring Algorithm

Score properties 1-10 for organizing potential:

```
organizing_priority = (
  5 * has_known_violations +        # Known habitability issues
  3 * unit_count / 100 +             # More tenants = easier organizing
  2 * landlord_portfolio_size / 100 + # Corporate leverage
  1 * rent_burden_ratio +            # Higher rents = more motivation
  1 * gentrification_trend +         # Rising rents = urgency
  -2 * past_successful_organizing    # Already organized
)
```

**Result**: Top 200-500 highest priority properties get pre-generated pages

### Landlord Classification

**Types:**
- Corporate (LLC, Inc, Corp, etc.) - 48,636 identified
- Individual/Family - 144,000+
- Investment firm - subset of corporate
- Corporate with 10+ properties - 627
- Corporate with 100+ properties - 39

**Intelligence to track:**
- Total portfolio size
- Total units controlled
- Eviction patterns
- Code violation patterns
- Recent rent increases
- Investment source (if public)

---

## Search Page UX

### Search Interface
- Simple text input (address or owner name)
- Instant fuzzy matching as you type
- Shows: Address, Owner, Unit Count, Organizing Status

### Results Display
- Top 20 most relevant results
- Show property details:
  - Full address
  - Owner name
  - Number of units
  - Building organizing status
  - Landlord portfolio size
  - Link to landlord's other properties
  - Link to building chat room (if available)

### Landlord Portfolio View
- Shows all properties by one owner
- Total portfolio statistics
- Map visualization (future)
- Organizing opportunities

---

## Technical Considerations

### File Size Management

**Full Database**: 192,463 properties as JSON

| Format | Size | Compressed |
|--------|------|-----------|
| Uncompressed | ~80MB | - |
| Minified JSON | ~20MB | - |
| GZIP | ~5MB | Primary |
| Brotli | ~3MB | Optimal |

**Strategy**: Deploy GZIP version (1MB/property data), stream on demand

### Performance Optimization

**Client-Side Search:**
- Fuse.js handles 192K records in <100ms
- Responsive on modern browsers
- No server load

**HTML Generation:**
- Generate 500-1000 pages during build
- Deploy as static files (instant load)
- Fallback to JSON search for remaining properties

### Storage on Neocities

**Free Tier Limit**: 10GB

**Estimated Usage**:
- HTML files: 0.5-1GB (1000 pages × 1MB each)
- JSON database: 10MB (gzipped)
- Static assets (CSS, JS): 50MB
- **Total**: ~1.5GB (14% of quota)

**Alternative**: Compress HTML with Brotli for ~30% size reduction

---

## Timeline & Milestones

### Week 1 (Prep)
- Finalize property database schema
- Clean and validate data
- Create generating scripts
- Test Fuse.js performance with 192K records

### Week 2 (Build)
- Generate full JSON database
- Implement search page
- Create 100-200 priority property pages
- Create 50-100 landlord portfolio pages
- Test search functionality

### Week 3 (Launch)
- Deploy to Neocities
- Test in production
- Get feedback from organizers
- Iterate on data fields

---

## Next Phases

### Phase 3: Advanced Features
- **Building Timeline** - Document organizing history
- **Violation Tracking** - Link to code enforcement records
- **Eviction Patterns** - Historical eviction data by landlord
- **Rent Tracking** - Monitor rent increases over time

### Phase 4: Corporate Intelligence
- **Ownership Maps** - Visualize corporate structures
- **Investment Sources** - Find who funds the landlords
- **Legal Cases** - Track lawsuits by/against landlords
- **News Monitoring** - Track landlord in local news

### Phase 5: Community Integration
- **User Contributions** - Tenants report violations/issues
- **Verification System** - Community verification of data
- **Real-Time Updates** - Live tenant reporting
- **API for Partners** - Share data with allied organizations

---

## Security & Privacy

### Data Protection
- **Public Data**: Property addresses, owner names (public record)
- **No Private Data**: No tenant contact info, no private documents
- **Legal**: All data from publicly accessible county records

### User Privacy
- **No Tracking**: Client-side search = no server logs
- **No Accounts**: No passwords or personal data collected
- **No Cookies**: Stateless operation

### Future Phases
- When authentication is added, will have privacy policy
- Matrix chat is encrypted end-to-end
- Tenant submissions will be anonymized

---

## Resources

### Data Sources
- Washoe County Assessor property records
- Clark County Civil Self-Help Law Center (eviction data)
- Nevada Legal Services (case documentation)

### Libraries
- **Fuse.js** - Client-side search: https://fusejs.io/
- **Next.js** - Framework: https://nextjs.org/
- **Tailwind CSS** - Styling: https://tailwindcss.com/

### References
- Static site generation: https://nextjs.org/docs/basic-features/pages
- Building intelligent tools: RSTU_THEORETICAL_FOUNDATION_AND_OPERATIONAL_STRATEGY.md
- Database architecture: DATABASE_ARCHITECTURE_PLAN.md

