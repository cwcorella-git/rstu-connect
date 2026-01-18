#!/usr/bin/env node
/**
 * Analyze date patterns in documents without dates
 */

const fs = require('fs');
const path = require('path');

const docsDir = path.join(__dirname, '../docs');

const patterns = {
  'MM/DD/YYYY': [],
  'Month DD, YYYY': [],
  'YYYY-MM-DD': [],
  '(YYYY)': [],
  'Copyright YYYY': [],
  'Published YYYY': [],
  'No pattern': []
};

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
  const content = fs.readFileSync(filepath, 'utf8');

  if (!content.startsWith('---')) return;

  const endIdx = content.indexOf('---', 3);
  if (endIdx === -1) return;

  const fm = content.substring(3, endIdx);

  // Skip if already has a valid date
  const dateMatch = fm.match(/^date:\s*(.+)$/m);
  if (dateMatch) {
    const dateVal = dateMatch[1].trim();
    if (dateVal && /\d{4}/.test(dateVal)) return;
  }

  const body = content.substring(endIdx + 3, endIdx + 3000);
  const relPath = path.relative(docsDir, filepath);

  if (/\d{1,2}\/\d{1,2}\/\d{4}/.test(body)) {
    patterns['MM/DD/YYYY'].push(relPath);
  } else if (/(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}/i.test(body)) {
    patterns['Month DD, YYYY'].push(relPath);
  } else if (/\d{4}-\d{2}-\d{2}/.test(body)) {
    patterns['YYYY-MM-DD'].push(relPath);
  } else if (/\(\d{4}\)/.test(body)) {
    patterns['(YYYY)'].push(relPath);
  } else if (/[Cc]opyright\s+\d{4}/.test(body)) {
    patterns['Copyright YYYY'].push(relPath);
  } else if (/[Pp]ublished\s+.*\d{4}/.test(body)) {
    patterns['Published YYYY'].push(relPath);
  } else {
    patterns['No pattern'].push(relPath);
  }
}

walkDir(docsDir);

console.log('Date patterns in documents without dates:\n');
for (const [pattern, files] of Object.entries(patterns)) {
  console.log(`${pattern}: ${files.length}`);
}
