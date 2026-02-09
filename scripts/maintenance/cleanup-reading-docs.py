#!/usr/bin/env python3
"""
Clean up reading library documents by removing web scraping artifacts.

Issues fixed:
1. Metadata lines: "Title Date: Unknown Source: URL Tags: ..."
2. Bold metadata: "**Date:** ... **Source:** ... **Tags:**" (single or multi-line)
3. Duplicate titles after frontmatter
4. Web UI artifacts: "Donate Here", "Download PDF", "Print PDF"
5. Orphan intro paragraphs from web scraping
"""

import os
import re
import sys
from pathlib import Path

DOCS_DIR = Path("/home/user/Projects/rstu-connect/docs")

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

def is_metadata_line(line):
    """Check if a line is a metadata artifact line to remove."""
    stripped = line.strip()

    # Patterns that indicate metadata lines
    metadata_patterns = [
        r'^#+\s*\*\*Date:\*\*',           # ## **Date:** ...
        r'^\*\*Date:\*\*',                 # **Date:** ...
        r'^\*\*Source:\*\*',               # **Source:** ...
        r'^\*\*Tags?:\*\*',                # **Tags:** ...
        r'^Date:\s*(Unknown|\d)',          # Date: Unknown or Date: 2024
        r'^Source:\s*https?://',           # Source: https://...
        r'^Tags?:\s*[A-Za-z]',             # Tags: something
    ]

    for pattern in metadata_patterns:
        if re.match(pattern, stripped, re.IGNORECASE):
            return True

    return False

def is_web_artifact_line(line):
    """Check if a line is a web scraping artifact to remove."""
    stripped = line.strip()

    artifact_patterns = [
        r'^#+\s*Donate\s*Here.*$',
        r'^#+\s*Download.*PDF.*$',
        r'^#+\s*Print.*PDF.*$',
        r'^#+\s*Download\s*and\s*Print.*$',
        r'^Donate\s*Here\s*Download.*$',
        r'^Download\s*and\s*Print\s*PDF.*$',
        r'^Share\s+(this\s+)?(on\s+)?(Twitter|Facebook).*$',
        r'^Subscribe\s+to\s+our.*$',
        r'^Sign\s+up\s+for.*newsletter.*$',
    ]

    for pattern in artifact_patterns:
        if re.match(pattern, stripped, re.IGNORECASE):
            return True

    return False

def is_metadata_intro_line(line, fm_title):
    """Check if line is a metadata intro line (Title Date: Source: Tags:)."""
    stripped = line.strip()

    if 'Date:' in stripped and 'Source:' in stripped:
        parts = re.split(r'\s+Date:', stripped, maxsplit=1)
        if parts and fm_title:
            title_part = parts[0].strip()
            if similar_titles(title_part, fm_title):
                return True

    return False

def extract_real_content_from_metadata_line(line):
    """Try to extract real content concatenated with metadata."""
    stripped = line.strip()

    tags_match = re.search(r'Tags?:\s*[a-zA-Z0-9,\s\-]+?\s+([A-Z][a-z].*)', stripped)
    if tags_match:
        potential_content = tags_match.group(1).strip()
        if len(potential_content) > 50 and ' ' in potential_content:
            return potential_content

    url_match = re.search(r'Source:\s*https?://\S+\s+([A-Z][a-z].*)', stripped)
    if url_match:
        potential_content = url_match.group(1).strip()
        if not potential_content.startswith('Tags') and len(potential_content) > 50:
            return potential_content

    return None

def clean_document(filepath, verbose=False):
    """Clean a single document. Returns (was_modified, issues_found)."""
    with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
        content = f.read()

    original = content
    issues = []

    fm_match = re.match(r'^(---\n.*?\n---\n)(.*)', content, re.DOTALL)
    if not fm_match:
        return False, []

    frontmatter = fm_match.group(1)
    body = fm_match.group(2)
    fm_title = extract_frontmatter_title(content)

    lines = body.split('\n')
    new_lines = []
    skip_next_empty = False
    removed_intro = False
    in_metadata_block = False
    metadata_block_lines = 0

    for i, line in enumerate(lines):
        stripped = line.strip()

        # Skip excessive empty lines at start
        if not stripped and not new_lines:
            continue

        # Skip empty line after removed content
        if skip_next_empty and not stripped:
            skip_next_empty = False
            continue
        skip_next_empty = False

        # Check for duplicate title heading after frontmatter
        if stripped.startswith('#') and len([l for l in new_lines if l.strip()]) < 5:
            heading_text = re.sub(r'^#+\s*\**', '', stripped).rstrip('*').strip()

            # Also check for ## **Date:** style headings
            if re.match(r'^#+\s*\*\*Date:\*\*', stripped):
                issues.append(f"Removed metadata heading: {stripped[:40]}...")
                in_metadata_block = True
                metadata_block_lines = 0
                skip_next_empty = True
                continue

            if fm_title and similar_titles(heading_text, fm_title):
                issues.append(f"Removed duplicate title heading")
                skip_next_empty = True
                continue

        # If we're in a metadata block, keep removing metadata lines
        if in_metadata_block:
            if is_metadata_line(line) or not stripped:
                metadata_block_lines += 1
                if metadata_block_lines > 10:  # Safety limit
                    in_metadata_block = False
                continue
            else:
                # First non-metadata line ends the block
                in_metadata_block = False
                # Check if this line is a meaningful heading (author name, etc.)
                if stripped.startswith('##') and not is_metadata_line(line):
                    # This might be the actual content starting
                    new_lines.append(line)
                    continue

        # Check for standalone metadata lines (multi-line format)
        if is_metadata_line(line) and len([l for l in new_lines if l.strip()]) < 10:
            issues.append(f"Removed metadata line: {stripped[:40]}...")
            skip_next_empty = True
            continue

        # Check for web artifacts
        if is_web_artifact_line(line):
            issues.append(f"Removed web artifact: {stripped[:40]}...")
            skip_next_empty = True
            continue

        # Check for inline metadata intro lines
        if not removed_intro and 'Date:' in stripped and 'Source:' in stripped:
            if is_metadata_intro_line(line, fm_title):
                real_content = extract_real_content_from_metadata_line(stripped)
                if real_content:
                    issues.append(f"Extracted content from metadata line")
                    new_lines.append(real_content)
                else:
                    issues.append(f"Removed metadata intro line")
                removed_intro = True
                skip_next_empty = True
                continue

            # Bold metadata on single line
            bold_pattern = re.compile(
                r'\*\*Date:\*\*\s*[^\*]+\*\*Source:\*\*\s*\S+(?:\s*\*\*Tags?:\*\*[^\n]+)?',
                re.IGNORECASE
            )
            if bold_pattern.search(stripped):
                cleaned = bold_pattern.sub('', stripped).strip()
                if cleaned and len(cleaned) > 20:
                    issues.append(f"Cleaned bold metadata, kept content")
                    new_lines.append(cleaned)
                else:
                    issues.append(f"Removed bold metadata line")
                removed_intro = True
                skip_next_empty = True
                continue

        new_lines.append(line)

    new_body = '\n'.join(new_lines)
    new_body = re.sub(r'\n{4,}', '\n\n\n', new_body)
    new_body = '\n' + new_body.lstrip('\n')

    new_content = frontmatter + new_body

    if new_content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True, issues

    return False, []

def audit_documents():
    """Audit all documents and report issues."""
    total = 0
    issues_count = 0
    by_category = {}

    for filepath in sorted(DOCS_DIR.rglob("*.md")):
        total += 1
        with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
            content = f.read()

        issues = []

        body_match = re.search(r'^---\n.*?\n---\n(.*)$', content, re.DOTALL)
        if body_match:
            body = body_match.group(1)

            if re.search(r'Date:\s*(Unknown|[\d\-/]+)\s*Source:', body):
                issues.append("Has inline Date/Source metadata")

            if '**Date:**' in body and '**Source:**' in body:
                issues.append("Has bold Date/Source metadata")

            if re.search(r'^#+\s*\*\*Date:\*\*', body, re.MULTILINE):
                issues.append("Has multi-line bold metadata block")

            for artifact in ['Donate Here', 'Download PDF', 'Print PDF', 'Download and Print']:
                if artifact.lower() in body.lower():
                    issues.append(f"Has web artifact: {artifact}")
                    break

        if issues:
            issues_count += 1
            rel_path = filepath.relative_to(DOCS_DIR)
            category = rel_path.parts[0] if rel_path.parts else 'root'
            by_category[category] = by_category.get(category, 0) + 1

            print(f"{rel_path}")
            for issue in issues:
                print(f"  - {issue}")

    print(f"\n=== Summary ===")
    print(f"Total documents: {total}")
    print(f"Documents with issues: {issues_count}")
    print(f"\nBy category:")
    for cat, count in sorted(by_category.items(), key=lambda x: -x[1]):
        print(f"  {cat}: {count}")

def clean_all_documents(dry_run=True, limit=None):
    """Clean all documents."""
    total = 0
    modified = 0

    files = sorted(DOCS_DIR.rglob("*.md"))
    if limit:
        files = files[:limit]

    mode = "DRY RUN" if dry_run else "CLEANING"
    print(f"=== {mode}: Reading Library Cleanup ===\n")

    for filepath in files:
        total += 1

        if dry_run:
            with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
                content = f.read()

            body_match = re.search(r'^---\n.*?\n---\n(.*)$', content, re.DOTALL)
            if body_match:
                body = body_match.group(1)
                has_issues = (
                    re.search(r'Date:\s*(Unknown|[\d\-/]+)\s*Source:', body) or
                    ('**Date:**' in body and '**Source:**' in body) or
                    re.search(r'^#+\s*\*\*Date:\*\*', body, re.MULTILINE) or
                    any(a.lower() in body.lower() for a in ['Donate Here', 'Download PDF'])
                )
                if has_issues:
                    modified += 1
                    rel_path = filepath.relative_to(DOCS_DIR)
                    print(f"Would clean: {rel_path}")
        else:
            was_modified, issues = clean_document(filepath, verbose=True)
            if was_modified:
                modified += 1
                rel_path = filepath.relative_to(DOCS_DIR)
                print(f"Cleaned: {rel_path}")
                for issue in issues:
                    print(f"  - {issue}")

    print(f"\n=== Summary ===")
    print(f"Total documents: {total}")
    print(f"{'Would modify' if dry_run else 'Modified'}: {modified}")

def test_clean(filepath):
    """Test cleaning on a single file."""
    with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
        original = f.read()

    print("=== BEFORE (first 30 lines) ===")
    for i, line in enumerate(original.split('\n')[:30]):
        print(f"{i+1:3}: {line[:100]}")

    was_modified, issues = clean_document(filepath, verbose=True)

    if was_modified:
        with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
            cleaned = f.read()

        print("\n=== AFTER (first 30 lines) ===")
        for i, line in enumerate(cleaned.split('\n')[:30]):
            print(f"{i+1:3}: {line[:100]}")

        print(f"\n=== Issues Fixed ===")
        for issue in issues:
            print(f"  - {issue}")

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(original)
        print("\n(File restored to original for testing)")
    else:
        print("\nNo changes needed")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python cleanup-reading-docs.py [audit|dry-run|clean|test FILE]")
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
    elif cmd == "test" and len(sys.argv) > 2:
        test_clean(Path(sys.argv[2]))
    else:
        print(f"Unknown command: {cmd}")
        sys.exit(1)
