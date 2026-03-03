# Document Library Audit Tracking System

## Overview

A systematic tracking system for auditing metadata quality across 2,198 documents in the RSTU Connect reading library. This system **guarantees 100% coverage with zero duplicates** through persistent state tracking.

### The Problem It Solves

**Before (Rounds 1-213):** Random sampling meant:
- No way to know which documents were already audited
- Same documents could be audited multiple times
- No guarantee of complete coverage
- ~66% estimated coverage after 213 rounds (with many duplicates)

**After (Round 214+):** Systematic tracking provides:
- ✅ **100% Coverage Guarantee** - Every document audited exactly once
- ✅ **Zero Duplicates** - Persistent tracking prevents re-auditing
- ✅ **Resume-able** - Stop and continue without losing progress
- ✅ **Progress Visibility** - Category-level progress tracking
- ✅ **Deterministic** - Alphabetical queue order for consistency

### Key Benefits

1. **Efficiency** - No wasted effort on duplicate reviews
2. **Completeness** - Mathematical guarantee of full coverage
3. **Transparency** - Clear progress metrics and estimates
4. **Reliability** - State persists across sessions, safe to interrupt
5. **Automation** - Git integration for automatic marking

---

## Quick Start

```bash
# 1. Get next 10 documents to audit (sorted alphabetically)
python3 scripts/maintenance/audit-documents.py queue 10

# 2. Fix metadata issues in the listed documents
#    (Read frontmatter, correct authors/dates/categories)

# 3. Commit your changes
git add docs/
git commit -m "Fix metadata for 10 documents (Round 216)"

# 4. Auto-mark all changed documents as audited
python3 scripts/maintenance/audit-documents.py finalize-round 216

# 5. Check progress
python3 scripts/maintenance/audit-documents.py status

# 6. Push to deploy
git push origin main
```

---

## Commands Reference

### `queue [N]` - Get Next Documents (Primary Command)

**Purpose:** Get the next N unaudited documents in alphabetical order.

**Usage:**
```bash
python3 scripts/maintenance/audit-documents.py queue 10
python3 scripts/maintenance/audit-documents.py queue 15
python3 scripts/maintenance/audit-documents.py queue 20
```

**Output:**
```
=== ROUND 216: NEXT 10 DOCUMENTS IN QUEUE ===

Progress: 6/2,198 (0.3%) | Remaining: 2,192

📄 abolition/Anarchist Communism.md
   Title: Anarchist Communism: Its Basis and Principles
   Words: 8,345 | Lines: 234
   Status: OK

📄 abolition/Black Bloc Tactics.md
   Title: Black Bloc Tactics - A Guide
   Words: 3,234 | Lines: 156
   Status: ISSUES: empty_title, very_short
...
```

**How It Works:**
1. Loads audit log (`audit-log.json`)
2. Gets all documents, sorted alphabetically by path
3. Filters out documents already in `audited_documents` array
4. Returns first N unaudited documents
5. Shows current round number and progress stats

**Why Alphabetical?**
- Deterministic - same order every time
- Predictable - easy to know what's coming next
- Organized - processes each category systematically
- Resume-friendly - can pick up where you left off

---

### `status` - View Progress

**Purpose:** Show audit progress with detailed category breakdown.

**Usage:**
```bash
python3 scripts/maintenance/audit-documents.py status
```

**Output:**
```
=== AUDIT STATUS ===

Total documents:    2,198
Audited:            6 (0.3%)
Remaining:          2,192
Current round:      216
Flagged for review: 0

Progress by category:
  abolition                        4/164 ( 2.4%)  ░░░░░░░░░░░░░░░░░░░░
  arts-culture-music               0/ 49 ( 0.0%)  ░░░░░░░░░░░░░░░░░░░░
  contemporary-analysis            0/354 ( 0.0%)  ░░░░░░░░░░░░░░░░░░░░
  ...

Estimated completion:
  At 10 docs/round:  ~220 rounds remaining
  At 15 docs/round:  ~147 rounds remaining
  At 20 docs/round:  ~110 rounds remaining
```

**Progress Bar:** 20 characters, each █ represents 5% completion

---

### `finalize-round <N>` - Auto-Mark Documents

**Purpose:** Automatically mark all documents modified in the last git commit as audited.

**Usage:**
```bash
# After committing fixes
git commit -m "Fix metadata for 10 documents (Round 216)"

# Mark all changed documents as audited
python3 scripts/maintenance/audit-documents.py finalize-round 216
```

**Output:**
```
✓ Marked 10 documents from Round 216 as audited:
  - abolition/Anarchist Communism.md
  - abolition/Black Bloc Tactics.md
  - contemporary-analysis/General Strike Guide.md
  ...

✓ Advanced to Round 217
```

**How It Works:**
1. Runs `git diff --name-only HEAD~1 HEAD` to get changed files
2. Filters for files in `docs/` directory ending in `.md`
3. Strips `docs/` prefix to get relative paths
4. Adds each to `audited_documents` array in audit log
5. Sets `quality_scores[path] = 'ok'`
6. Increments `current_round` by 1
7. Updates `last_updated` timestamp

**What if it doesn't detect files?**
- Ensure you've committed changes: `git log -1 --stat`
- Check that files are in `docs/` directory
- Verify files end in `.md`
- See Troubleshooting section below

---

### `check <file>` - Inspect Single Document

**Purpose:** Check a specific document for quality issues.

**Usage:**
```bash
python3 scripts/maintenance/audit-documents.py check docs/labor/general-strike.md
```

**Output:**
```json
{
  "title": "The General Strike: A Historical Analysis",
  "word_count": 4521,
  "line_count": 198,
  "issues": ["wikipedia_scrape"],
  "issue_count": 1
}
```

---

### `mark <file> <status>` - Manually Mark Document

**Purpose:** Manually mark a document as audited (rarely needed).

**Usage:**
```bash
python3 scripts/maintenance/audit-documents.py mark labor/general-strike.md ok
python3 scripts/maintenance/audit-documents.py mark housing/eviction.md flagged
```

**Status Options:**
- `ok` - Document is clean, metadata correct
- `flagged` - Needs human review (added to `flagged_for_review` array)
- `needs_work` - Identified issues but not yet fixed
- `off_topic` - Should be deleted

**When to use:**
- If `finalize-round` misses a file
- If you audit a document outside the normal workflow
- If you need to flag a document for later review

---

### `sample [N]` - Random Sample (Legacy)

**Purpose:** Get N random unaudited documents (old method, use `queue` instead).

**Usage:**
```bash
python3 scripts/maintenance/audit-documents.py sample 10
```

**Why `queue` is better:**
- Deterministic ordering
- Systematic coverage
- No chance of missing documents
- Predictable progress

---

### `issues` - Find Quality Problems

**Purpose:** Scan entire library for documents with quality issues.

**Usage:**
```bash
python3 scripts/maintenance/audit-documents.py issues
```

**Output:**
```
=== SCANNING FOR ISSUES ===

Issues found:

  very_long: 306 documents
  wikipedia_scrape: 336 documents
  table_heavy: 4 documents

Total documents with issues: 646
```

**Issue Types Detected:**
- `pdf_artifacts` - `![](_page_X_Picture_Y)` from PDF conversions
- `broken_anchors` - `[text](#page-X-Y)` internal links
- `empty_title` - Missing or blank title field
- `title_with_url` - URLs in title field
- `title_with_pipe` - Multiple pipes in title (scraping artifact)
- `very_short` - Less than 200 characters of content
- `very_long` - Over 100,000 characters (full books)
- `no_frontmatter` - Missing YAML frontmatter
- `multiple_frontmatter` - Duplicate frontmatter blocks
- `table_heavy` - More than 10 markdown tables
- `code_heavy` - More than 20 code blocks
- `broken_markdown` - Empty markdown links `[text]()`
- `wikipedia_scrape` - Wikipedia artifacts like `[1]`, `{{`, `[[`

---

## Complete Workflow Guide

### Step-by-Step Process

#### 1. Get Documents to Audit

```bash
cd /home/user/Projects/rstu-connect
python3 scripts/maintenance/audit-documents.py queue 10
```

This gives you the next 10 unaudited documents in alphabetical order.

#### 2. Review Each Document

For each document in the queue, read the first ~30 lines to see frontmatter and context:

```bash
head -30 "docs/abolition/Anarchist Communism.md"
```

**What to look for:**

```yaml
---
title: "Document Title"      # Check for completeness, accuracy
author: "Author Name"         # Check for placeholders
date: 2021                    # Check for errors (see Common Issues)
category: abolition           # Check if correct category
tags:                         # Check for specificity
  - anarchism
  - communism
---
```

#### 3. Fix Metadata Issues

Open documents with issues and correct them:

```bash
# Use your preferred editor
nano "docs/abolition/Anarchist Communism.md"
vim "docs/labor/general-strike.md"
code "docs/theory/mutual-aid.md"
```

**Common fixes:**
- Replace placeholder authors (`libcom.org` → actual author)
- Correct date errors (see Common Issues section)
- Move to correct category directory if needed
- Add missing fields
- Remove trailing punctuation
- Complete truncated titles
- Add specific tags

#### 4. Move Files if Category Wrong

```bash
# Move from contemporary-analysis to theory
mv "docs/contemporary-analysis/Mutual Aid.md" "docs/theory/Mutual Aid.md"

# Move from labor to historical
mv "docs/labor/1894 Coal Strike.md" "docs/historical/1894 Coal Strike.md"
```

#### 5. Commit Your Changes

```bash
# Stage all changes
git add docs/

# Commit with standard format
git commit -m "Fix metadata for 10 documents (Round 216)

Changes:
1. Anarchist Communism - Fixed libcom.org placeholder → Peter Kropotkin, date 2025→1927
2. Black Bloc Tactics - Added missing author, moved contemporary-analysis → organizing
3. General Strike Guide - Fixed trailing dash in author name, updated tags
4. Mutual Aid - Fixed placeholder, 5-year date error (2020→2015), moved to theory
5. Oakland General Strike - Fixed event date (1946) → publication date (2015), moved to historical
...

Common issues: Placeholder authors (3), date errors (2), wrong categories (2)
"
```

**Commit message format:**
```
Fix metadata for X documents (Round Y)

Changes:
1. Title - Brief description of fixes
2. Title - Brief description of fixes
...

Common issues: Summary of patterns
```

#### 6. Auto-Mark Documents as Audited

```bash
python3 scripts/maintenance/audit-documents.py finalize-round 216
```

**Verify success:**
```
✓ Marked 10 documents from Round 216 as audited:
  - abolition/Anarchist Communism.md
  - abolition/Black Bloc Tactics.md
  ...

✓ Advanced to Round 217
```

#### 7. Check Progress

```bash
python3 scripts/maintenance/audit-documents.py status
```

#### 8. Push to Deploy

```bash
git push origin main
```

This triggers GitHub Actions to rebuild the site with updated metadata.

#### 9. Repeat

Start over at step 1 with the next round!

---

## Common Metadata Issues

### 1. Placeholder Authors

**Most Frequent Placeholders:**

| Placeholder | Should Be | Frequency |
|-------------|-----------|-----------|
| `libcom.org` | Actual author from article | ~300+ |
| `Industrial Workers of the World` | Specific IWW branch/author | ~50+ |
| `Wikipedia contributors` | `Wikipedia` | ~30+ |
| `IWW` | Full organization name or author | ~20+ |
| `Unknown` | Research actual author | ~15+ |
| Username (e.g., `x409232`) | Website name or author | ~10+ |

**How to Fix:**
1. Open the document in browser or editor
2. Look for byline or attribution in first few lines
3. Check source URL if mentioned
4. If truly unknown, use publication/website name
5. If Wikipedia, use `Wikipedia` as author

**Examples:**

```yaml
# BEFORE
author: "libcom.org"

# AFTER
author: "Peter Gelderloos"
```

```yaml
# BEFORE
author: "Industrial Workers of the World"

# AFTER
author: "IWW Environmental Unionism Caucus"
```

---

### 2. Date Errors

#### A. Future Dates

**Problem:** Using placeholder dates for undated content.

```yaml
# BEFORE
date: 2025  # Future date placeholder

# AFTER
date: 2019  # Actual publication date found in article
```

**Common placeholders:** `2025`, `2026`, `'2025'`

#### B. Event Dates vs Publication Dates

**Problem:** Using the year of the historical event instead of when the article was written.

```yaml
# BEFORE - 38-year error
title: "The Iceland Women's Strike"
date: 1975  # Year of the strike

# AFTER
title: "The Iceland Women's Strike of 1975"
date: 2013  # When the analysis was published
```

**More examples:**
- 1894 coal miners strike → article from 1972 (78-year error)
- 1946 Oakland General Strike → article from 2010s (64-year error)
- 1975 Iceland strike → article from 2013 (38-year error)

**How to identify:**
- Very old date (1800s-1900s) for contemporary analysis
- Date matches event mentioned in title
- Date significantly predates writing style/references

#### C. Birth Years vs Publication Dates

**Problem:** Using subject's birth year instead of article publication date.

```yaml
# BEFORE - 112-year error
title: "Bayard Rustin: Organizer and Activist"
date: 1912  # Rustin's birth year

# AFTER
title: "Bayard Rustin: Organizer and Activist"
date: 2024  # Wikipedia article date
```

**More examples:**
- Emma Goldman (1869) → book published 1910 (41-year error)
- Murray Bookchin (1921) → book published 1991 (70-year error)

#### D. Historical Reference Dates

**Problem:** Using dates mentioned in content as publication date.

```yaml
# BEFORE - 73-year error
title: "How Western Mental Health Reinforces Capitalism"
date: 1952  # Year discussed in article

# AFTER
date: 2025  # Actual publication on Hood Communist
```

#### E. Quoted Date Formats

**Problem:** Dates wrapped in quotes (string instead of number).

```yaml
# BEFORE
date: '2021'  # String

# AFTER
date: 2021  # Number
```

**Why it matters:** YAML parsers treat these differently, affects sorting/filtering.

#### F. Extreme Date Errors Documented

| Document | Wrong Date | Correct Date | Error (years) |
|----------|------------|--------------|---------------|
| Bookchin "Urbanization Without Cities" | 1860 | 1991 | 131 |
| Engels "Principles of Communism" | 1969 | 1847 | 122 |
| Bayard Rustin biography | 1912 | 2024 | 112 |
| Hood Communist mental health article | 1952 | 2025 | 73 |
| Lenin "State and Revolution" | 1852 | 1917 | 65 |
| Trish Kahle austerity article | 1969 | 2016 | 47 |
| Iceland Women's Strike | 1975 | 2013 | 38 |
| "Drug War Capitalism" | 1980 | 2014 | 34 |

---

### 3. Wrong Categories

#### A. Contemporary-Analysis Overuse

**Problem:** Used as catch-all for anything that doesn't fit elsewhere.

**Should be moved:**

| If Document Is About... | Move To |
|------------------------|---------|
| Historical events/people | `historical` |
| Anarchist/socialist theory | `theory` |
| How-to organize | `organizing` |
| International movements | `international-solidarity` |
| Wikipedia reference articles | `theory` |
| Environmental/climate | `environmental-justice` |
| Housing/rent issues | `housing` |

**Examples:**

```bash
# Theory misplaced as contemporary-analysis
mv "docs/contemporary-analysis/Mutual Aid - Kropotkin.md" \
   "docs/theory/Mutual Aid - Kropotkin.md"

# Historical misplaced as contemporary-analysis
mv "docs/contemporary-analysis/Scotland Yardies.md" \
   "docs/historical/Scotland Yardies.md"

# Organizing guide misplaced
mv "docs/contemporary-analysis/Defend Your Community.md" \
   "docs/organizing/Defend Your Community.md"
```

#### B. Labor vs Historical

**Problem:** Historical strikes/events in `labor` instead of `historical`.

**Rule of thumb:**
- If it's a **historical event** (1800s-1900s) → `historical`
- If it's **contemporary labor organizing** (2000s+) → `labor`
- If it's **labor theory/analysis** → `theory` or `labor`

**Examples:**

```bash
# Historical strikes
mv "docs/labor/1894 Coal Miners Strike.md" \
   "docs/historical/1894 Coal Miners Strike.md"

mv "docs/labor/The Iceland Women's Strike 1975.md" \
   "docs/historical/The Iceland Women's Strike 1975.md"

# Keep in labor (contemporary)
# "docs/labor/Amazon Warehouse Organizing 2021.md" - CORRECT
```

#### C. Other Common Miscategorizations

```bash
# Arts/culture misplaced as labor
mv "docs/arts-culture-music/Workplace Heat Language School.md" \
   "docs/labor/Workplace Heat Language School.md"

# Abolition content in other categories
mv "docs/theory/Interview with Xinachtli.md" \
   "docs/abolition/Interview with Xinachtli.md"

# Housing in theory
mv "docs/theory/A Black Autonomy Reader.md" \
   "docs/housing/A Black Autonomy Reader.md"  # If housing-focused
```

---

### 4. Format Issues

#### A. Trailing Punctuation

```yaml
# BEFORE
author: "Ryan -"
author: "David Graeber -"

# AFTER
author: "Ryan"
author: "David Graeber"
```

#### B. Incomplete Titles

```yaml
# BEFORE
title: "From Democracy to"  # Truncated

# AFTER
title: "From Democracy to Freedom: The Difference Between Government and Self-Determination"
```

**How to find complete title:**
- Read document content
- Check filename
- Search online for complete title

#### C. Missing Quotes

```yaml
# BEFORE
title: Why misogynists make great Informants  # No quotes, inconsistent

# AFTER
title: "Why Misogynists Make Great Informants: How Gender Violence on the Left Enables State Violence"
```

**YAML quoting rules:**
- If title has colons `:` → MUST use quotes
- For consistency → ALWAYS use quotes for titles
- Single or double quotes both work

#### D. Generic Tags

```yaml
# BEFORE - Too generic
tags:
  - analysis
  - current-events
  - politics

# AFTER - Specific and searchable
tags:
  - police-abolition
  - prison-industrial-complex
  - Angela-Davis
  - transformative-justice
```

---

### 5. Corrupted Filenames

**Problem:** Files with hash codes, encoding errors, or metadata artifacts.

**Examples:**

```bash
# IPFS hashes
QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco.md

# Anna's Archive metadata
to-change-everything-an-anarchist-appeal-8677beaca38aba07c331c6e954705eb3.md

# Multiple spaces and double dashes
Class  War  --  Issue  4  --  1983.md

# Encoding issues
CrimethInc\_\_\_ Ex-Workers\' Collective.md
```

**How to fix:**

```bash
# Extract actual title from frontmatter/content
# Rename to clean, descriptive filename

mv "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco.md" \
   "To Change Everything - CrimethInc.md"

mv "Class  War  --  Issue  4  --  1983.md" \
   "Class War Issue 4 (1983).md"
```

**Filename conventions:**
- Use title (or shortened title) as filename
- Spaces are fine (not underscores)
- Use hyphens to separate title from author/date
- Format: `Title - Author.md` or `Title (Year).md`

---

### 6. Off-Topic Content

**Delete these categories:**
- Game development tutorials
- Fiction writing advice
- Random Wikipedia articles (geography, ancient history unrelated to organizing)
- Academic ML/AI papers
- Architecture journal articles
- Personal blogs about unrelated topics

**How to delete:**

```bash
# Delete file
rm "docs/contemporary-analysis/Ptolemy Geography.md"

# Include in commit message
git commit -m "Fix metadata for 8 documents, delete 2 off-topic (Round 216)

Deleted:
- Ptolemy Geography - Off-topic ancient history
- Unity Game Development - Off-topic tech tutorial
"
```

**When in doubt:**
- Does this help tenants organize?
- Is this relevant to housing justice, labor, abolition, or theory?
- Would a tenant find this useful in the RSTU reading library?

If no to all three → probably off-topic.

---

## Technical Details

### Audit Log Structure

**File:** `scripts/maintenance/audit-log.json`

```json
{
  "metadata": {
    "created": "2026-02-09",
    "last_updated": "2026-02-12",
    "total_documents": 2198,
    "audited_count": 6,
    "current_round": 216,
    "categories_audited": []
  },
  "audited_documents": [
    "abolition/7 Lies Police Have Told You About The Bristol Protests.md",
    "abolition/Abolition Democracy - Angela Y. Davis.md",
    ...
  ],
  "flagged_for_review": [],
  "quality_scores": {
    "abolition/7 Lies Police Have Told You About The Bristol Protests.md": "ok",
    "abolition/Abolition Democracy - Angela Y. Davis.md": "ok",
    ...
  }
}
```

**Fields:**

- `metadata.current_round` - Current round number (auto-increments)
- `metadata.audited_count` - Total audited (mirrors array length)
- `metadata.last_updated` - ISO date of last update
- `audited_documents` - Array of relative paths (from `docs/`)
- `flagged_for_review` - Documents needing human review
- `quality_scores` - Map of path → status (`ok`, `flagged`, etc.)

### How Tracking Works

1. **Load state:** Read `audit-log.json` into memory
2. **Filter unaudited:** Get all docs, exclude those in `audited_documents`
3. **Sort alphabetically:** Ensure deterministic ordering
4. **Return next N:** Slice first N documents
5. **Save state:** When marking audited, update JSON and write to disk

**Why it guarantees 100% coverage:**
- Every document either IS or IS NOT in `audited_documents`
- Queue only returns documents NOT in array
- Finalize adds documents TO array
- Mathematical certainty: all docs will eventually be added

**Why it guarantees zero duplicates:**
- Array membership is checked before queuing
- Documents already in array are filtered out
- No randomness - alphabetical order is deterministic

### Alphabetical Queue Ordering

**Why alphabetical?**
1. **Deterministic** - Same order every run
2. **Predictable** - Easy to know what's next
3. **Resume-friendly** - Pick up where you left off
4. **Organized** - Processes each category systematically

**How it's implemented:**
```python
all_docs = sorted(get_all_docs(), key=lambda p: str(p.relative_to(DOCS_DIR)))
unaudited = [d for d in all_docs if str(d.relative_to(DOCS_DIR)) not in audited]
queue = unaudited[:n]
```

**Result:**
- First processes `abolition/...` (alphabetically first)
- Then `arts-culture-music/...`
- Then `contemporary-analysis/...`
- And so on through all 14 categories

### Git Integration

**Command:** `finalize-round <N>`

**Git commands used:**
```bash
git diff --name-only HEAD~1 HEAD
```

**Returns:**
```
docs/abolition/Anarchist Communism.md
docs/labor/General Strike.md
src/components/Reading/ReadingList.tsx  # Ignored (not in docs/)
```

**Processing:**
1. Split output by newlines
2. Filter for lines starting with `docs/` and ending with `.md`
3. Strip `docs/` prefix → `abolition/Anarchist Communism.md`
4. Add to `audited_documents` array
5. Set `quality_scores[path] = 'ok'`

**Why it's safe:**
- Only looks at last commit (HEAD~1 to HEAD)
- Only processes markdown files in `docs/`
- Doesn't modify git history
- Read-only git operation

### Progress Calculation

**Total remaining:**
```
remaining = total_documents - audited_count
```

**Estimated rounds:**
```
rounds_at_10 = ceil(remaining / 10)
rounds_at_15 = ceil(remaining / 15)
rounds_at_20 = ceil(remaining / 20)
```

**Category progress:**
```
percentage = (audited_in_category / total_in_category) × 100
```

**Progress bar:**
```
filled = int(percentage / 5)  # Each char = 5%
bar = '█' * filled + '░' * (20 - filled)
```

---

## Examples

### Example 1: Complete Round Walkthrough

```bash
# 1. Start round
$ python3 scripts/maintenance/audit-documents.py queue 5

=== ROUND 216: NEXT 5 DOCUMENTS IN QUEUE ===

Progress: 6/2,198 (0.3%) | Remaining: 2,192

📄 abolition/Anarchist Communism.md
   Title: Anarchist Communism: Its Basis and Principles
   Words: 8,345 | Lines: 234
   Status: OK

📄 abolition/Black Autonomy Reader.md
   Title: A Black Autonomy Reader
   Words: 15,234 | Lines: 567
   Status: OK

# (... 3 more documents)

# 2. Check first document
$ head -30 docs/abolition/Anarchist\ Communism.md

---
title: "Anarchist Communism: Its Basis and Principles"
author: "libcom.org"          # ← PROBLEM: Placeholder
date: 2025                    # ← PROBLEM: Future date
category: abolition
tags:
  - anarchism
  - communism
---

# Anarchist Communism: Its Basis and Principles

By Peter Kropotkin (1927)    # ← Real author and date in content!

# 3. Fix the metadata
$ nano docs/abolition/Anarchist\ Communism.md

# Change to:
---
title: "Anarchist Communism: Its Basis and Principles"
author: "Peter Kropotkin"    # ← Fixed
date: 1927                    # ← Fixed
category: abolition
tags:
  - anarchism
  - communism
  - mutual-aid
  - kropotkin
---

# 4. Check second document
$ head -30 docs/abolition/Black\ Autonomy\ Reader.md

---
title: "A Black Autonomy Reader"
author: "libcom.org"
date: 2020
category: theory              # ← PROBLEM: Should be abolition or housing
tags:
  - black-liberation
  - housing
---

# 5. Fix and move to correct category
$ nano docs/abolition/Black\ Autonomy\ Reader.md

# Change author to actual compiler/publisher
# Verify date is correct
# Note: Already in correct category (abolition), just confirm

# 6. Continue for all 5 documents...

# 7. Commit changes
$ git add docs/
$ git commit -m "Fix metadata for 5 documents (Round 216)

Changes:
1. Anarchist Communism - Fixed libcom.org placeholder → Peter Kropotkin, future date 2025→1927
2. Black Autonomy Reader - Fixed placeholder author → Black Rose Anarchist Federation
3. ...

Common issues: Placeholder authors (3), future dates (2)
"

# 8. Auto-mark as audited
$ python3 scripts/maintenance/audit-documents.py finalize-round 216

✓ Marked 5 documents from Round 216 as audited:
  - abolition/Anarchist Communism.md
  - abolition/Black Autonomy Reader.md
  - abolition/...

✓ Advanced to Round 217

# 9. Check progress
$ python3 scripts/maintenance/audit-documents.py status

=== AUDIT STATUS ===

Total documents:    2,198
Audited:            11 (0.5%)
Remaining:          2,187
Current round:      217
Flagged for review: 0

# 10. Push
$ git push origin main
```

---

### Example 2: Before/After Metadata Fixes

#### Fix 1: Placeholder Author + Date Error

**Before:**
```yaml
---
title: "The Principles of Communism"
author: "Marxists Internet Archive"  # Transcriber, not author
date: 1969                           # Archive date, not publication
category: theory
---
```

**After:**
```yaml
---
title: "The Principles of Communism"
author: "Friedrich Engels"           # ← Fixed: Actual author
date: 1847                           # ← Fixed: 122-year error corrected
category: theory
---
```

#### Fix 2: Wrong Category + Event Date

**Before:**
```yaml
---
title: "The Iceland Women's Strike"
author: "Emma Dowling"
date: 1975                           # Year of strike, not article
category: labor                      # Should be historical
tags:
  - strikes
  - Iceland
---
```

**After:**
```yaml
---
title: "The Iceland Women's Strike of 1975"  # ← Clarified in title
author: "Emma Dowling"
date: 2013                           # ← Fixed: Publication date
category: historical                 # ← Moved: Historical event
tags:
  - strikes
  - Iceland
  - womens-strike
  - 1970s
  - historical-labor
---
```

#### Fix 3: Trailing Punctuation + Generic Tags

**Before:**
```yaml
---
title: Why misogynists make great Informants  # No quotes (has colon later)
author: "Courtney Desiree Morris -"          # Trailing dash
date: 2006                                    # Wrong date
category: contemporary-analysis               # Catch-all
tags:
  - analysis                                   # Too generic
  - gender
---
```

**After:**
```yaml
---
title: "Why Misogynists Make Great Informants: How Gender Violence on the Left Enables State Violence"
author: "Courtney Desiree Morris"            # ← Fixed: Removed dash
date: 2010                                    # ← Fixed: 4-year error
category: feminist-theory                     # ← Better category
tags:
  - sexual-violence                           # ← Specific tags
  - accountability
  - feminist-organizing
  - community-safety
  - patriarchy
---
```

---

### Example 3: Status Output Interpretation

```
=== AUDIT STATUS ===

Total documents:    2,198
Audited:            454 (20.7%)     ← You're 1/5 done!
Remaining:          1,744           ← 1,744 documents left
Current round:      260             ← On round 260
Flagged for review: 3               ← 3 docs need manual review

Progress by category:
  abolition                      164/164 (100.0%)  ████████████████████  ← COMPLETE!
  contemporary-analysis           54/354 ( 15.3%)  ███░░░░░░░░░░░░░░░░░  ← In progress
  labor                          120/357 ( 33.6%)  ███████░░░░░░░░░░░░░  ← Good progress
  theory                           0/372 (  0.0%)  ░░░░░░░░░░░░░░░░░░░░  ← Not started

Estimated completion:
  At 10 docs/round:  ~175 rounds remaining    ← Conservative estimate
  At 15 docs/round:  ~117 rounds remaining    ← Moderate pace
  At 20 docs/round:  ~88 rounds remaining     ← Aggressive pace
```

**Interpretation:**
- You've completed `abolition` category (100%)
- `labor` is 1/3 done
- `theory` hasn't started yet (alphabetically later)
- At current pace, roughly ~100-175 rounds left

---

## Troubleshooting

### Problem: `finalize-round` doesn't detect any files

**Symptoms:**
```
No documents found in last commit.
```

**Causes & Solutions:**

1. **No commit made yet**
   ```bash
   # Check git status
   git status

   # If changes are uncommitted
   git add docs/
   git commit -m "Fix metadata for 10 documents (Round 216)"
   ```

2. **Files not in `docs/` directory**
   ```bash
   # Check what was committed
   git log -1 --stat

   # Should see:
   docs/abolition/file.md | 2 +-
   docs/labor/file.md     | 3 +--
   ```

3. **Files don't end in `.md`**
   ```bash
   # Only .md files are tracked
   # .txt, .pdf, etc. are ignored
   ```

4. **Multiple commits since last finalize**
   ```bash
   # finalize-round looks at HEAD~1 (previous commit)
   # If you've made multiple commits, it only sees the last one

   # Solution: Manually mark older commits
   python3 scripts/maintenance/audit-documents.py mark path/to/file.md ok
   ```

---

### Problem: Need to manually mark documents

**When to use:**
- `finalize-round` missed a document
- Audited a document outside normal workflow
- Need to flag a document for review
- Fixing tracking state after an error

**How to mark:**
```bash
# Mark single document as ok
python3 scripts/maintenance/audit-documents.py mark abolition/file.md ok

# Mark as flagged for review
python3 scripts/maintenance/audit-documents.py mark housing/file.md flagged

# Mark multiple documents
python3 scripts/maintenance/audit-documents.py mark labor/file1.md ok
python3 scripts/maintenance/audit-documents.py mark labor/file2.md ok
python3 scripts/maintenance/audit-documents.py mark labor/file3.md ok
```

**Verify:**
```bash
python3 scripts/maintenance/audit-documents.py status
```

---

### Problem: Need to reset or fix tracking state

**Symptoms:**
- Audit log is corrupted
- Wrong round number
- Duplicate entries
- Need to start over

**Solutions:**

1. **Fix round number:**
   ```bash
   # Edit audit-log.json
   nano scripts/maintenance/audit-log.json

   # Change "current_round": 216 to correct number
   ```

2. **Remove duplicate entries:**
   ```bash
   # Edit audit-log.json
   nano scripts/maintenance/audit-log.json

   # In "audited_documents" array, remove duplicates
   # Save file
   ```

3. **Clear specific document:**
   ```bash
   # Edit audit-log.json
   nano scripts/maintenance/audit-log.json

   # Remove document path from "audited_documents" array
   # Remove entry from "quality_scores" object
   # Decrement "audited_count"
   ```

4. **Nuclear option - start over:**
   ```bash
   # ⚠️ WARNING: This erases all tracking!
   rm scripts/maintenance/audit-log.json

   # Next run will create fresh log
   python3 scripts/maintenance/audit-documents.py queue 10
   ```

---

### Problem: Queue returns fewer documents than requested

**Symptoms:**
```bash
python3 scripts/maintenance/audit-documents.py queue 100

# Only returns 45 documents
```

**Cause:** Not enough unaudited documents remaining.

**Solution:** This is normal near the end of the audit. The queue returns all remaining unaudited documents.

---

### Problem: Document appears in queue after already auditing it

**Symptoms:**
- You recognize a document you already fixed
- Round number seems wrong

**Causes:**

1. **Didn't run `finalize-round`**
   ```bash
   # After committing, you must run:
   python3 scripts/maintenance/audit-documents.py finalize-round <N>
   ```

2. **Edited file but didn't commit**
   ```bash
   # Check git status
   git status

   # Commit changes
   git add docs/
   git commit -m "..."
   ```

3. **Audit log not saved**
   ```bash
   # Check if audit-log.json updated
   git log -1 scripts/maintenance/audit-log.json

   # Should show recent commit
   ```

---

### Problem: Want to skip a document temporarily

**Solution:** Just don't fix it in this round. It will appear again in a future queue.

**Better solution:** Flag it for review:
```bash
python3 scripts/maintenance/audit-documents.py mark path/to/file.md flagged
```

Then check flagged documents later:
```bash
python3 scripts/maintenance/audit-documents.py status
# Shows: "Flagged for review: 3"
```

---

### Problem: Accidentally marked wrong document

**Solution:** Edit the audit log to remove it:

```bash
nano scripts/maintenance/audit-log.json
```

1. Find document path in `"audited_documents"` array
2. Delete that line
3. Find document in `"quality_scores"` object
4. Delete that entry
5. Decrement `"audited_count"` by 1
6. Save file

Document will reappear in queue.

---

## Tips & Best Practices

### Efficient Workflow

1. **Batch size:** 10-15 documents per round is sustainable
   - Too few (5): Many small commits, slow progress
   - Too many (25+): Harder to track, more errors

2. **Read first, fix later:**
   - Queue documents
   - Read all frontmatter first (just scan)
   - Fix all at once
   - Commit all together

3. **Use multiple terminal windows:**
   - Window 1: Python audit script
   - Window 2: Reading files (`head -30`)
   - Window 3: Editor for fixing
   - Window 4: Git commands

4. **Search for patterns:**
   ```bash
   # Find all libcom.org placeholders
   grep -r "author: \"libcom.org\"" docs/

   # Find all future dates
   grep -r "date: 2025" docs/
   ```

### Quality Checks

1. **Always verify dates:**
   - Read the first paragraph - does it mention the actual date?
   - Check for "Published on..." or "Written in..."
   - Search online if unclear

2. **Check author in document:**
   - Byline usually in first 5-10 lines
   - Look for "By [Name]" or "Author: [Name]"
   - Check bottom of document for attribution

3. **Verify category fits:**
   - Read enough content to understand topic
   - Don't just trust the filename
   - When in doubt, pick the most specific category

4. **Add specific tags:**
   - Avoid generic: `analysis`, `politics`, `activism`
   - Prefer specific: `rent-strike`, `eviction-defense`, `tenant-organizing`
   - Include proper nouns: `Oakland`, `KC-Tenants`, `Angela-Davis`

### Git Hygiene

1. **Commit messages matter:**
   ```bash
   # Good
   git commit -m "Fix metadata for 10 documents (Round 216)

   Changes:
   1. File A - Fixed X
   2. File B - Fixed Y

   Common issues: Placeholder authors (5), date errors (3)"

   # Bad
   git commit -m "fixes"
   git commit -m "metadata"
   ```

2. **One commit per round:**
   - Don't commit after each document
   - Batch all changes into one round commit
   - Makes `finalize-round` work correctly

3. **Always push after finalizing:**
   ```bash
   git push origin main
   ```
   - Triggers deployment
   - Backs up your work
   - Updates remote tracking

### Staying Organized

1. **Track your pace:**
   ```bash
   # Every 10 rounds, check status
   python3 scripts/maintenance/audit-documents.py status

   # Note your rate: docs per hour, rounds per session
   ```

2. **Take breaks:**
   - Metadata auditing is tedious
   - 20-30 documents in one session is plenty
   - Come back fresh

3. **Document weird cases:**
   - Found a 150-year date error? Note it in commit message
   - Deleted off-topic content? Explain why
   - Helps future auditors learn patterns

---

## Completion Checklist

**When you reach 100% audited:**

- [ ] Run final status check
  ```bash
  python3 scripts/maintenance/audit-documents.py status
  # Should show: Audited: 2,198 (100.0%)
  ```

- [ ] Verify no flagged documents remain
  ```bash
  # Check audit-log.json
  # "flagged_for_review" should be empty or resolved
  ```

- [ ] Rebuild manifest
  ```bash
  node scripts/build/generate-reading-manifest.js
  ```

- [ ] Test reading library
  ```bash
  npm run build
  npm run dev
  # Browse to /rstu-connect/reading
  # Check documents render correctly
  ```

- [ ] Update AUDIT-LOG.md
  - Mark project as complete
  - Add final statistics
  - Note any remaining issues

- [ ] Celebrate! You've audited 2,198 documents. 🎉

---

## Reference

### File Locations

```
scripts/maintenance/
├── audit-documents.py       # Main audit CLI tool
├── audit-log.json          # Persistent tracking state
└── AUDIT-TRACKING-GUIDE.md # This documentation

AUDIT-LOG.md                # Human-readable audit log (project root)

docs/                       # 2,198 markdown documents to audit
├── abolition/              # 164 documents
├── arts-culture-music/     # 49 documents
├── contemporary-analysis/  # 354 documents (needs triage)
├── ...                     # 11 more categories
```

### Categories (14 Total)

1. abolition (164)
2. arts-culture-music (49)
3. contemporary-analysis (354)
4. economic-alternatives (42)
5. environmental-justice (245)
6. feminist-theory (80)
7. historical (149)
8. housing (75)
9. international-solidarity (134)
10. labor (357)
11. notes (10)
12. organizing (101)
13. technology-digital-justice (32)
14. theory (372)
15. youth-student-organizing (33)
16. tenant-rights (1)

**Total:** 2,198 documents

### Links

- **Project repo:** https://github.com/cwcorella-git/rstu-connect
- **Reading library:** https://rstu-connect.neocities.org/reading
- **AUDIT-LOG.md:** Human-readable audit log at project root

---

**Last Updated:** February 12, 2026
**System Version:** 1.0 (Systematic Tracking)
**Status:** Active Development
