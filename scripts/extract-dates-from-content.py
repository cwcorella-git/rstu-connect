#!/usr/bin/env python3
"""
Extract dates from document content for documents missing date metadata.
Searches the first 1500 characters of each document for date patterns.
"""

import json
import os
import re
from pathlib import Path

# Load the list of documents missing dates
MISSING_DATES_FILE = Path('/home/user/Projects/rstu-connect/data/docs-missing-date.json')
DOCS_DIR = Path('/home/user/Projects/rstu-connect/docs')
OUTPUT_FILE = Path('/home/user/Projects/rstu-connect/data/content-extracted-dates.json')

def normalize_category(category):
    """Normalize category name to match directory structure (lowercase with hyphens)."""
    # Map known categories to their directory names
    category_map = {
        'Abolition': 'abolition',
        'Contemporary Analysis': 'contemporary-analysis',
        'Housing': 'housing',
        'Housing Rent Tenants': 'housing-rent-tenants',
        'Labor': 'labor',
        'Legislation': 'legislation',
        'Misc': 'misc',
        'Notes': 'notes',
        'Organizing': 'organizing',
        'Theory': 'theory'
    }
    return category_map.get(category, category.lower().replace(' ', '-'))

def extract_date_from_content(content):
    """
    Extract date from content using various patterns.
    Returns tuple of (year, extraction_method) or (None, None)
    """
    # Only look at first 1500 characters
    content = content[:1500]

    # Pattern 1: ## **[Year]** format
    match = re.search(r'^##\s*\*\*(\d{4})\*\*', content, re.MULTILINE)
    if match:
        year = int(match.group(1))
        if 1800 <= year <= 2025:
            return year, "## **[Year]** format"

    # Pattern 2: Date: [Year] or Date: Unknown (skip Unknown)
    match = re.search(r'^##?\s*\*\*Date:\*\*\s*(\d{4})', content, re.MULTILINE)
    if match:
        year = int(match.group(1))
        if 1800 <= year <= 2025:
            return year, "Date: [Year] format"

    # Pattern 3: Published: [Year] or Published [Year]
    match = re.search(r'\bPublished:?\s+(\d{4})\b', content, re.IGNORECASE)
    if match:
        year = int(match.group(1))
        if 1800 <= year <= 2025:
            return year, "Published: [Year] format"

    # Pattern 4: Written in [Year]
    match = re.search(r'\bWritten in\s+(\d{4})\b', content, re.IGNORECASE)
    if match:
        year = int(match.group(1))
        if 1800 <= year <= 2025:
            return year, "Written in [Year] format"

    # Pattern 5: (YYYY) in title or first paragraph
    match = re.search(r'\((\d{4})\)', content[:500])
    if match:
        year = int(match.group(1))
        if 1800 <= year <= 2025:
            return year, "(YYYY) in content format"

    # Pattern 6: Date at start of line followed by year
    match = re.search(r'^(?:Date|Year):\s*(\d{4})', content, re.MULTILINE | re.IGNORECASE)
    if match:
        year = int(match.group(1))
        if 1800 <= year <= 2025:
            return year, "Date/Year: YYYY format"

    # Pattern 7: Four-digit year range at start of filename (e.g., "1912" in "1912 Lawrence textile strike")
    # This is handled separately by checking filename

    # Pattern 8: Month Day, Year format (e.g., "January 11 – March 14, 1912")
    match = re.search(r'\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:,?\s*[-–—]\s*(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2})?,?\s+(\d{4})\b', content)
    if match:
        year = int(match.group(1))
        if 1800 <= year <= 2025:
            return year, "Month Day, Year format in content"

    # Pattern 9: Just year in table or structured data
    match = re.search(r'\|\s*Date\s*\|\s*[^|]*?(\d{4})', content)
    if match:
        year = int(match.group(1))
        if 1800 <= year <= 2025:
            return year, "Year in table/structured format"

    # Pattern 10: Year at start of title or heading
    match = re.search(r'^#.*?(\d{4})', content, re.MULTILINE)
    if match:
        year = int(match.group(1))
        if 1800 <= year <= 2025:
            return year, "Year in heading format"

    return None, None

def extract_date_from_filename(filename):
    """Extract year from filename if it starts with a 4-digit year."""
    match = re.match(r'^(\d{4})', filename)
    if match:
        year = int(match.group(1))
        if 1800 <= year <= 2025:
            return year, "Year at start of filename"

    # Also check for year patterns in filename
    match = re.search(r'\b(\d{4})\b', filename)
    if match:
        year = int(match.group(1))
        if 1800 <= year <= 2025:
            return year, "Year in filename"

    return None, None

def main():
    # Load documents missing dates
    with open(MISSING_DATES_FILE, 'r', encoding='utf-8') as f:
        missing_docs = json.load(f)

    print(f"Processing {len(missing_docs)} documents...")

    results = []
    found_count = 0
    not_found = []

    for doc in missing_docs:
        doc_id = doc['id']
        title = doc['title']
        category = doc['category']
        filename = doc['filename']

        # Normalize category to match directory structure
        category_dir = normalize_category(category)
        file_path = DOCS_DIR / category_dir / filename

        # Check if file exists
        if not file_path.exists():
            print(f"⚠ File not found: {file_path}")
            not_found.append({
                'id': doc_id,
                'title': title,
                'filename': filename,
                'category': category,
                'error': 'File not found'
            })
            continue

        # Read file content
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            print(f"⚠ Error reading {file_path}: {e}")
            not_found.append({
                'id': doc_id,
                'title': title,
                'filename': filename,
                'category': category,
                'error': f'Read error: {e}'
            })
            continue

        # Try to extract date from filename first
        year, method = extract_date_from_filename(filename)

        # If not found in filename, try content
        if year is None:
            year, method = extract_date_from_content(content)

        if year is not None:
            results.append({
                'id': doc_id,
                'title': title,
                'filename': filename,
                'category': category,
                'extracted_date': year,
                'extraction_method': method
            })
            found_count += 1
            print(f"✓ {filename}: {year} ({method})")
        else:
            print(f"✗ {filename}: No date found")
            not_found.append({
                'id': doc_id,
                'title': title,
                'filename': filename,
                'category': category,
                'error': 'No date pattern found'
            })

    # Save results
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    print(f"\n{'='*60}")
    print(f"SUMMARY:")
    print(f"{'='*60}")
    print(f"Total documents processed: {len(missing_docs)}")
    print(f"Dates extracted: {found_count}")
    print(f"Dates not found: {len(not_found)}")
    print(f"Success rate: {found_count/len(missing_docs)*100:.1f}%")
    print(f"\nResults saved to: {OUTPUT_FILE}")

    # Save not-found list for reference
    if not_found:
        not_found_file = OUTPUT_FILE.parent / 'content-extraction-failures.json'
        with open(not_found_file, 'w', encoding='utf-8') as f:
            json.dump(not_found, f, indent=2, ensure_ascii=False)
        print(f"Failures saved to: {not_found_file}")

if __name__ == '__main__':
    main()
