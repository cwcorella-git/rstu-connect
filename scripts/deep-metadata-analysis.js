#!/usr/bin/env node
/**
 * Deep analysis of documents without authors/dates to find more patterns
 */

const fs = require('fs');
const path = require('path');

const docsDir = path.join(__dirname, '../docs');

const noAuthor = [];
const noDate = [];

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filepath = path.join(dir, file);
    const stat = fs.statSync(filepath);
    if (stat.isDirectory()) {
      walkDir(filepath);
    } else if (file.endsWith('.md')) {
      processFile(filepath, file);
    }
  }
}

function processFile(filepath, filename) {
  const content = fs.readFileSync(filepath, 'utf8');

  if (!content.startsWith('---')) return;

  const endIdx = content.indexOf('---', 3);
  if (endIdx === -1) return;

  const fm = content.substring(3, endIdx);
  const body = content.substring(endIdx + 3);
  const relPath = path.relative(docsDir, filepath);

  // Check author
  const authorMatch = fm.match(/^author:\s*["']?(.+?)["']?\s*$/m);
  let hasAuthor = false;
  if (authorMatch) {
    const val = authorMatch[1].trim().replace(/['"]/g, '');
    hasAuthor = val && val !== 'null' && val.toLowerCase() !== 'unknown' && val.length > 3;
  }

  // Check date
  const dateMatch = fm.match(/^date:\s*["']?(.+?)["']?\s*$/m);
  let hasDate = false;
  if (dateMatch) {
    hasDate = /\d{4}/.test(dateMatch[1]);
  }

  const first100 = body.split('\n').slice(0, 100).join('\n');

  if (!hasAuthor) {
    noAuthor.push({ path: relPath, content: first100 });
  }

  if (!hasDate) {
    noDate.push({ path: relPath, content: first100 });
  }
}

walkDir(docsDir);

// Analyze author patterns
console.log('=== DOCUMENTS WITHOUT AUTHORS:', noAuthor.length, '===\n');

const authorPatterns = {
  'dash_name': [], // "— Name" or "– Name"
  'by_at_end': [], // "by Name" near end
  'source_author': [], // "Source:" with author-like text
  'interview_with': [], // "Interview with Name"
  'translated_by': [], // "Translated by Name"
  'edited_by': [], // "Edited by Name"
};

for (const doc of noAuthor) {
  const c = doc.content;

  // Check for em-dash author attribution
  if (/[—–]\s*([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+)/m.test(c)) {
    const match = c.match(/[—–]\s*([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+)/m);
    authorPatterns['dash_name'].push({ path: doc.path, author: match[1] });
  }
  // Interview with
  else if (/[Ii]nterview\s+with\s+([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+)/.test(c)) {
    const match = c.match(/[Ii]nterview\s+with\s+([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+)/);
    authorPatterns['interview_with'].push({ path: doc.path, author: match[1] });
  }
  // Translated by
  else if (/[Tt]ranslated\s+by\s+([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+)/.test(c)) {
    const match = c.match(/[Tt]ranslated\s+by\s+([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+)/);
    authorPatterns['translated_by'].push({ path: doc.path, author: match[1] });
  }
}

console.log('Extractable author patterns found:');
for (const [pattern, docs] of Object.entries(authorPatterns)) {
  if (docs.length > 0) {
    console.log(`\n${pattern}: ${docs.length}`);
    docs.slice(0, 5).forEach(d => console.log(`  "${d.author}" <- ${d.path}`));
  }
}

// Analyze date patterns
console.log('\n\n=== DOCUMENTS WITHOUT DATES:', noDate.length, '===\n');

const datePatterns = {
  'month_year': [], // "January 2020" without day
  'season_year': [], // "Spring 2020", "Winter 2019"
  'url_date': [], // dates in URLs
  'circa': [], // "circa 1920" or "c. 1920"
};

for (const doc of noDate) {
  const c = doc.content;

  // Month Year
  const monthMatch = c.match(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(19\d{2}|20[0-2]\d)\b/i);
  if (monthMatch) {
    datePatterns['month_year'].push({ path: doc.path, date: monthMatch[2] });
  }
  // Season Year
  else if (/\b(Spring|Summer|Fall|Autumn|Winter)\s+(19\d{2}|20[0-2]\d)\b/i.test(c)) {
    const match = c.match(/\b(Spring|Summer|Fall|Autumn|Winter)\s+(19\d{2}|20[0-2]\d)\b/i);
    datePatterns['season_year'].push({ path: doc.path, date: match[2] });
  }
  // Circa
  else if (/\b(?:circa|c\.)\s*(19\d{2}|20[0-2]\d)\b/i.test(c)) {
    const match = c.match(/\b(?:circa|c\.)\s*(19\d{2}|20[0-2]\d)\b/i);
    datePatterns['circa'].push({ path: doc.path, date: match[1] });
  }
}

console.log('Extractable date patterns found:');
for (const [pattern, docs] of Object.entries(datePatterns)) {
  if (docs.length > 0) {
    console.log(`\n${pattern}: ${docs.length}`);
    docs.slice(0, 5).forEach(d => console.log(`  ${d.date} <- ${d.path}`));
  }
}
