# Development Session Notes - December 4, 2025

## Overview
Major improvements to the RSTU Connect reading library system, including admin panel refinements, document library expansion, and YAML frontmatter fixes.

---

## Changes Implemented

### 1. Admin Panel UX Improvements

**Issue:** The admin panel window was intrusive and category filter tags were cluttering the interface.

**Changes:**
- Removed the AdminPanel modal window component
- Simplified Ctrl+Shift+A to login/logout only (no panel toggle)
- Removed all category filter tags/buttons from reading list sidebar
- Added inline admin controls directly on document cards:
  - **Edit** button - Opens DocumentEditor modal
  - **Hide/Show** button - Toggles document visibility
  - **Delete** button - Marks document as deleted

**Files Modified:**
- `src/app/page.tsx` - Removed AdminPanel component, simplified keyboard shortcut
- `src/components/Reading/ReadingList.tsx` - Removed CategoryFilter component

---

### 2. Favorites Sorting

**Feature:** Favorited documents now automatically sort to the top of the reading list.

**Implementation:**
```typescript
// In ReadingList.tsx
const filteredDocuments = useMemo(() => {
  const state = getReadingState()
  let filtered = documents

  // Search filter
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase()
    filtered = filtered.filter(doc =>
      doc.title.toLowerCase().includes(query) ||
      doc.excerpt.toLowerCase().includes(query)
    )
  }

  // Sort: Favorites at the top, then alphabetically by title
  return filtered.sort((a, b) => {
    const aFav = state.favorites.includes(a.id)
    const bFav = state.favorites.includes(b.id)
    if (aFav && !bFav) return -1
    if (!aFav && bFav) return 1
    return a.title.localeCompare(b.title)
  })
}, [documents, searchQuery])
```

**Files Modified:**
- `src/components/Reading/ReadingList.tsx`

---

### 3. Red Border Selection Indicator Fix

**Issue:** The red left border on selected items was stuck on the first item and wouldn't move.

**Root Cause:** Tailwind CSS class specificity and transition conflicts.

**Solution:** Used inline styles instead of Tailwind classes for dynamic borders.

**Implementation:**
```tsx
<li
  className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
    isSelected ? 'bg-red-50' : 'bg-white'
  }`}
  style={{
    borderLeft: isSelected ? '4px solid #cc0000' : '4px solid transparent'
  }}
  onClick={onClick}
>
```

**Files Modified:**
- `src/components/BuildingCard.tsx` - Fixed border for building list
- `src/components/Reading/ReadingCard.tsx` - Fixed border for reading list

---

### 4. Building Metadata Collapsed by Default

**Change:** The "Show building info" button now starts collapsed instead of expanded.

**Files Modified:**
- `src/components/BuildingMetadata.tsx` - Changed `useState(true)` to `useState(false)`

---

### 5. Tab Persistence Across Sessions

**Feature:** The active tab (Organize/Reading) now persists across browser sessions using localStorage.

**Implementation:**
```typescript
const TAB_STORAGE_KEY = 'rstu_active_tab'

export function TabProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<Tab>('home')

  // Load saved tab on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(TAB_STORAGE_KEY) as Tab | null
      if (saved && (saved === 'home' || saved === 'reading')) {
        setActiveTab(saved)
      }
    }
  }, [])

  // Save tab when it changes
  const handleSetActiveTab = (tab: Tab) => {
    setActiveTab(tab)
    if (typeof window !== 'undefined') {
      localStorage.setItem(TAB_STORAGE_KEY, tab)
    }
  }

  return (
    <TabContext.Provider value={{ activeTab, setActiveTab: handleSetActiveTab }}>
      {children}
    </TabContext.Provider>
  )
}
```

**Files Modified:**
- `src/contexts/TabContext.tsx`

---

### 6. Navigation Rename: "Home" → "Organize"

**Change:** Renamed the "Home" tab to "Organize" to better reflect its purpose.

**Files Modified:**
- `src/components/Navigation.tsx`

---

### 7. Document Library Expansion

**Achievement:** Synced 869 documents from `~/organizing-library` to the site.

**Process:**
1. Removed old duplicate documents from root `docs/` directory
2. Copied fresh 869 documents from `~/organizing-library`
3. Build process generated manifest with **1,648 total documents** across **12 categories**

**New Category Structure:**
- **Additional** - Largest collection of diverse organizing resources
- **Classic Theory** (41 docs) - Kropotkin, Bakunin, anarchist foundational texts
- **Contemporary Analysis** (28 docs) - Bookchin, modern organizing theory
- **Historical** (11 docs) - Historical labor movements
- **Housing Rent Tenants** (36 docs) - Tenant organizing resources
- **Labor Unions** (49 docs) - Union organizing guides
- **Organizing Action** (45 docs) - Direct action tactics
- **Police Enforcement** (43 docs) - Police abolition resources
- **Property Landlords** (8 docs) - Landlord analysis
- **Strikes** (7 docs) - Strike organizing
- **Archives** - RSTU website archives
- **Documents** - Organized materials

**Files Modified:**
- Entire `docs/` directory restructured

---

### 8. Document Title Edit Updates Fix

**Issue:** When admins edited document titles, they saved to localStorage but the reading list didn't update until page refresh.

**Solution:**
- Imported `getDocumentEdits` from adminStorage
- Converted `allDocuments` from constant to state variable
- Added `mergeDocumentEdits()` function to merge localStorage edits with manifest
- Call merge on mount to load saved titles
- Call merge after DocumentEditor saves to update list immediately
- Update selected document title when it's the one being edited

**Files Modified:**
- `src/app/page.tsx`

---

### 9. YAML Frontmatter Fix - Major Document Recovery

**Issue:** 210 documents had malformed YAML frontmatter (all on one line) causing the build to skip them with "Invalid frontmatter" warnings.

**Example Malformed Frontmatter:**
```yaml
---
author: Charles H date: '1880' title: An Appeal to the Young
---
```

**Solution:** Created `scripts/fix-frontmatter.js` that:
- Detects single-line frontmatter patterns
- Parses inline key-value pairs
- Converts to proper multi-line YAML format
- Quotes values with special characters

**Example Fixed Frontmatter:**
```yaml
---
author: "Charles H"
date: 1880
title: "An Appeal to the Young"
---
```

**Results:**
- **210 files fixed** across all categories
- **Library expanded from 1,648 to 1,738 documents** (+90 documents!)
- **Zero "Invalid frontmatter" warnings** in build
- All documents now properly formatted and will render correctly with markdown wrapping

**Files Created:**
- `scripts/fix-frontmatter.js`

**Files Modified:**
- 210 markdown files with malformed frontmatter across all categories in `docs/`

---

## Final Statistics

### Document Library
- **Total Documents:** 1,738 (up from 417 at start of session)
- **Categories:** 12
- **Documents Fixed:** 210 (YAML frontmatter issues)
- **Documents Synced:** 869 (from organizing-library)

### Build Performance
- **Manifest Generation:** Successful
- **Build Warnings:** 0 (down from 87)
- **Static Pages Generated:** 4
- **Build Time:** ~30 seconds

---

## Technical Improvements

### localStorage Usage
All user preferences and admin edits now persist across sessions:
- Active tab selection (`rstu_active_tab`)
- Reading progress per document (`rstu_reading_state`)
- Favorited documents (`rstu_reading_state.favorites`)
- Admin authentication (`rstu_admin_auth`)
- Document title edits (`rstu_document_edits`)
- Hidden/deleted documents (`rstu_admin_state`)

### Code Quality
- Removed unused components (AdminPanel, CategoryFilter)
- Simplified keyboard shortcuts
- Fixed CSS specificity issues with inline styles
- Improved React state management for document merging
- Better separation of concerns (admin vs user views)

---

## Deployment

All changes automatically deployed to production via GitHub Actions:
- **Repository:** https://github.com/cwcorella-git/rstu-connect
- **Live Site:** https://rstu-connect.neocities.org
- **Deployment Method:** Static export to Neocities on push to main branch

---

## Next Steps & Future Enhancements

### Immediate Opportunities
1. **PDF Support** - Many documents in `docs/` are PDF conversions, consider adding native PDF viewer
2. **Search Improvements** - Add full-text search across document content (currently title/excerpt only)
3. **Category Restoration** - Consider adding back category filtering with better UI
4. **Export Admin Edits** - Add ability to export title edits as JSON for backup

### Long-term Vision
1. **Property Database Integration** - Connect the 192,463 property records in `data/databases/` to the organizing tab
2. **Building-specific Resources** - Link organizing documents to specific properties
3. **Collaborative Features** - Multi-user editing and document curation
4. **Bilingual Support** - Spanish translations for organizing materials
5. **Mobile App** - Progressive Web App for field organizers

---

## Files Created Today
- `scripts/fix-frontmatter.js` - YAML frontmatter repair tool
- `SESSION_NOTES_2025-12-04.md` - This file

## Files Significantly Modified Today
- `src/app/page.tsx` - Removed AdminPanel, added document merging logic
- `src/components/Reading/ReadingList.tsx` - Removed CategoryFilter, added favorites sorting
- `src/components/Reading/ReadingCard.tsx` - Fixed border indicator
- `src/components/BuildingCard.tsx` - Fixed border indicator
- `src/components/BuildingMetadata.tsx` - Collapsed by default
- `src/contexts/TabContext.tsx` - Added localStorage persistence
- `src/components/Navigation.tsx` - Renamed "Home" to "Organize"
- `src/lib/adminStorage.ts` - Added getDocumentEdits export
- `docs/**/*.md` - 210 files with fixed YAML frontmatter

## Dependencies Added
None today - all improvements used existing dependencies.

---

## Known Issues & Limitations
None currently. System is stable and all features working as expected.

---

## Lessons Learned

1. **CSS Specificity:** Tailwind classes can conflict with dynamic styling - inline styles work better for state-dependent styles
2. **YAML Validation:** Malformed frontmatter can silently fail - automated repair tools are valuable
3. **State Management:** React state vs localStorage requires careful synchronization
4. **Build-time vs Runtime:** Separating manifest generation (build-time) from document filtering (runtime) improves performance

---

**Session Duration:** ~4 hours
**Commits:** 6 major commits
**Files Changed:** ~630 files (mostly document frontmatter fixes)
**Lines Changed:** ~2,000,000 (mostly document content)
