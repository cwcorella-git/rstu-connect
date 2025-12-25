#!/usr/bin/env python3
"""
Find actual content duplicates by comparing document content.
Uses fuzzy matching on normalized content (ignoring formatting).
"""

import hashlib
import re
from pathlib import Path
from collections import defaultdict
from difflib import SequenceMatcher

def normalize_content(content):
    """Normalize content for comparison (remove formatting, extra whitespace)."""
    # Remove YAML frontmatter
    lines = content.split('\n')
    in_frontmatter = False
    content_lines = []

    for line in lines:
        if line.strip() == '---':
            if in_frontmatter:
                in_frontmatter = False
                continue
            else:
                in_frontmatter = True
                continue
        if not in_frontmatter:
            content_lines.append(line)

    text = '\n'.join(content_lines)

    # Remove markdown formatting
    text = re.sub(r'[*_`#\[\](){}]', '', text)

    # Collapse whitespace
    text = re.sub(r'\s+', ' ', text)

    # Convert to lowercase and strip
    text = text.lower().strip()

    return text

def content_hash(content):
    """Create SHA256 hash of normalized content."""
    normalized = normalize_content(content)
    return hashlib.sha256(normalized.encode()).hexdigest()

def similarity(s1, s2):
    """Calculate similarity ratio between two strings (0-1)."""
    return SequenceMatcher(None, s1, s2).ratio()

def main():
    """Find duplicate documents by content."""
    docs_dir = Path('docs')
    all_files = sorted(docs_dir.glob('**/*.md'))

    # Build content hash map
    hash_to_files = defaultdict(list)
    file_contents = {}

    for filepath in all_files:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        normalized = normalize_content(content)
        file_hash = hashlib.sha256(normalized.encode()).hexdigest()

        hash_to_files[file_hash].append(filepath)
        file_contents[filepath] = normalized[:500]  # Store first 500 chars for display

    # Find exact duplicates
    exact_duplicates = {h: files for h, files in hash_to_files.items() if len(files) > 1}

    print(f"Total documents: {len(all_files)}")
    print(f"Exact content duplicates found: {len(exact_duplicates)}")
    print(f"Total duplicate files: {sum(len(files) - 1 for files in exact_duplicates.values())}\n")

    if exact_duplicates:
        print("=" * 80)
        print("EXACT DUPLICATES (identical content, possibly different formatting)")
        print("=" * 80)

        for i, (file_hash, files) in enumerate(sorted(exact_duplicates.items(),
                                                       key=lambda x: len(x[1]),
                                                       reverse=True), 1):
            print(f"\nDuplicate Group {i}: {len(files)} files")
            print("-" * 80)
            for f in sorted(files):
                print(f"  {f}")
            print(f"Content preview: {file_contents[files[0]][:100]}...")
            print()
    else:
        print("No exact content duplicates found.\n")

    # Find near-duplicates (>90% similar)
    print("=" * 80)
    print("CHECKING FOR NEAR-DUPLICATES (>90% similar)...")
    print("=" * 80)

    near_duplicates = []
    checked = set()

    for i, file1 in enumerate(all_files):
        for file2 in all_files[i+1:]:
            pair = (file1, file2)
            if pair in checked:
                continue
            checked.add(pair)

            content1 = file_contents.get(file1, "")
            content2 = file_contents.get(file2, "")

            if content1 and content2:
                sim = similarity(content1, content2)
                if sim > 0.90:
                    # Get full content for better comparison
                    with open(file1) as f:
                        full1 = f.read()
                    with open(file2) as f:
                        full2 = f.read()

                    full_sim = similarity(normalize_content(full1),
                                         normalize_content(full2))

                    if full_sim > 0.90:
                        near_duplicates.append((full_sim, file1, file2))

    if near_duplicates:
        print(f"\nFound {len(near_duplicates)} near-duplicate pairs (>90% similar)\n")

        for similarity_score, file1, file2 in sorted(near_duplicates,
                                                     key=lambda x: x[0],
                                                     reverse=True):
            print(f"Similarity: {similarity_score:.1%}")
            print(f"  {file1}")
            print(f"  {file2}")
            print()
    else:
        print("\nNo near-duplicates found (>90% similarity).\n")

if __name__ == '__main__':
    import sys
    sys.exit(main())
