#!/usr/bin/env node
/**
 * Fix documents with bad/generic titles by extracting better titles from content
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const DOCS_DIR = path.join(__dirname, '../docs');

// Patterns that indicate a bad title
const BAD_TITLE_PATTERNS = [
  /^>-?\s*$/,                           // Just ">-" or ">"
  /^\[.*\]\(https?:\/\//,               // Markdown link as title
  /^https?:\/\//,                       // URL as title
  /^##?\s*\[/,                          // Markdown heading with link
  /^\*[^*]+\*$/,                        // Just italicized word
  /^Contents\s*$/i,                     // Just "Contents"
  /^#{1,3}\s*$/,                        // Just "#" symbols
  /^[A-Z]\s*$/,                         // Single letter
  /^\.{2,}$/,                           // Just dots
  /^-{2,}$/,                            // Just dashes
  /^[0-9.]+\s*$/,                       // Just numbers
  /^\s*$/,                              // Empty/whitespace
  /^##?\s*!\[\]/,                       // Image reference headings
  /^##?\s*\d+:\d+/,                     // Timestamps (0:00, 1:52)
  /^##?\s*\d+$/,                        // Just numbers with heading
  /^[a-z]+\.(com|org|net|io|edu)$/i,   // Domain-only titles
  /^—\s/,                               // Em-dash author attribution
  /^A NOTE ABOUT/i,                     // Book metadata
  /^AND A PREFACE/i,                    // Book metadata
  /^TRANSLATED BY/i,                    // Book metadata
  /^EDITED BY/i,                        // Book metadata
  /^INTRODUCTION BY/i,                  // Book metadata
  /^FOREWORD BY/i,                      // Book metadata
];

// Check if title is bad
function isBadTitle(title) {
  if (!title || title.length < 3) return true;
  if (title.length > 200) return true;

  for (const pattern of BAD_TITLE_PATTERNS) {
    if (pattern.test(title)) return true;
  }

  // Title is mostly special characters
  const alphanumeric = title.replace(/[^a-zA-Z0-9]/g, '');
  if (alphanumeric.length < title.length * 0.3) return true;

  return false;
}

// Extract a better title from document content
function extractTitleFromContent(content) {
  const lines = content.split('\n');

  // Try to find first meaningful heading
  for (const line of lines) {
    // Skip empty lines and image references
    if (!line.trim()) continue;
    if (line.startsWith('![')) continue;
    if (line.startsWith('---')) continue;

    // H1 heading
    const h1Match = line.match(/^#\s+(.+)$/);
    if (h1Match) {
      const title = cleanTitle(h1Match[1]);
      if (title && title.length >= 5 && !isBadTitle(title)) {
        return title;
      }
    }

    // H2 heading
    const h2Match = line.match(/^##\s+(.+)$/);
    if (h2Match) {
      const title = cleanTitle(h2Match[1]);
      if (title && title.length >= 5 && !isBadTitle(title)) {
        return title;
      }
    }

    // Bold text at start of line (often a title)
    const boldMatch = line.match(/^\*\*(.{10,}?)\*\*/);
    if (boldMatch) {
      const title = cleanTitle(boldMatch[1]);
      if (title && title.length >= 10 && !isBadTitle(title)) {
        return title;
      }
    }
  }

  // Try to find first substantial paragraph
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith('#')) continue;
    if (trimmed.startsWith('![')) continue;
    if (trimmed.startsWith('---')) continue;
    if (trimmed.startsWith('|')) continue;
    if (trimmed.startsWith('*') && trimmed.endsWith('*')) continue;
    if (trimmed.startsWith('[') && trimmed.includes('](http')) continue;

    // Found a paragraph - use first sentence or first 100 chars
    const cleaned = cleanTitle(trimmed);
    if (cleaned && cleaned.length >= 20) {
      // Try to get first sentence
      const sentenceMatch = cleaned.match(/^(.{20,}?[.!?])\s/);
      if (sentenceMatch) {
        return sentenceMatch[1].substring(0, 150);
      }
      return cleaned.substring(0, 150);
    }
  }

  return null;
}

// Clean up a title string
function cleanTitle(title) {
  if (!title) return null;

  return title
    // Remove markdown formatting
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/`/g, '')
    // Remove markdown links - keep text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove image references
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    // Remove HTML tags
    .replace(/<[^>]+>/g, '')
    // Remove excessive punctuation
    .replace(/^[#\-*_>\s]+/, '')
    .replace(/[#\-*_>\s]+$/, '')
    // Clean up whitespace
    .replace(/\s+/g, ' ')
    .trim()
    // Limit length
    .substring(0, 200);
}

// Extract title from filename
function titleFromFilename(filename) {
  return filename
    .replace(/\.md$/, '')
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    // Remove common prefixes
    .replace(/^Article[_\s]+/i, '')
    .trim();
}

// Tag extraction (simplified from add-missing-tags.js)
const KEYWORD_TAGS = [
  { pattern: /\bunion\b/i, tag: 'unions' },
  { pattern: /\bstrike\b/i, tag: 'strikes' },
  { pattern: /\bworker/i, tag: 'workers' },
  { pattern: /\blabor\b/i, tag: 'labor' },
  { pattern: /\blabour\b/i, tag: 'labor' },
  { pattern: /\banarchi/i, tag: 'anarchism' },
  { pattern: /\bmarxi/i, tag: 'marxism' },
  { pattern: /\bsocialis/i, tag: 'socialism' },
  { pattern: /\bcommunis/i, tag: 'communism' },
  { pattern: /\bfeminis/i, tag: 'feminism' },
  { pattern: /\bpolice\b/i, tag: 'police' },
  { pattern: /\bprison/i, tag: 'prisons' },
  { pattern: /\babolitio/i, tag: 'abolition' },
  { pattern: /\btenant/i, tag: 'tenants' },
  { pattern: /\bhousing\b/i, tag: 'housing' },
  { pattern: /\brent\b/i, tag: 'rent' },
  { pattern: /\blandlord/i, tag: 'landlords' },
  { pattern: /\beviction/i, tag: 'evictions' },
  { pattern: /\bclimate/i, tag: 'climate' },
  { pattern: /\benvironment/i, tag: 'environment' },
  { pattern: /\bpipeline/i, tag: 'pipelines' },
  { pattern: /\bprotest/i, tag: 'protests' },
  { pattern: /\briot/i, tag: 'riots' },
  { pattern: /\borganiz/i, tag: 'organizing' },
  { pattern: /\bsolidarity/i, tag: 'solidarity' },
  { pattern: /\bmutual aid/i, tag: 'mutual aid' },
  { pattern: /\biww\b/i, tag: 'IWW' },
  { pattern: /\bwobbl/i, tag: 'IWW' },
  { pattern: /\bsyndicalis/i, tag: 'syndicalism' },
  { pattern: /\bantifa/i, tag: 'antifascism' },
  { pattern: /\bfascis/i, tag: 'fascism' },
  { pattern: /\bdemocra/i, tag: 'democracy' },
  { pattern: /\bcapitalis/i, tag: 'capitalism' },
  { pattern: /\bimperialis/i, tag: 'imperialism' },
  { pattern: /\bcolonial/i, tag: 'colonialism' },
  { pattern: /\bindigenous/i, tag: 'indigenous' },
  { pattern: /\bqueer\b/i, tag: 'LGBTQ+' },
  { pattern: /\btrans\b/i, tag: 'LGBTQ+' },
  { pattern: /\bwomen/i, tag: 'women' },
  { pattern: /\bgender\b/i, tag: 'gender' },
  { pattern: /\bdisabil/i, tag: 'disability' },
  { pattern: /\brace\b/i, tag: 'race' },
  { pattern: /\bracis/i, tag: 'racism' },
  { pattern: /\bblack\b/i, tag: 'Black' },
];

function extractTags(title, category) {
  const tags = new Set();
  const text = title.toLowerCase();

  for (const { pattern, tag } of KEYWORD_TAGS) {
    if (pattern.test(text)) {
      tags.add(tag);
    }
  }

  // Add category-based tag if few matches
  if (tags.size < 2) {
    const catLower = category.toLowerCase();
    if (catLower.includes('labor')) tags.add('labor');
    if (catLower.includes('abolition')) tags.add('abolition');
    if (catLower.includes('housing')) tags.add('housing');
    if (catLower.includes('feminist')) tags.add('feminism');
    if (catLower.includes('environment')) tags.add('environment');
    if (catLower.includes('theory')) tags.add('theory');
    if (catLower.includes('organizing')) tags.add('organizing');
  }

  return Array.from(tags).slice(0, 5);
}

// Process all documents
console.log('=== FIXING BAD TITLES ===\n');

let fixed = 0;
let alreadyGood = 0;
let couldNotFix = 0;

function processDirectory(dir) {
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory() && !item.startsWith('.')) {
      processDirectory(fullPath);
    } else if (item.endsWith('.md')) {
      processFile(fullPath, item);
    }
  }
}

function processFile(filePath, filename) {
  const relativePath = path.relative(DOCS_DIR, filePath);
  const parts = relativePath.split(path.sep);
  const category = parts.length > 1 ? parts[0] : 'misc';

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let parsed;

    try {
      parsed = matter(content);
    } catch (err) {
      return;
    }

    const currentTitle = parsed.data.title;

    // Check if title is bad
    if (!isBadTitle(currentTitle)) {
      alreadyGood++;
      return;
    }

    // Try to extract better title from content
    let newTitle = extractTitleFromContent(parsed.content);

    // Fallback to filename
    if (!newTitle || isBadTitle(newTitle)) {
      newTitle = titleFromFilename(filename);
    }

    // Final check
    if (!newTitle || newTitle.length < 5) {
      couldNotFix++;
      if (couldNotFix <= 10) {
        console.log(`Could not fix: ${relativePath}`);
        console.log(`  Current: "${currentTitle}"`);
      }
      return;
    }

    // Update document
    parsed.data.title = newTitle;

    // Add tags if missing
    if (!parsed.data.tags || parsed.data.tags.length === 0) {
      parsed.data.tags = extractTags(newTitle, category);
    }

    // Write back
    const newContent = matter.stringify(parsed.content, parsed.data);
    fs.writeFileSync(filePath, newContent);

    fixed++;
    if (fixed <= 30) {
      console.log(`Fixed: ${relativePath}`);
      console.log(`  Old: "${currentTitle ? currentTitle.substring(0, 50) : '(empty)'}..."`);
      console.log(`  New: "${newTitle.substring(0, 50)}..."`);
      if (parsed.data.tags && parsed.data.tags.length > 0) {
        console.log(`  Tags: ${parsed.data.tags.join(', ')}`);
      }
      console.log('');
    }
  } catch (err) {
    // Skip files with errors
  }
}

processDirectory(DOCS_DIR);

console.log('\n=== SUMMARY ===');
console.log(`Fixed: ${fixed}`);
console.log(`Already good: ${alreadyGood}`);
console.log(`Could not fix: ${couldNotFix}`);
