#!/usr/bin/env node
/**
 * Automatically add tags to documents based on various sources:
 * 1. Category name as base tag
 * 2. Author name as tag
 * 3. Source website as tag
 * 4. Common keywords from title
 * 5. Wikipedia indicator
 */

const fs = require('fs');
const path = require('path');

const docsDir = path.join(__dirname, '../docs');

let updated = 0;
let skipped = 0;

// Category to tag mapping (more specific tags)
const categoryTags = {
  'housing': ['housing', 'tenants-rights'],
  'labor': ['labor', 'workers', 'unions'],
  'organizing': ['organizing', 'direct-action'],
  'theory': ['theory', 'political-theory'],
  'abolition': ['abolition', 'police', 'prisons'],
  'feminist-theory': ['feminism', 'gender'],
  'environmental-justice': ['environment', 'climate'],
  'anti-war-peace': ['anti-war', 'peace'],
  'international-solidarity': ['international', 'solidarity'],
  'food-justice': ['food', 'mutual-aid'],
  'contemporary-analysis': ['analysis', 'current-events'],
  'youth-student-organizing': ['students', 'youth', 'education'],
  'technology-digital-justice': ['technology', 'digital-rights'],
  'economic-alternatives': ['economics', 'alternatives'],
  'arts-culture-music': ['arts', 'culture'],
  'legislation': ['legislation', 'policy', 'law'],
  'misc': [],
};

// Keywords to look for in titles
const titleKeywords = {
  'strike': 'strikes',
  'strikes': 'strikes',
  'union': 'unions',
  'unions': 'unions',
  'worker': 'workers',
  'workers': 'workers',
  'tenant': 'tenants',
  'tenants': 'tenants',
  'rent': 'rent',
  'housing': 'housing',
  'eviction': 'evictions',
  'prison': 'prisons',
  'police': 'police',
  'abolition': 'abolition',
  'anarchism': 'anarchism',
  'anarchist': 'anarchism',
  'socialism': 'socialism',
  'socialist': 'socialism',
  'communism': 'communism',
  'communist': 'communism',
  'capitalism': 'capitalism',
  'feminist': 'feminism',
  'feminism': 'feminism',
  'women': 'women',
  'climate': 'climate',
  'environment': 'environment',
  'protest': 'protest',
  'resistance': 'resistance',
  'revolution': 'revolution',
  'mutual aid': 'mutual-aid',
  'solidarity': 'solidarity',
  'democracy': 'democracy',
  'education': 'education',
  'school': 'education',
  'university': 'education',
  'college': 'education',
  'iww': 'iww',
  'industrial workers': 'iww',
  'syndicalism': 'syndicalism',
  'syndicalist': 'syndicalism',
  'interview': 'interviews',
  'history': 'history',
  'historical': 'history',
};

// Source patterns to tags
const sourceTags = {
  'libcom.org': 'libcom',
  'anarchistlibrary': 'anarchist-library',
  'wikipedia': 'wikipedia',
  'theanarchistlibrary': 'anarchist-library',
  'crimethinc': 'crimethinc',
  'itsgoingdown': 'itsgoingdown',
};

// Known authors to tag
const authorTags = {
  'emma goldman': 'emma-goldman',
  'peter kropotkin': 'peter-kropotkin',
  'mikhail bakunin': 'mikhail-bakunin',
  'murray bookchin': 'murray-bookchin',
  'david graeber': 'david-graeber',
  'noam chomsky': 'noam-chomsky',
  'angela davis': 'angela-davis',
  'bell hooks': 'bell-hooks',
  'frantz fanon': 'frantz-fanon',
  'karl marx': 'karl-marx',
  'friedrich engels': 'friedrich-engels',
  'rosa luxemburg': 'rosa-luxemburg',
  'antonio gramsci': 'antonio-gramsci',
  'mahatma gandhi': 'gandhi',
  'henry george': 'henry-george',
  'rudolf rocker': 'rudolf-rocker',
  'errico malatesta': 'errico-malatesta',
  'lucy parsons': 'lucy-parsons',
  'voltairine de cleyre': 'voltairine-de-cleyre',
  'alexander berkman': 'alexander-berkman',
};

function extractTags(filepath, frontmatter, body, title, category, author) {
  const tags = new Set();

  // 1. Add category-based tags
  const catTags = categoryTags[category] || [];
  catTags.forEach(t => tags.add(t));

  // 2. Check for Wikipedia
  if (title.includes('Wikipedia') || body.includes('en.wikipedia.org')) {
    tags.add('wikipedia');
  }

  // 3. Extract from title keywords
  const titleLower = title.toLowerCase();
  for (const [keyword, tag] of Object.entries(titleKeywords)) {
    if (titleLower.includes(keyword)) {
      tags.add(tag);
    }
  }

  // 4. Check for known authors
  if (author) {
    const authorLower = author.toLowerCase();
    for (const [name, tag] of Object.entries(authorTags)) {
      if (authorLower.includes(name)) {
        tags.add(tag);
      }
    }
  }

  // 5. Check for source patterns in body
  const bodyFirst500 = body.substring(0, 500).toLowerCase();
  for (const [pattern, tag] of Object.entries(sourceTags)) {
    if (bodyFirst500.includes(pattern)) {
      tags.add(tag);
    }
  }

  // 6. Check Source: line
  const sourceMatch = body.match(/\*\*Source:\*\*\s*(.+)/i) || body.match(/Source:\s*(.+)/i);
  if (sourceMatch) {
    const source = sourceMatch[1].toLowerCase();
    for (const [pattern, tag] of Object.entries(sourceTags)) {
      if (source.includes(pattern)) {
        tags.add(tag);
      }
    }
  }

  return Array.from(tags).slice(0, 10); // Limit to 10 tags
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filepath = path.join(dir, file);
    const stat = fs.statSync(filepath);
    if (stat.isDirectory()) {
      walkDir(filepath);
    } else if (file.endsWith('.md')) {
      processFile(filepath);
    }
  }
}

function processFile(filepath) {
  let content = fs.readFileSync(filepath, 'utf8');

  if (!content.startsWith('---')) return;

  const endIdx = content.indexOf('---', 3);
  if (endIdx === -1) return;

  const frontmatter = content.substring(3, endIdx);
  const body = content.substring(endIdx + 3);

  // Check if already has non-empty tags
  const existingTagsMatch = frontmatter.match(/^tags:\s*\n((?:\s+-\s+.+\n?)+)/m);
  if (existingTagsMatch) {
    skipped++;
    return;
  }

  // Extract metadata from frontmatter
  const titleMatch = frontmatter.match(/^title:\s*["']?(.+?)["']?\s*$/m);
  const categoryMatch = frontmatter.match(/^category:\s*["']?(.+?)["']?\s*$/m);
  const authorMatch = frontmatter.match(/^author:\s*["']?(.+?)["']?\s*$/m);

  const title = titleMatch ? titleMatch[1] : '';
  const category = categoryMatch ? categoryMatch[1] : '';
  const author = authorMatch ? authorMatch[1] : '';

  // Generate tags
  const tags = extractTags(filepath, frontmatter, body, title, category, author);

  if (tags.length === 0) {
    skipped++;
    return;
  }

  // Build tags YAML
  const tagsYaml = 'tags:\n' + tags.map(t => `  - ${t}`).join('\n');

  // Update frontmatter
  const lines = frontmatter.split('\n');
  const existingTagsIdx = lines.findIndex(l => l.trim().startsWith('tags:'));

  if (existingTagsIdx !== -1) {
    // Replace empty tags line
    lines[existingTagsIdx] = tagsYaml;
  } else {
    // Add tags after category if present
    const categoryIdx = lines.findIndex(l => l.startsWith('category:'));
    const insertIdx = categoryIdx !== -1 ? categoryIdx + 1 : lines.length - 1;
    lines.splice(insertIdx, 0, tagsYaml);
  }

  const newFrontmatter = lines.join('\n');
  const newContent = '---' + newFrontmatter + '---' + body;

  fs.writeFileSync(filepath, newContent, 'utf8');

  console.log(`Updated: ${path.relative(docsDir, filepath)} -> [${tags.join(', ')}]`);
  updated++;
}

console.log('Auto-tagging documents...\n');
walkDir(docsDir);

console.log(`\n=== DONE ===`);
console.log(`Updated: ${updated}`);
console.log(`Skipped: ${skipped}`);
