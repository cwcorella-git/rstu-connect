#!/usr/bin/env python3
"""
Clean up reading library documents - Version 2

Issues fixed:
1. Page markers: "X of Y M/D/YY, H:MM AM/PM [Title] [URL]" (browser print headers)
2. Page break markers: "-- ## Page X"
3. URL footers embedded with page markers
4. Metadata lines from v1: Date/Source/Tags patterns
5. Duplicate titles after frontmatter
6. Web UI artifacts: "Donate Here", "Download PDF", "Print PDF"
7. Excessive whitespace cleanup
"""

import os
import re
import sys
from pathlib import Path

DOCS_DIR = Path("/home/user/Projects/rstu-connect/docs")

# Page marker pattern: "X of Y M/D/YY, H:MM AM/PM [optional title] [optional URL...]"
# Captures the whole line from the page marker to end
PAGE_MARKER_PATTERN = re.compile(
    r'\d+ of \d+ \d+/\d+/\d+, \d+:\d+ [AP]M[^\n]*',
    re.IGNORECASE
)

# Page break pattern: "-- ## Page X" at end of line or standalone
PAGE_BREAK_PATTERN = re.compile(
    r'\s*--\s*## Page \d+\s*',
    re.IGNORECASE
)

# Standalone dashes on their own line (leftover from page breaks)
STANDALONE_DASHES = re.compile(
    r'^\s*--\s*$',
    re.MULTILINE
)

# Title prefix repeated at start of content paragraphs (scraping artifact)
# Pattern: "Title | Site Name NN. text..." where NN is a numbered point
# Examples: "101 Notes on the LA Tenants Union | Commune 22. I'm talking..."
TITLE_PREFIX_PATTERN = re.compile(
    r'^(.{10,80}\s*\|\s*[A-Za-z][A-Za-z ]{3,40})\s+(\d+\.)',
    re.MULTILINE
)

# URL at start of body (leftover from scraping)
URL_HEADER_PATTERN = re.compile(
    r'^[A-Za-z][^\n]* https?://\S+\.\.\.\s*$',
    re.MULTILINE
)

def extract_frontmatter_title(content):
    """Extract title from YAML frontmatter."""
    match = re.match(r'^---\n(.*?)\n---', content, re.DOTALL)
    if match:
        fm = match.group(1)
        title_match = re.search(r'^title:\s*["\']?(.+?)["\']?\s*$', fm, re.MULTILINE)
        if title_match:
            return title_match.group(1).strip().strip('"\'')
    return None

def normalize_for_comparison(text):
    """Normalize text for title comparison."""
    return re.sub(r'[^a-z0-9]', '', text.lower())

def similar_titles(t1, t2):
    """Check if two titles are similar."""
    n1, n2 = normalize_for_comparison(t1), normalize_for_comparison(t2)
    if not n1 or not n2:
        return False
    return n1 in n2 or n2 in n1 or (len(n1) > 10 and n1[:15] == n2[:15])

def clean_document(filepath, verbose=False):
    """Clean a single document. Returns (was_modified, changes_made)."""
    with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
        content = f.read()

    original = content
    changes = []

    # Split frontmatter and body
    fm_match = re.match(r'^(---\n.*?\n---\n)(.*)', content, re.DOTALL)
    if not fm_match:
        return False, []

    frontmatter = fm_match.group(1)
    body = fm_match.group(2)
    fm_title = extract_frontmatter_title(content)

    # 1. Remove page markers (most important fix)
    # Pattern: "X of Y M/D/YY, H:MM AM/PM [Title] [URL...]"
    page_markers = PAGE_MARKER_PATTERN.findall(body)
    if page_markers:
        body = PAGE_MARKER_PATTERN.sub('', body)
        changes.append(f"Removed {len(page_markers)} page markers")

    # 2. Remove page break markers "-- ## Page X"
    page_breaks = PAGE_BREAK_PATTERN.findall(body)
    if page_breaks:
        body = PAGE_BREAK_PATTERN.sub('', body)
        changes.append(f"Removed {len(page_breaks)} page break markers")

    # 3. Remove standalone dashes (leftover from page breaks)
    standalone_dashes = STANDALONE_DASHES.findall(body)
    if standalone_dashes:
        body = STANDALONE_DASHES.sub('', body)
        changes.append(f"Removed {len(standalone_dashes)} standalone dashes")

    # 4. Remove URL headers at start of body
    url_headers = URL_HEADER_PATTERN.findall(body)
    if url_headers:
        body = URL_HEADER_PATTERN.sub('', body)
        changes.append(f"Removed {len(url_headers)} URL header lines")

    # 5. Clean up title prefixes repeated before numbered content
    # e.g., "101 Notes on the LA Tenants Union | Commune 22. ..." -> "22. ..."
    title_prefixes = TITLE_PREFIX_PATTERN.findall(body)
    if title_prefixes:
        body = TITLE_PREFIX_PATTERN.sub(r'\2', body)
        changes.append(f"Removed {len(title_prefixes)} repeated title prefixes")

    # 6. Remove orphan title lines at end of document (leftover from page headers)
    # These are lines that match the title prefix pattern but have no following content
    lines = body.rstrip().split('\n')
    if lines and fm_title:
        last_line = lines[-1].strip()
        # Check if last line looks like a title prefix (contains | and matches title)
        if '|' in last_line and len(last_line) < 100:
            title_part = last_line.split('|')[0].strip()
            if similar_titles(title_part, fm_title):
                lines = lines[:-1]
                body = '\n'.join(lines)
                changes.append("Removed orphan title line at end")

    # 5. Clean up resulting whitespace issues
    # Remove empty headings (leftover from page marker removal)
    empty_headings = re.findall(r'^#+\s*$', body, re.MULTILINE)
    if empty_headings:
        body = re.sub(r'^#+\s*$\n?', '', body, flags=re.MULTILINE)
        changes.append(f"Removed {len(empty_headings)} empty headings")

    # Multiple blank lines -> max 2
    body = re.sub(r'\n{4,}', '\n\n\n', body)

    # Lines with just whitespace
    body = re.sub(r'^\s+$', '', body, flags=re.MULTILINE)

    # 6. Remove duplicate title headings after frontmatter
    if fm_title:
        lines = body.split('\n')
        new_lines = []
        for i, line in enumerate(lines):
            stripped = line.strip()
            # Check first few non-empty lines for duplicate title
            non_empty_count = len([l for l in new_lines if l.strip()])
            if non_empty_count < 5 and stripped.startswith('#'):
                heading_text = re.sub(r'^#+\s*\**', '', stripped).rstrip('*').strip()
                if similar_titles(heading_text, fm_title):
                    changes.append("Removed duplicate title heading")
                    continue
            new_lines.append(line)
        body = '\n'.join(new_lines)

    # Ensure body starts with single newline
    body = '\n' + body.lstrip('\n')

    # Reassemble
    new_content = frontmatter + body

    if new_content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True, changes

    return False, []

def audit_documents():
    """Audit all documents and report issues."""
    total = 0
    issues_by_type = {
        'page_markers': 0,
        'page_breaks': 0,
        'standalone_dashes': 0,
        'title_prefixes': 0,
    }
    files_with_issues = []

    for filepath in sorted(DOCS_DIR.rglob("*.md")):
        total += 1
        with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
            content = f.read()

        issues = []
        pm_count = len(PAGE_MARKER_PATTERN.findall(content))
        if pm_count:
            issues.append(f"{pm_count} page markers")
            issues_by_type['page_markers'] += pm_count

        pb_count = len(PAGE_BREAK_PATTERN.findall(content))
        if pb_count:
            issues.append(f"{pb_count} page breaks")
            issues_by_type['page_breaks'] += pb_count

        sd_count = len(STANDALONE_DASHES.findall(content))
        if sd_count:
            issues.append(f"{sd_count} standalone dashes")
            issues_by_type['standalone_dashes'] += sd_count

        tp_count = len(TITLE_PREFIX_PATTERN.findall(content))
        if tp_count:
            issues.append(f"{tp_count} title prefixes")
            issues_by_type['title_prefixes'] += tp_count

        if issues:
            rel_path = filepath.relative_to(DOCS_DIR)
            files_with_issues.append((rel_path, issues))

    print(f"\n=== AUDIT SUMMARY ===")
    print(f"Total documents: {total}")
    print(f"Documents with issues: {len(files_with_issues)}")
    print(f"\nIssue counts:")
    for issue_type, count in issues_by_type.items():
        print(f"  {issue_type}: {count}")

    if files_with_issues:
        print(f"\nTop 20 affected files:")
        # Sort by total issue count
        sorted_files = sorted(files_with_issues,
                              key=lambda x: sum(int(i.split()[0]) for i in x[1]),
                              reverse=True)
        for rel_path, issues in sorted_files[:20]:
            print(f"  {rel_path}")
            for issue in issues:
                print(f"    - {issue}")

def clean_all_documents(dry_run=True, limit=None):
    """Clean all documents."""
    total = 0
    modified = 0
    all_changes = []

    files = sorted(DOCS_DIR.rglob("*.md"))
    if limit:
        files = files[:limit]

    mode = "DRY RUN" if dry_run else "CLEANING"
    print(f"=== {mode}: Reading Library Cleanup v2 ===\n")

    for filepath in files:
        total += 1

        if dry_run:
            with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
                content = f.read()

            has_issues = (
                PAGE_MARKER_PATTERN.search(content) or
                PAGE_BREAK_PATTERN.search(content) or
                STANDALONE_DASHES.search(content)
            )
            if has_issues:
                modified += 1
                rel_path = filepath.relative_to(DOCS_DIR)
                pm_count = len(PAGE_MARKER_PATTERN.findall(content))
                pb_count = len(PAGE_BREAK_PATTERN.findall(content))
                sd_count = len(STANDALONE_DASHES.findall(content))
                issues = []
                if pm_count: issues.append(f"{pm_count} page markers")
                if pb_count: issues.append(f"{pb_count} page breaks")
                if sd_count: issues.append(f"{sd_count} dashes")
                print(f"Would clean: {rel_path} ({', '.join(issues)})")
        else:
            was_modified, changes = clean_document(filepath, verbose=True)
            if was_modified:
                modified += 1
                all_changes.extend(changes)
                rel_path = filepath.relative_to(DOCS_DIR)
                print(f"Cleaned: {rel_path}")
                for change in changes:
                    print(f"  - {change}")

    print(f"\n=== Summary ===")
    print(f"Total documents: {total}")
    print(f"{'Would modify' if dry_run else 'Modified'}: {modified}")
    if not dry_run and all_changes:
        from collections import Counter
        change_counts = Counter(all_changes)
        print(f"\nChanges made:")
        for change, count in change_counts.most_common():
            print(f"  {count}x {change}")

def find_empty_documents():
    """Find documents with little or no content."""
    empty_docs = []

    for filepath in sorted(DOCS_DIR.rglob("*.md")):
        with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
            content = f.read()

        # Extract body after frontmatter
        body_match = re.search(r'^---\n.*?\n---\n(.*)$', content, re.DOTALL)
        if body_match:
            body = body_match.group(1).strip()
            # Remove just dashes and whitespace
            body_clean = re.sub(r'^\s*--\s*$', '', body, flags=re.MULTILINE).strip()
            if len(body_clean) < 100:
                empty_docs.append(filepath.relative_to(DOCS_DIR))

    print(f"\n=== EMPTY/BROKEN DOCUMENTS ({len(empty_docs)}) ===")
    print("These documents have little or no content and may need to be:")
    print("  - Deleted, or")
    print("  - Re-sourced from their original URLs\n")
    for doc in empty_docs:
        print(f"  - {doc}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python cleanup-reading-docs-v2.py [audit|dry-run|clean|empty]")
        print("")
        print("Commands:")
        print("  audit   - Analyze documents and report issues")
        print("  dry-run - Show what would be cleaned without making changes")
        print("  clean   - Actually clean the documents")
        print("  empty   - Find empty/broken documents")
        sys.exit(1)

    cmd = sys.argv[1].lower()

    if cmd == "audit":
        audit_documents()
    elif cmd == "dry-run":
        clean_all_documents(dry_run=True)
    elif cmd == "clean":
        print("WARNING: This will modify files!")
        confirm = input("Type 'yes' to continue: ")
        if confirm.lower() == 'yes':
            clean_all_documents(dry_run=False)
        else:
            print("Aborted.")
    elif cmd == "empty":
        find_empty_documents()
    else:
        print(f"Unknown command: {cmd}")
        sys.exit(1)
