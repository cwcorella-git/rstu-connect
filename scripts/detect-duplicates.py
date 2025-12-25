#!/usr/bin/env python3
"""
Detect duplicate documents by matching title + author + date combinations.
"""

import re
import json
from pathlib import Path
from collections import defaultdict

def extract_frontmatter(content):
    """Extract YAML frontmatter from markdown content."""
    lines = content.split('\n')
    frontmatter = {}
    in_frontmatter = False
    frontmatter_lines = []

    for line in lines:
        if line.strip() == '---':
            if in_frontmatter:
                break
            else:
                in_frontmatter = True
                continue

        if in_frontmatter:
            frontmatter_lines.append(line)

    # Simple YAML parser for our use case
    i = 0
    while i < len(frontmatter_lines):
        line = frontmatter_lines[i]
        if ':' in line:
            key, value = line.split(':', 1)
            key = key.strip()
            value = value.strip().strip('"').strip("'")

            # Handle multiline strings (>-, |, >)
            if value in ('>', '>-', '|', '|-'):
                multiline_parts = []
                i += 1
                while i < len(frontmatter_lines):
                    next_line = frontmatter_lines[i]
                    # Check if we've hit another key
                    if next_line and not next_line[0].isspace() and ':' in next_line:
                        break
                    multiline_parts.append(next_line.strip())
                    i += 1
                value = ' '.join(p for p in multiline_parts if p)
                i -= 1  # Adjust for the outer loop increment

            frontmatter[key] = value
        i += 1

    return frontmatter

def normalize_string(s):
    """Normalize string for comparison."""
    if not s:
        return ""
    return s.lower().strip()

def main():
    """Detect duplicates in document library."""
    docs_dir = Path('docs')
    all_files = sorted(docs_dir.glob('**/*.md'))

    # Group by title+author+date
    groups = defaultdict(list)

    for filepath in all_files:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        frontmatter = extract_frontmatter(content)
        title = normalize_string(frontmatter.get('title', ''))
        author = normalize_string(frontmatter.get('author', ''))
        date = frontmatter.get('date', '').strip()

        # Create grouping key
        key = (title, author, date)
        groups[key].append(filepath)

    # Find duplicates (groups with > 1 file)
    duplicates = {k: v for k, v in groups.items() if len(v) > 1}

    if not duplicates:
        print("No duplicates found.")
        return 0

    print(f"Found {len(duplicates)} duplicate groups:\n")

    for (title, author, date), files in sorted(duplicates.items(), key=lambda x: len(x[1]), reverse=True):
        print(f"Title: {title}")
        print(f"Author: {author}")
        print(f"Date: {date}")
        print(f"Count: {len(files)}")
        for f in files:
            print(f"  - {f}")
        print()

    return 0

if __name__ == '__main__':
    import sys
    sys.exit(main())
