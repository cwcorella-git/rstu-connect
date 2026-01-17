#!/usr/bin/env node
/**
 * Final pass to extract remaining authors and dates
 */

const fs = require('fs');
const path = require('path');

const docsDir = path.join(__dirname, '../docs');

let authorsUpdated = 0;
let datesUpdated = 0;
let skipped = 0;

// More author patterns
const authorPatterns = [
  // "By Name," at start (with comma)
  /^By\s+([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+),/m,
  // "By Name -" (with dash)
  /^By\s+([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+)\s*-/m,
  // "By Name\n" (with newline)
  /^By\s+([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+)\s*\n/m,
  // "| Name |" table format
  /\|\s*([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+)\s*\|/,
  // "(Author: Name)"
  /\([Aa]uthor:\s*([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+)\)/,
  // "Name's [work]" possessive at start
  /^#*\s*([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+)'s\s+/m,
  // "Lecture by Name" or "Speech by Name"
  /(?:Lecture|Speech|Talk|Address)\s+by\s+([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+)/i,
  // "An essay by Name"
  /[Aa]n?\s+(?:essay|article|piece)\s+by\s+([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+)/,
];

// More date patterns
const datePatterns = [
  // "in the 1980s" -> 1985 (midpoint)
  /\bin\s+the\s+(19[2-9]0|20[0-2]0)s\b/,
  // "early/mid/late 1990s"
  /\b(early|mid|late)\s+(19[2-9]0|20[0-2]0)s\b/i,
  // "[Year]" in brackets
  /\[(18[5-9]\d|19\d{2}|20[0-2]\d)\]/,
  // "dated YYYY" or "dates from YYYY"
  /\bdated?\s+(?:from\s+)?(18[5-9]\d|19\d{2}|20[0-2]\d)\b/i,
  // "YYYY:" at start (like "1968: The Year...")
  /^(18[5-9]\d|19\d{2}|20[0-2]\d):/m,
  // ", YYYY" at end of line
  /,\s*(18[5-9]\d|19\d{2}|20[0-2]\d)\s*$/m,
  // "est. YYYY" or "established YYYY"
  /\b(?:est\.|established)\s*(18[5-9]\d|19\d{2}|20[0-2]\d)\b/i,
  // "Vol. X, No. Y, YYYY"
  /Vol\.\s*\d+.*?(18[5-9]\d|19\d{2}|20[0-2]\d)/i,
  // More aggressive: any 4-digit year in first 50 lines
  /\b(19[4-9]\d|20[0-2]\d)\b/,
];

const notAuthorWords = [
  'Wikipedia', 'Unknown', 'Anonymous', 'Various', 'Editor', 'Staff',
  'January', 'February', 'March', 'April', 'May', 'June', 'July',
  'August', 'September', 'October', 'November', 'December',
  'Spring', 'Summer', 'Fall', 'Winter', 'Autumn',
  'Chapter', 'Volume', 'Part', 'Section', 'Introduction',
  'First', 'Second', 'Third', 'New', 'Old',
];

function isValidAuthor(name) {
  if (!name) return false;
  name = name.trim();
  if (!name.includes(' ')) return false;
  if (name.length < 5 || name.length > 50) return false;
  if (/\d/.test(name)) return false;
  for (const word of notAuthorWords) {
    if (name.includes(word)) return false;
  }
  return true;
}

function extractAuthor(body) {
  const searchArea = body.split('\n').slice(0, 60).join('\n');

  for (const pattern of authorPatterns) {
    const match = searchArea.match(pattern);
    if (match && match[1] && isValidAuthor(match[1])) {
      return match[1].trim();
    }
  }
  return null;
}

function extractDate(body) {
  // First try specific patterns in first 100 lines
  const searchArea = body.split('\n').slice(0, 100).join('\n');

  for (let i = 0; i < datePatterns.length - 1; i++) {
    const pattern = datePatterns[i];
    const match = searchArea.match(pattern);
    if (match) {
      for (let j = match.length - 1; j >= 1; j--) {
        if (match[j] && /^(18[5-9]\d|19\d{2}|20[0-2]\d)$/.test(match[j])) {
          const year = parseInt(match[j]);
          if (year >= 1850 && year <= 2026) {
            return year;
          }
        }
        // Handle decade patterns
        if (match[j] && /^(19[2-9]0|20[0-2]0)$/.test(match[j])) {
          return parseInt(match[j]) + 5; // midpoint of decade
        }
      }
    }
  }

  // Last resort: any year in first 50 lines
  const first50 = body.split('\n').slice(0, 50).join('\n');
  const lastPattern = datePatterns[datePatterns.length - 1];
  const match = first50.match(lastPattern);
  if (match && match[1]) {
    const year = parseInt(match[1]);
    if (year >= 1940 && year <= 2026) {
      return year;
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

  // Check existing
  const authorMatch = frontmatter.match(/^author:\s*["']?(.+?)["']?\s*$/m);
  let hasAuthor = false;
  if (authorMatch) {
    const val = authorMatch[1].trim().replace(/['"]/g, '');
    hasAuthor = val && val !== 'null' && val.toLowerCase() !== 'unknown' && val.length > 3;
  }

  const dateMatch = frontmatter.match(/^date:\s*["']?(.+?)["']?\s*$/m);
  let hasDate = false;
  if (dateMatch) {
    hasDate = /\d{4}/.test(dateMatch[1]);
  }

  let newAuthor = null;
  let newDate = null;

  if (!hasAuthor) {
    newAuthor = extractAuthor(body);
  }

  if (!hasDate) {
    newDate = extractDate(body);
  }

  if (!newAuthor && !newDate) {
    skipped++;
    return;
  }

  const lines = frontmatter.split('\n');

  if (newAuthor) {
    const existingAuthorIdx = lines.findIndex(l => l.startsWith('author:'));
    const escapedAuthor = newAuthor.replace(/"/g, '\\"');
    if (existingAuthorIdx !== -1) {
      lines[existingAuthorIdx] = `author: "${escapedAuthor}"`;
    } else {
      const titleIdx = lines.findIndex(l => l.startsWith('title:'));
      lines.splice(titleIdx + 1, 0, `author: "${escapedAuthor}"`);
    }
    authorsUpdated++;
  }

  if (newDate) {
    const existingDateIdx = lines.findIndex(l => l.startsWith('date:'));
    if (existingDateIdx !== -1) {
      lines[existingDateIdx] = `date: ${newDate}`;
    } else {
      const authorIdx = lines.findIndex(l => l.startsWith('author:'));
      const titleIdx = lines.findIndex(l => l.startsWith('title:'));
      const insertIdx = authorIdx !== -1 ? authorIdx + 1 : titleIdx + 1;
      lines.splice(insertIdx, 0, `date: ${newDate}`);
    }
    datesUpdated++;
  }

  const newFrontmatter = lines.join('\n');
  const newContent = '---' + newFrontmatter + '---' + body;

  fs.writeFileSync(filepath, newContent, 'utf8');

  const relPath = path.relative(docsDir, filepath);
  const updates = [];
  if (newAuthor) updates.push(`author: "${newAuthor}"`);
  if (newDate) updates.push(`date: ${newDate}`);
  console.log(`Updated: ${relPath} -> ${updates.join(', ')}`);
}

console.log('Final metadata extraction...\n');
walkDir(docsDir);

console.log(`\n=== DONE ===`);
console.log(`Authors updated: ${authorsUpdated}`);
console.log(`Dates updated: ${datesUpdated}`);
console.log(`Skipped: ${skipped}`);
