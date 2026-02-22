# Document Library Metadata Audit Workflow

## Overview

This workflow systematically audits markdown documents with YAML frontmatter to ensure consistent, accurate metadata. It uses a Python CLI tool for tracking progress and guarantees 100% coverage with zero duplicates.

---

## 1. Tracking System

### Core Files
- **`scripts/maintenance/audit-documents.py`** - CLI tool for queue management
- **`scripts/maintenance/audit-log.json`** - Persistent state tracking

### CLI Commands
```bash
# Get next N documents to audit (alphabetically sorted)
python3 scripts/maintenance/audit-documents.py queue 10

# Mark changed files as audited after commit
python3 scripts/maintenance/audit-documents.py finalize-round N

# Check progress
python3 scripts/maintenance/audit-documents.py status
```

### JSON State Structure
```json
{
  "metadata": {
    "current_round": 237,
    "audited_count": 196
  },
  "audited_documents": [
    "category/filename.md",
    ...
  ]
}
```

---

## 2. What I Check For

### A. Title Issues

| Issue | Example | Fix |
|-------|---------|-----|
| Missing quotes | `title: My Title` | `title: "My Title"` |
| Truncated title | `title: "The Origins of..."` | Complete from filename or content |
| Author in title | `title: "Article Name - John Smith"` | Remove author, put in author field |
| Content fragment as title | `title: "It arises fairly frequently..."` | Use filename as title source |
| Trailing punctuation artifacts | `title: "Episode 34: Topic/"` | Remove trailing slash |

### B. Author Issues

| Issue | Example | Fix |
|-------|---------|-----|
| Placeholder author | `author: "libcom.org"` | Find actual author in content |
| Placeholder author | `author: "Industrial Workers of the World"` | Check byline in document |
| Trailing dash | `author: "IWW Ireland -"` | `author: "IWW Ireland"` |
| Missing author field | (no author line) | Add `author: "Actual Author"` |
| Wrong attribution | `author: "Karl Marx"` (on 2020 article) | Research correct author |

### C. Date Issues

| Issue | Example | Fix |
|-------|---------|-----|
| Future placeholder | `date: '2025'` or `date: 2025` | Research actual publication date |
| Impossible date | `date: 1917` (for article about 1960s) | Use context clues to correct |
| Wrong format | `date: '2025-08-15'` | `date: 2025` (year only preferred) |
| Movement start vs article date | Wikipedia article dated to 1852 | Date when movement started or article written |

### D. Category Issues

| Issue | Example | Fix |
|-------|---------|-----|
| Misclassified content | Digital rights article in `abolition/` | Move to `technology-digital-justice/` |
| Category mismatch | File in `abolition/`, frontmatter says `contemporary-analysis` | Align frontmatter with directory |

### E. Content Issues (Less Common)

| Issue | Example | Fix |
|-------|---------|-----|
| Duplicate documents | Two files with same content | Delete inferior version |
| Browser artifacts in content | `about:reader?url=https%3A...` | Remove artifact lines |
| Broken Wikipedia formatting | `decorative](https://...` | Usually leave for content cleanup pass |

---

## 3. Workflow Per Round

### Step 1: Get Queue
```bash
python3 scripts/maintenance/audit-documents.py queue 10
```

Output shows:
- File path
- Current title (truncated)
- Word count
- Status flags (OK, very_long, wikipedia_scrape)

### Step 2: Read Frontmatter

For files with normal characters:
```bash
head -15 "docs/category/filename.md"
```

For files with special characters (curly quotes, unicode):
```bash
find docs/category -name "*partial-name*" -exec head -15 {} \;
```

### Step 3: Fix Issues

**Using Edit tool** (when Read tool works):
```
Read the file first, then use Edit tool to replace old_string with new_string
```

**Using sed** (for files with special characters in filename):
```bash
# Fix title
find docs/category -name "*pattern*" -exec sed -i 's/^title: .*$/title: "Correct Title"/' {} \;

# Fix author
find docs/category -name "*pattern*" -exec sed -i 's/^author: "placeholder"$/author: "Real Author"/' {} \;

# Fix date
find docs/category -name "*pattern*" -exec sed -i 's/^date: 1917$/date: 2020/' {} \;

# Add missing author after title line
find docs/category -name "*pattern*" -exec sed -i '/^title:/a author: "Author Name"' {} \;
```

**Moving files to correct category**:
```bash
git mv "docs/wrong-category/file.md" "docs/correct-category/file.md"
```

**Deleting duplicates**:
```bash
rm "docs/category/duplicate-file.md"
```

### Step 4: Commit Changes
```bash
git add -A && git commit -m "$(cat <<'EOF'
Fix metadata for N documents (Round X)

- file1.md: Description of fix
- file2.md: Description of fix
...

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

### Step 5: Finalize Round
```bash
python3 scripts/maintenance/audit-documents.py finalize-round N
```

This auto-detects changed files from git diff and marks them as audited.

### Step 6: Add Clean Documents

For documents that needed no changes (finalize-round misses them):
```python
python3 << 'EOF'
import json
from pathlib import Path

log_path = Path('scripts/maintenance/audit-log.json')
docs_dir = Path('docs')

with open(log_path) as f:
    log = json.load(f)

# Patterns for clean docs from this round
patterns = ['Partial Name 1', 'Partial Name 2']

for doc in docs_dir.rglob('*.md'):
    rel = str(doc.relative_to(docs_dir))
    if any(p in rel for p in patterns):
        if rel not in log['audited_documents']:
            log['audited_documents'].append(rel)
            print(f"Adding: {rel}")

log['metadata']['audited_count'] = len(log['audited_documents'])
log['metadata']['current_round'] += 1

with open(log_path, 'w') as f:
    json.dump(log, f, indent=2, ensure_ascii=False)
EOF
```

### Step 7: Commit Audit Log & Push
```bash
git add scripts/maintenance/audit-log.json
git commit -m "Update audit log: Round N complete (X/Y audited)"
git push origin main
```

---

## 4. Common Patterns by Source

### libcom.org Scrapes
- Author often `"libcom.org"` → check for actual author in content
- May have `## **Tags:** ...` artifacts in body
- Dates sometimes placeholder `2025`

### Wikipedia Articles
- Author should be `"Wikipedia contributors"`
- Date should be article subject date OR scrape date, be consistent
- Often have broken link formatting: `text](url)` fragments

### IWW/Ecology Articles
- Author often `"Industrial Workers of the World"` → check byline
- May have `## **Source:** URL` header artifacts
- Author sometimes has trailing dash: `"Name -"`

### Academic Papers (Project MUSE, JSTOR)
- Usually have good metadata
- Check date matches publication year

### Book Excerpts (Anna's Archive)
- Title often just author name → use actual book title
- Long filenames with ISBN/hash → title should be clean

### Video Transcripts
- May have timestamp artifacts: `0:00 Text 0:04 More text`
- Title sometimes content fragment → use filename
- Author often missing → may be Unknown

---

## 5. The Python CLI Tool

Here's a minimal version of the audit tool:

```python
#!/usr/bin/env python3
"""Document library metadata audit tool."""

import json
import subprocess
from pathlib import Path

DOCS_DIR = Path("docs")
LOG_PATH = Path("scripts/maintenance/audit-log.json")

def load_log():
    if LOG_PATH.exists():
        with open(LOG_PATH) as f:
            return json.load(f)
    return {"metadata": {"current_round": 1, "audited_count": 0}, "audited_documents": []}

def save_log(log):
    with open(LOG_PATH, "w") as f:
        json.dump(log, f, indent=2, ensure_ascii=False)

def get_queue(n):
    """Get next N unaudited documents, alphabetically sorted."""
    log = load_log()
    audited = set(log["audited_documents"])

    all_docs = sorted(DOCS_DIR.rglob("*.md"))
    queue = []

    for doc in all_docs:
        rel = str(doc.relative_to(DOCS_DIR))
        if rel not in audited:
            queue.append(rel)
            if len(queue) >= n:
                break

    return queue

def finalize_round(round_num):
    """Mark documents changed in last commit as audited."""
    result = subprocess.run(
        ["git", "diff", "--name-only", "HEAD~1", "HEAD", "--", "docs/"],
        capture_output=True, text=True
    )

    changed = [f.replace("docs/", "") for f in result.stdout.strip().split("\n") if f]

    log = load_log()
    for doc in changed:
        if doc and doc not in log["audited_documents"]:
            log["audited_documents"].append(doc)

    log["metadata"]["audited_count"] = len(log["audited_documents"])
    log["metadata"]["current_round"] = round_num + 1
    save_log(log)

    return changed

def status():
    """Show audit progress."""
    log = load_log()
    total = len(list(DOCS_DIR.rglob("*.md")))
    audited = log["metadata"]["audited_count"]
    return {
        "total": total,
        "audited": audited,
        "remaining": total - audited,
        "percent": round(audited / total * 100, 1)
    }

if __name__ == "__main__":
    import sys
    cmd = sys.argv[1] if len(sys.argv) > 1 else "status"

    if cmd == "queue":
        n = int(sys.argv[2]) if len(sys.argv) > 2 else 10
        for doc in get_queue(n):
            print(doc)
    elif cmd == "finalize-round":
        round_num = int(sys.argv[2])
        changed = finalize_round(round_num)
        print(f"Marked {len(changed)} documents as audited")
    elif cmd == "status":
        s = status()
        print(f"Audited: {s['audited']}/{s['total']} ({s['percent']}%)")
```

---

## 6. Adapting for Another Library

To apply this to a different markdown library:

1. **Copy the audit script** and update `DOCS_DIR` path
2. **Create empty audit-log.json**: `{"metadata": {"current_round": 1, "audited_count": 0}, "audited_documents": []}`
3. **Identify your common issues** - run through 2-3 rounds manually to spot patterns
4. **Document source-specific patterns** - different scrape sources have different artifacts
5. **Decide on standards**:
   - Quote style for YAML strings?
   - Date format (year only vs full date)?
   - How to handle missing authors?
   - Category taxonomy?

---

## 7. Time Estimates

From experience with this library:
- **Clean rounds** (all metadata OK): ~2-3 minutes per 10 docs
- **Light rounds** (1-3 fixes): ~5-7 minutes per 10 docs
- **Heavy rounds** (5+ fixes): ~10-15 minutes per 10 docs

At 10 docs/round with ~2,200 documents: ~220 rounds total.
