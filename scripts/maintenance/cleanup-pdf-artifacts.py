#!/usr/bin/env python3
"""
Cleanup PDF conversion artifacts from reading library documents.

Fixes:
1. PDF image placeholders: ![](_page_X_Picture_Y.jpeg)
2. Broken PDF anchor links: ](#page-X-Y)
3. Broken multiline YAML titles: title: >-
4. Markdown asterisks in YAML titles
5. Empty headings left behind
6. Reading time artifacts: "X–Y minutes" or "X min read"

Usage:
    python3 scripts/maintenance/cleanup-pdf-artifacts.py audit    # Show what would be fixed
    python3 scripts/maintenance/cleanup-pdf-artifacts.py dry-run  # Preview changes
    python3 scripts/maintenance/cleanup-pdf-artifacts.py clean    # Execute cleanup
"""

import os
import re
import sys
from pathlib import Path

DOCS_DIR = Path("docs")

# Patterns to fix
PATTERNS = {
    # PDF image placeholders: ![](_page_0_Picture_0.jpeg) or ![](_page_1_Figure_2.png)
    'pdf_images': re.compile(r'!\[\]\(_?page_\d+_(Picture|Figure)_\d+\.(jpeg|jpg|png)\)'),

    # Broken PDF anchor links: [text](#page-0-0) or [\[a\]](#page-6-0)
    'pdf_anchors': re.compile(r'\[(.*?)\]\(#page-\d+-\d+\)'),

    # Empty image refs that might be left: ![]()
    'empty_images': re.compile(r'!\[\]\(\s*\)'),

    # Reading time artifacts: "5–6 minutes" or "3 min read" at start of content
    'reading_time': re.compile(r'^\d+[–-]\d+\s+minutes?\s*$|^\d+\s+min\s+read\s*$', re.MULTILINE | re.IGNORECASE),

    # Orphan URL lines (just a URL on its own line, often from scraping)
    'orphan_urls': re.compile(r'^https?://[^\s]+\s*$', re.MULTILINE),

    # Empty headings: ## \n or ### \n
    'empty_headings': re.compile(r'^#{1,6}\s*$', re.MULTILINE),

    # Multiple consecutive blank lines (more than 2)
    'excess_blanks': re.compile(r'\n{4,}'),
}

def fix_yaml_title(content):
    """Fix broken multiline YAML titles and remove asterisks from titles."""
    changes = []

    # Fix broken multiline titles: title: >-\n  \n -> title: "Untitled"
    if re.search(r'^title:\s*>-\s*$', content, re.MULTILINE):
        # Try to extract title from first heading in content
        heading_match = re.search(r'^#\s+(.+)$', content, re.MULTILINE)
        if heading_match:
            new_title = heading_match.group(1).strip()
            # Clean the title
            new_title = re.sub(r'[*_`]', '', new_title)  # Remove markdown formatting
            new_title = new_title[:100]  # Truncate if too long
        else:
            new_title = "Untitled Document"

        content = re.sub(r'^title:\s*>-\s*\n\s*\n', f'title: "{new_title}"\n', content, flags=re.MULTILINE)
        changes.append(f"Fixed multiline title -> '{new_title}'")

    # Remove asterisks from titles: title: "*Civil Disobedience*" -> title: "Civil Disobedience"
    title_match = re.search(r'^title:\s*["\']?\*+([^*]+)\*+["\']?\s*$', content, re.MULTILINE)
    if title_match:
        clean_title = title_match.group(1).strip()
        content = re.sub(
            r'^title:\s*["\']?\*+[^*]+\*+["\']?\s*$',
            f'title: "{clean_title}"',
            content,
            flags=re.MULTILINE
        )
        changes.append(f"Removed asterisks from title -> '{clean_title}'")

    return content, changes

def clean_document(filepath, dry_run=False):
    """Clean a single document of PDF artifacts."""
    try:
        with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
            original = f.read()
    except Exception as e:
        return None, [f"Error reading: {e}"]

    content = original
    changes = []

    # Fix YAML title issues first
    content, title_changes = fix_yaml_title(content)
    changes.extend(title_changes)

    # Split into frontmatter and body
    if content.startswith('---'):
        parts = content.split('---', 2)
        if len(parts) >= 3:
            frontmatter = parts[1]
            body = parts[2]
        else:
            frontmatter = ""
            body = content
    else:
        frontmatter = ""
        body = content

    # Apply pattern fixes to body only (not frontmatter)

    # 1. Remove PDF image placeholders
    pdf_images = PATTERNS['pdf_images'].findall(body)
    if pdf_images:
        body = PATTERNS['pdf_images'].sub('', body)
        changes.append(f"Removed {len(pdf_images)} PDF image placeholders")

    # 2. Fix broken PDF anchor links - keep the text, remove the broken link
    pdf_anchors = PATTERNS['pdf_anchors'].findall(body)
    if pdf_anchors:
        body = PATTERNS['pdf_anchors'].sub(r'\1', body)
        changes.append(f"Fixed {len(pdf_anchors)} broken PDF anchor links")

    # 3. Remove empty image refs
    empty_imgs = PATTERNS['empty_images'].findall(body)
    if empty_imgs:
        body = PATTERNS['empty_images'].sub('', body)
        changes.append(f"Removed {len(empty_imgs)} empty image refs")

    # 4. Remove reading time artifacts (only near the top)
    lines = body.split('\n')
    new_lines = []
    removed_reading_time = 0
    for i, line in enumerate(lines):
        # Only check first 10 non-empty lines for reading time
        if i < 20 and PATTERNS['reading_time'].match(line.strip()):
            removed_reading_time += 1
            continue
        new_lines.append(line)
    if removed_reading_time:
        body = '\n'.join(new_lines)
        changes.append(f"Removed {removed_reading_time} reading time artifacts")

    # 5. Remove orphan URL lines (only at the very top, first 5 lines)
    lines = body.split('\n')
    new_lines = []
    removed_urls = 0
    for i, line in enumerate(lines):
        if i < 5 and PATTERNS['orphan_urls'].match(line):
            removed_urls += 1
            continue
        new_lines.append(line)
    if removed_urls:
        body = '\n'.join(new_lines)
        changes.append(f"Removed {removed_urls} orphan URL lines")

    # 6. Remove empty headings
    empty_headings = PATTERNS['empty_headings'].findall(body)
    if empty_headings:
        body = PATTERNS['empty_headings'].sub('', body)
        changes.append(f"Removed {len(empty_headings)} empty headings")

    # 7. Collapse excessive blank lines
    if PATTERNS['excess_blanks'].search(body):
        body = PATTERNS['excess_blanks'].sub('\n\n\n', body)
        changes.append("Collapsed excessive blank lines")

    # Reassemble document
    if frontmatter:
        new_content = f"---{frontmatter}---{body}"
    else:
        new_content = body

    # Only write if changes were made
    if changes and not dry_run:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)

    return changes if changes else None, []

def audit_documents():
    """Audit all documents for PDF artifacts."""
    stats = {
        'pdf_images': 0,
        'pdf_anchors': 0,
        'broken_titles': 0,
        'asterisk_titles': 0,
        'reading_time': 0,
        'empty_headings': 0,
    }
    files_with_issues = []

    for filepath in DOCS_DIR.rglob("*.md"):
        try:
            with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
                content = f.read()
        except:
            continue

        issues = []

        # Check for PDF images
        count = len(PATTERNS['pdf_images'].findall(content))
        if count:
            stats['pdf_images'] += count
            issues.append(f"{count} PDF images")

        # Check for PDF anchors
        count = len(PATTERNS['pdf_anchors'].findall(content))
        if count:
            stats['pdf_anchors'] += count
            issues.append(f"{count} PDF anchors")

        # Check for broken multiline titles
        if re.search(r'^title:\s*>-\s*$', content, re.MULTILINE):
            stats['broken_titles'] += 1
            issues.append("broken title")

        # Check for asterisk titles
        if re.search(r'^title:\s*["\']?\*+', content, re.MULTILINE):
            stats['asterisk_titles'] += 1
            issues.append("asterisk title")

        # Check for reading time
        if PATTERNS['reading_time'].search(content):
            stats['reading_time'] += 1
            issues.append("reading time")

        # Check for empty headings
        count = len(PATTERNS['empty_headings'].findall(content))
        if count:
            stats['empty_headings'] += count
            issues.append(f"{count} empty headings")

        if issues:
            rel_path = filepath.relative_to(DOCS_DIR)
            files_with_issues.append((rel_path, issues))

    print("=== PDF ARTIFACT AUDIT ===\n")
    print(f"PDF image placeholders:  {stats['pdf_images']:,}")
    print(f"Broken PDF anchor links: {stats['pdf_anchors']:,}")
    print(f"Broken multiline titles: {stats['broken_titles']}")
    print(f"Titles with asterisks:   {stats['asterisk_titles']}")
    print(f"Reading time artifacts:  {stats['reading_time']}")
    print(f"Empty headings:          {stats['empty_headings']:,}")
    print(f"\nTotal files with issues: {len(files_with_issues)}")

    if files_with_issues:
        print("\n--- Sample files ---")
        for path, issues in files_with_issues[:20]:
            print(f"  {path}: {', '.join(issues)}")
        if len(files_with_issues) > 20:
            print(f"  ... and {len(files_with_issues) - 20} more")

def run_cleanup(dry_run=False):
    """Run cleanup on all documents."""
    mode = "DRY RUN" if dry_run else "CLEANUP"
    print(f"=== {mode} ===\n")

    total_files = 0
    cleaned_files = 0
    total_changes = 0

    for filepath in sorted(DOCS_DIR.rglob("*.md")):
        total_files += 1
        changes, errors = clean_document(filepath, dry_run=dry_run)

        if errors:
            for err in errors:
                print(f"ERROR {filepath}: {err}")

        if changes:
            cleaned_files += 1
            total_changes += len(changes)
            rel_path = filepath.relative_to(DOCS_DIR)
            print(f"{'Would clean' if dry_run else 'Cleaned'}: {rel_path}")
            for change in changes:
                print(f"  - {change}")

    print(f"\n--- Summary ---")
    print(f"Total files scanned: {total_files}")
    print(f"Files {'to clean' if dry_run else 'cleaned'}: {cleaned_files}")
    print(f"Total changes: {total_changes}")

    if dry_run and cleaned_files > 0:
        print(f"\nRun 'python3 {sys.argv[0]} clean' to apply changes.")

def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    command = sys.argv[1].lower()

    if command == 'audit':
        audit_documents()
    elif command == 'dry-run':
        run_cleanup(dry_run=True)
    elif command == 'clean':
        response = input("This will modify documents. Continue? [y/N] ")
        if response.lower() == 'y':
            run_cleanup(dry_run=False)
        else:
            print("Aborted.")
    else:
        print(f"Unknown command: {command}")
        print(__doc__)
        sys.exit(1)

if __name__ == "__main__":
    main()
