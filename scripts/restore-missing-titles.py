#!/usr/bin/env python3
"""
Restore missing title fields in markdown frontmatter by extracting h1 headers.
"""

import os
import re
import sys
from pathlib import Path

def extract_title_from_content(content):
    """Extract h1 header from markdown content."""
    lines = content.split('\n')
    in_frontmatter = False
    frontmatter_end = 0

    # Find where frontmatter ends
    for i, line in enumerate(lines):
        if line.strip() == '---':
            if in_frontmatter:
                frontmatter_end = i + 1
                break
            else:
                in_frontmatter = True

    # Find first h1 after frontmatter (skip overly long/malformed ones)
    for i in range(frontmatter_end, len(lines)):
        line = lines[i].strip()
        if line.startswith('# '):
            title = line[2:].strip()
            # Skip if title is suspiciously long (likely malformed)
            if len(title) > 150:
                return None
            # Skip if it looks like code/tables
            if '|' in title or '```' in title:
                return None
            return title

    return None

def add_title_to_frontmatter(filepath):
    """Add title field to frontmatter if missing."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Skip if title already exists
    if re.search(r'^title:', content, re.MULTILINE):
        return False, "Already has title"

    # Extract title from h1
    title = extract_title_from_content(content)
    if not title:
        return False, "No h1 header found"

    # Find frontmatter end
    lines = content.split('\n')
    frontmatter_end = 0
    in_frontmatter = False

    for i, line in enumerate(lines):
        if line.strip() == '---':
            if in_frontmatter:
                frontmatter_end = i
                break
            else:
                in_frontmatter = True

    if frontmatter_end == 0:
        return False, "No frontmatter found"

    # Insert title before closing ---
    lines.insert(frontmatter_end, f'title: "{title}"')
    new_content = '\n'.join(lines)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)

    return True, f"Added title: {title}"

def main():
    """Process all markdown files missing title field."""
    docs_dir = Path('docs')

    # Find all markdown files
    all_files = sorted(docs_dir.glob('**/*.md'))

    # Filter to those without title field
    files_to_fix = []
    for filepath in all_files:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            if not re.search(r'^title:', content, re.MULTILINE):
                files_to_fix.append(filepath)

    fixed = 0
    failed = 0
    skipped = 0

    for filepath in files_to_fix:
        try:
            success, message = add_title_to_frontmatter(filepath)
            if success:
                print(f"✓ {filepath}: {message}")
                fixed += 1
            else:
                print(f"⊘ {filepath}: {message}")
                skipped += 1
        except Exception as e:
            print(f"✗ {filepath}: Error - {e}")
            failed += 1

    print(f"\nSummary: {fixed} fixed, {skipped} skipped, {failed} failed out of {len(files_to_fix)} files")
    return 0 if failed == 0 else 1

if __name__ == '__main__':
    sys.exit(main())
