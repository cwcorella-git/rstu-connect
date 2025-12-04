# Organizing Library - Master Collection

**Complete anarchist literature collection focused on rent, housing, labor, police, and organizing**

## Collection Summary

**Total Files**: 869 markdown documents
**Total Size**: 76 MB
**Source**: Veritable Games anarchist library archive
**Last Updated**: December 4, 2025

## ⭐ This is the MASTER directory - all files are here

All previously separate directories (organizing-library, organizing-library-additional, organizing-library-recleaned) have been consolidated into this single master directory with no duplicates.

## Directory Structure

### Curated Topic Directories (268 files)

**`housing-rent-tenants/`** (36 files)
- Rent strikes and organizing tactics
- Tenant union formation guides
- Housing rights and landlord resistance
- Key documents: "Just Get to Know Your Neighbors", "101 Notes on LA Tenants Union", "How to organize a rent strike"

**`labor-unions/`** (49 files)
- Labor organizing and union tactics
- Syndicalism and revolutionary unionism
- Workplace democracy and solidarity
- Strike organizing and histories

**`organizing-action/`** (45 files)
- Direct action tactics and strategies
- Mutual aid organizing
- Community organizing guides
- Solidarity networks

**`police-enforcement/`** (43 files)
- Police abolition theory and practice
- Property enforcement critique
- Defund movements
- Key texts: "No More Police" (Miriame Kaba), "Becoming Abolitionists" (Derecka Purnell)

**`classic-theory/`** (41 files)
- Foundational anarchist texts
- Kropotkin, Bookchin, and other theorists
- "Anarchist Morality", "Appeal to the Young", "Post-Scarcity Anarchism"

**`contemporary-analysis/`** (28 files)
- Modern anarchist analysis
- Current movement developments
- Contemporary organizing case studies

**`property-landlords/`** (8 files)
- Property relations and critique
- Landlord power analysis
- Rent extraction theory

**`strikes/`** (7 files)
- Historical strike campaigns
- Strike tactics and strategy
- General strikes

**`historical/`** (11 files)
- Historical anarchist movements
- Past organizing campaigns
- Movement histories

### Additional Collection (600 files)

**`additional/`** (600 files)
- Extended collection from web scrapes (libcom.org, theanarchistlibrary.org)
- Broad coverage of rent, tenants, landlords, housing, labor, unions, strikes, police, property, organizing
- Includes many specialized texts and historical documents
- Cross-references to curated directories above

## File Quality

**All files have been professionally cleaned**:
- ✅ Paragraph reflow for readability (no hard line wrapping)
- ✅ Preserved markdown structure (headers, lists, quotes)
- ✅ Removed conversion artifacts
- ✅ YAML frontmatter with metadata
- ✅ UTF-8 encoding
- ✅ Duplicates removed (higher quality versions kept)

**Processing Methods**:
- PDF conversions: marker_single (GPU-accelerated OCR)
- Web scrapes: reflow_library_paragraphs.py
- Quality replacement: 29 files upgraded to highest quality versions

## Notable Articles Included

**Housing & Rent**:
- "Just Get to Know Your Neighbors" (Emeline Posner)
- "101 Notes on the LA Tenants Union"
- "What Is A Tenants Union"
- "How to organize a rent strike"
- "Abolish Rent: How Tenants Can Solve the Housing Crisis" (Tracy Rosenthal & Leonardo)
- "The Permanent Universal Rent Strike" (Robert Anton Wilson)
- "1931 Barcelona Mass Rent Strike" (Tom Wetzel)
- "No Rent in Sheffield" (John Creaghe)

**Police & Abolition**:
- "No More Police" (Miriame Kaba)
- "Becoming Abolitionists" (Derecka Purnell)
- "Fire the Cops"
- "A World Without Police" (Geo Maher)

**Labor & Organizing**:
- "Picking Fights: Seventeen Years of Organizing in the Seattle Solidarity Network"
- "Can Solidarity Unionism Save the Labor Movement"
- "Business Unionism vs Revolutionary Unionism" (Dave Neal)
- "Swedish Syndicalism: An Outline of its Ideology and Practice"
- "Green Syndicalism: A Very Brief Introduction"
- "Basic Book on Syndicalism: Some Tips on How to Use It"

**Theory & Practice**:
- "Anarchist Morality" (Kropotkin)
- "An Appeal to the Young" (Kropotkin)
- "Individual Liberty"
- "Post-Scarcity Anarchism" (Murray Bookchin)
- "Libertarian Municipalism: An Overview" (Murray Bookchin)
- "Constellations of Care: Anarcha-Feminism in Practice" (Cindy Barukh Milstein)
- "Palaces for the People: How Social Infrastructure" (Eric Klinenberg)
- "Anarchist Direct Actions: A Challenge for Law Enforcement"

## Search Tips

### By Topic
```bash
# Search across all directories
cd ~/organizing-library

# Rent and housing
grep -r -l "rent.*strike\|tenant.*union\|housing.*organizing" . --include="*.md"

# Labor organizing
grep -r -l "union.*organizing\|strike.*tactics\|labor.*movement" . --include="*.md"

# Police abolition
grep -r -l "police.*abolition\|defund.*police\|property.*enforcement" . --include="*.md"

# Direct action
grep -r -l "direct.*action\|mutual.*aid\|solidarity.*network" . --include="*.md"
```

### By Directory
```bash
# Browse organized topics
ls housing-rent-tenants/
ls labor-unions/
ls police-enforcement/

# Search additional collection
ls additional/ | grep -i "rent\|tenant\|strike"
```

### Content Search
```bash
# Find specific concepts
grep -r "rent is always" . --include="*.md"
grep -r "just get to know your neighbors" . --include="*.md"
grep -r "property is theft" . --include="*.md"
```

## File Format

All files use Markdown with YAML frontmatter:
```yaml
---
author: [Author Name]
date: [Year]
title: [Original Title]
tags: [rent, tenants, organizing, etc.]
---

# Document Title

Content here...
```

## Organization Notes

- **Curated directories** (housing-rent-tenants, labor-unions, etc.): Hand-picked and organized by topic for easy browsing
- **additional/**: Comprehensive collection of related texts, may overlap topically with curated directories
- **No duplicates**: When files appeared in multiple sources, the highest quality version was kept
- **All files cleaned**: Consistent formatting and readability across the entire collection

## Server Source

**Server**: veritable-games-server (192.168.1.15)
**Original Archive**: `/data/archives/veritable-games/library/` (4,432 files)
**Cleaned Sources**:
- `/home/user/projects/veritable-games/resources/processing/reconversion-output-final/` (PDF conversions)
- `/home/user/projects/veritable-games/resources/data/library-reflow-working/` (web scrapes)

## Usage

This collection is part of an anarchist literature archival project. Use for:
- Research on organizing tactics and history
- Study of anarchist theory and practice
- Reference for tenant/labor organizing campaigns
- Educational material on abolition movements
- Historical movement analysis

## Quick Start

```bash
# Browse by topic
cd ~/organizing-library
ls -lh */

# Find all rent strike materials
grep -r -l "rent strike" . --include="*.md"

# Search for specific author
grep -r "^author:.*Kaba" . --include="*.md"

# Count files by category
for dir in */; do echo "$dir: $(find "$dir" -name '*.md' | wc -l)"; done
```

---

**Master Collection Assembled**: December 4, 2025
**869 files | 76 MB | All cleaned and deduplicated**
**This is the ONLY directory you need - everything is here!**
