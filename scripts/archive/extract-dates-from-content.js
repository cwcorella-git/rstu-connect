#!/usr/bin/env node
/**
 * Extract dates from document content using various patterns
 */

const fs = require('fs');
const path = require('path');

const docsDir = path.join(__dirname, '../docs');

let updated = 0;
let skipped = 0;

// Date patterns to look for in content
const datePatterns = [
  // Month DD, YYYY anywhere in early content
  /(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+(\d{4})/i,
  // MM/DD/YYYY format
  /\d{1,2}\/\d{1,2}\/(\d{4})/,
  // "Published ... YYYY" or "Posted ... YYYY"
  /(?:Published|Posted|Updated|Created)\s+.*?(\d{4})/i,
  // "Month YYYY" header
  /^#+\s*(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})/m,
  // YYYY-MM-DD format
  /(\d{4})-\d{2}-\d{2}/,
  // "(YYYY)" at end of line
  /\((\d{4})\)\s*$/m,
  // Copyright YYYY
  /©\s*(\d{4})/,
  /[Cc]opyright\s+(\d{4})/,
  // "in YYYY" or "from YYYY"
  /\b(?:in|from|since)\s+(\d{4})\b/i,
];

// Extract year from match
function extractYear(content) {
  // Only search first 100 lines
  const searchArea = content.split('\n').slice(0, 100).join('\n');

  for (const pattern of datePatterns) {
    const match = searchArea.match(pattern);
    if (match) {
      // Find the year in the match
      for (let i = match.length - 1; i >= 0; i--) {
        if (match[i] && /^\d{4}$/.test(match[i])) {
          const year = parseInt(match[i]);
          if (year >= 1850 && year <= 2026) {
            return year;
          }
        }
      }
    }
  }
  return null;
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

  // Check if already has a valid date
  const dateMatch = frontmatter.match(/^date:\s*(.+)$/m);
  if (dateMatch) {
    const dateVal = dateMatch[1].trim();
    if (dateVal && /\d{4}/.test(dateVal)) {
      skipped++;
      return;
    }
  }

  // Try to extract date from body
  const year = extractYear(body);

  if (!year) {
    skipped++;
    return;
  }

  // Update frontmatter
  const lines = frontmatter.split('\n');
  const existingDateIdx = lines.findIndex(l => l.startsWith('date:'));

  if (existingDateIdx !== -1) {
    lines[existingDateIdx] = `date: ${year}`;
  } else {
    // Insert after author or title
    const authorIdx = lines.findIndex(l => l.startsWith('author:'));
    const titleIdx = lines.findIndex(l => l.startsWith('title:'));
    const insertIdx = authorIdx !== -1 ? authorIdx + 1 : (titleIdx !== -1 ? titleIdx + 1 : 1);
    lines.splice(insertIdx, 0, `date: ${year}`);
  }

  const newFrontmatter = lines.join('\n');
  const newContent = '---' + newFrontmatter + '---' + body;

  fs.writeFileSync(filepath, newContent, 'utf8');

  console.log(`Updated: ${path.relative(docsDir, filepath)} -> date: ${year}`);
  updated++;
}

console.log('Extracting dates from document content...\n');
walkDir(docsDir);

console.log(`\n=== DONE ===`);
console.log(`Updated: ${updated}`);
console.log(`Skipped: ${skipped}`);
