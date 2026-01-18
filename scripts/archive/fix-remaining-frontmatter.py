#!/usr/bin/env python3
"""
Fix remaining invalid frontmatter files (handles special characters in filenames)
"""

import os
import re
import glob

DOCS_DIR = os.path.join(os.path.dirname(__file__), '../docs')

# Files still invalid (from find command output)
INVALID_FILES = [
    "docs/organizing/Class Power can Remake Society Remembering Australia's Green Ban\" Movement.md",
    "docs/feminist-theory/Beyond Rhetoric – What Does the \"Just Transition\" Mean for DAPL.md",
    "docs/feminist-theory/\"'Women of Peace' We Are Not\" Feminist Militants in the West German Autonomen - Patricia Melzer.md",
    "docs/feminist-theory/Wrath Over Pride A call-out post to \"radical\" cis (het) men and their inadequacy in gender struggles.md",
    "docs/feminist-theory/Unions, Environmental Justice Advocates Say \"No!\" To Coal Transport through Oakland.md",
    "docs/contemporary-analysis/\"Black\" anger shakes the rotten pillars of bourgeois and democratic \"civilization\" - Bordiga, 1965.md",
    "docs/contemporary-analysis/The \"Left-Wingers\" and the IWW.md",
    "docs/contemporary-analysis/GE Tree Company ArborGen Found Guilty of Defrauding Workers, Fined $53.5M.md",
    "docs/contemporary-analysis/\"Now and then the flame dies down, but solidarity is a stream of sparks\".md",
    "docs/contemporary-analysis/Principles of Decorative Design _ Fourth E - Christopher Dresser.md",
    "docs/contemporary-analysis/ChatGPT Gets Its \"Wolfram Superpowers\"!—Stephen Wolfram Writings.md",
    "docs/contemporary-analysis/How the pigs abuse 'gang' labels - Kevin Rashid Johnson.md",
    "docs/contemporary-analysis/a prelude \"blessed,\" meaning washed with blood.md",
    "docs/abolition/Soledad's Black prisoners brutalized in 3 a.m. raid report guards warned, 'You Nggers will have COVI.md",
    "docs/environmental-justice/Bridgeport Residents Release Balloon Banner at City Hall \"Fracked Gas is Environmental Racism\".md",
    "docs/environmental-justice/Canada's New Anti-Terrorism Act and the \"Green Syndicalist Menace\".md",
    "docs/anti-war-peace/Your Wars! Our Dead! \"Sir! No Sir!\".md",
]

def clean_title(title):
    """Clean markdown/special chars from title"""
    title = re.sub(r'\*\*', '', title)  # Remove bold
    title = re.sub(r'^#+\s*', '', title)  # Remove headers
    title = re.sub(r'\\([*()[\]$])', r'\1', title)  # Unescape chars
    title = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', title)  # Remove links, keep text
    title = re.sub(r'!\[\]\([^)]+\)', '', title)  # Remove images
    title = re.sub(r'\s+', ' ', title).strip()
    return title[:200]

def title_from_filename(filename):
    """Extract title from filename"""
    name = os.path.splitext(os.path.basename(filename))[0]
    name = re.sub(r'[-_]', ' ', name)
    return name.strip()

def fix_file(filepath):
    """Fix frontmatter in a single file"""
    if not os.path.exists(filepath):
        print(f"  ⚠️ Not found: {filepath}")
        return False

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if not content.startswith('---'):
        # No frontmatter - add basic
        category = os.path.basename(os.path.dirname(filepath))
        title = title_from_filename(filepath)
        # Escape quotes for YAML
        title = title.replace('"', "'")
        new_content = f'---\ntitle: "{title}"\ncategory: "{category}"\n---\n\n{content}'
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"  ✓ Added frontmatter")
        return True

    # Find frontmatter boundaries
    end_idx = content.find('---', 3)
    if end_idx == -1:
        print(f"  ⚠️ Malformed (no closing ---)")
        return False

    frontmatter = content[3:end_idx].strip()
    body = content[end_idx+3:]

    # Parse fields manually
    title = None
    category = None
    author = None

    for line in frontmatter.split('\n'):
        if line.startswith('title:'):
            title = line[6:].strip().strip('"\'')
        elif line.startswith('category:'):
            category = line[9:].strip().strip('"\'')
        elif line.startswith('author:'):
            author = line[7:].strip().strip('"\'')

    # Clean title
    if title:
        title = clean_title(title)

    # Fallback to filename
    if not title or len(title) < 3:
        title = title_from_filename(filepath)

    # Ensure category
    if not category:
        category = os.path.basename(os.path.dirname(filepath))

    # Escape quotes for YAML (use single quotes for safety)
    title = title.replace('"', "'")

    # Rebuild frontmatter
    new_fm = f'---\ntitle: "{title}"\ncategory: "{category}"'
    if author:
        author = author.replace('"', "'")
        new_fm += f'\nauthor: "{author}"'
    new_fm += '\n---'

    new_content = new_fm + body
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"  ✓ Fixed")
    return True

# Find actual files using glob patterns
print("=== FIXING REMAINING INVALID FRONTMATTER ===\n")

fixed = 0
failed = 0

# First, find all .md files and test each one
for root, dirs, files in os.walk(DOCS_DIR):
    for filename in files:
        if not filename.endswith('.md'):
            continue

        filepath = os.path.join(root, filename)

        # Quick test: try to parse frontmatter
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            if not content.startswith('---'):
                continue  # Will be caught later

            end_idx = content.find('---', 3)
            if end_idx == -1:
                print(f"Fixing: {filepath}")
                if fix_file(filepath):
                    fixed += 1
                else:
                    failed += 1
                continue

            fm = content[3:end_idx]

            # Check for problematic patterns in frontmatter
            if '\\$' in fm or '\\*' in fm or '**' in fm:
                print(f"Fixing: {filepath}")
                if fix_file(filepath):
                    fixed += 1
                else:
                    failed += 1

        except Exception as e:
            print(f"Error reading {filepath}: {e}")
            failed += 1

print(f"\n=== SUMMARY ===")
print(f"Fixed: {fixed}")
print(f"Failed: {failed}")
