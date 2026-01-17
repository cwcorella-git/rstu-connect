#!/usr/bin/env node
/**
 * Extract metadata using deeper patterns
 */

const fs = require('fs');
const path = require('path');

const docsDir = path.join(__dirname, '../docs');

let authorsUpdated = 0;
let datesUpdated = 0;
let skipped = 0;

// Author patterns
const authorPatterns = [
  // Em-dash attribution: "— Name" or "– Name"
  /[—–]\s*([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+(?:[- ][A-Z][a-z]+)?)\s*$/m,
  // Interview with Name
  /[Ii]nterview\s+with\s+([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+(?:[- ][A-Z][a-z]+)?)/,
  // Translated by Name
  /[Tt]ranslated\s+by:?\s+([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+(?:[- ][A-Z][a-z]+)?)/,
  // Edited by Name
  /[Ee]dited\s+by:?\s+([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+(?:[- ][A-Z][a-z]+)?)/,
  // "Name writes:" or "Name argues:"
  /^([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+)\s+(?:writes|argues|explains|notes|observes|suggests|contends):/m,
  // "(Name)" at end of quote or section
  /\(([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+(?:[- ][A-Z][a-z]+)?)\)\s*$/m,
  // "via Name" or "from Name"
  /\b(?:via|from)\s+([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+(?:[- ][A-Z][a-z]+)?)\s*$/m,
];

// Date patterns
const datePatterns = [
  // Month Year without day
  /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(18[5-9]\d|19\d{2}|20[0-2]\d)\b/i,
  // Season Year
  /\b(Spring|Summer|Fall|Autumn|Winter)\s+(18[5-9]\d|19\d{2}|20[0-2]\d)\b/i,
  // Circa year
  /\b(?:circa|c\.)\s*(18[5-9]\d|19\d{2}|20[0-2]\d)\b/i,
  // "in YYYY" at start of sentence
  /\.\s+[Ii]n\s+(18[5-9]\d|19\d{2}|20[0-2]\d)[,\s]/,
  // "published YYYY" or "written YYYY"
  /(?:published|written|composed|created)\s+(?:in\s+)?(18[5-9]\d|19\d{2}|20[0-2]\d)/i,
  // "from YYYY" or "since YYYY"
  /\b(?:from|since|around)\s+(18[5-9]\d|19\d{2}|20[0-2]\d)\b/i,
  // "(YYYY)" anywhere
  /\((18[5-9]\d|19\d{2}|20[0-2]\d)\)/,
  // "YYYY edition" or "YYYY version"
  /(18[5-9]\d|19\d{2}|20[0-2]\d)\s+(?:edition|version|ed\.|reprint)/i,
];

const notAuthorWords = [
  'Wikipedia', 'Unknown', 'Anonymous', 'Various', 'Editor', 'Staff',
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
  'Chapter', 'Volume', 'Part', 'Section', 'Introduction', 'Conclusion',
  'Spring', 'Summer', 'Fall', 'Winter', 'Autumn',
  'First', 'Second', 'Third', 'Fourth', 'Fifth',
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
  const searchArea = body.split('\n').slice(0, 80).join('\n');

  for (const pattern of authorPatterns) {
    const match = searchArea.match(pattern);
    if (match && match[1] && isValidAuthor(match[1])) {
      return match[1].trim();
    }
  }
  return null;
}

function extractDate(body) {
  const searchArea = body.split('\n').slice(0, 150).join('\n');

  for (const pattern of datePatterns) {
    const match = searchArea.match(pattern);
    if (match) {
      // Find year in match groups
      for (let i = match.length - 1; i >= 1; i--) {
        if (match[i] && /^(18[5-9]\d|19\d{2}|20[0-2]\d)$/.test(match[i])) {
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

  // Check existing author
  const authorMatch = frontmatter.match(/^author:\s*["']?(.+?)["']?\s*$/m);
  let hasAuthor = false;
  if (authorMatch) {
    const val = authorMatch[1].trim().replace(/['"]/g, '');
    hasAuthor = val && val !== 'null' && val.toLowerCase() !== 'unknown' && val.length > 3;
  }

  // Check existing date
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

  // Update frontmatter
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

console.log('Extracting deep metadata...\n');
walkDir(docsDir);

console.log(`\n=== DONE ===`);
console.log(`Authors updated: ${authorsUpdated}`);
console.log(`Dates updated: ${datesUpdated}`);
console.log(`Skipped: ${skipped}`);
