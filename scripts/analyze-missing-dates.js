#!/usr/bin/env node
/**
 * Analyze documents without dates to find extractable patterns
 */

const fs = require('fs');
const path = require('path');

const docsDir = path.join(__dirname, '../docs');

const samples = [];
const patterns = {
  'has_year_in_filename': [],
  'has_year_in_title': [],
  'has_year_in_content': [],
  'has_date_unknown': [],
  'no_pattern': [],
};

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

  // Check if already has date
  const dateMatch = fm.match(/^date:\s*["']?(.+?)["']?\s*$/m);
  if (dateMatch) {
    const dateVal = dateMatch[1].trim();
    if (dateVal && /\d{4}/.test(dateVal)) return; // Has valid date
  }

  const relPath = path.relative(docsDir, filepath);
  const titleMatch = fm.match(/^title:\s*["']?(.+?)["']?\s*$/m);
  const title = titleMatch ? titleMatch[1] : '';

  // Check for year patterns
  const yearRegex = /\b(19\d{2}|20[0-2]\d)\b/;

  // Check filename
  if (yearRegex.test(filename)) {
    const match = filename.match(yearRegex);
    patterns['has_year_in_filename'].push({ path: relPath, year: match[1] });
    return;
  }

  // Check title
  if (yearRegex.test(title)) {
    const match = title.match(yearRegex);
    patterns['has_year_in_title'].push({ path: relPath, year: match[1], title });
    return;
  }

  // Check content (first 100 lines)
  const first100 = body.split('\n').slice(0, 100).join('\n');
  if (yearRegex.test(first100)) {
    const match = first100.match(yearRegex);
    patterns['has_year_in_content'].push({ path: relPath, year: match[1] });
    return;
  }

  // Check for "Date: Unknown"
  if (/Date:?\s*Unknown/i.test(body)) {
    patterns['has_date_unknown'].push(relPath);
    return;
  }

  patterns['no_pattern'].push(relPath);
}

walkDir(docsDir);

console.log('=== DOCUMENTS WITHOUT DATES ===\n');
console.log('Year in filename:', patterns['has_year_in_filename'].length);
console.log('Year in title:', patterns['has_year_in_title'].length);
console.log('Year in content:', patterns['has_year_in_content'].length);
console.log('Date: Unknown marker:', patterns['has_date_unknown'].length);
console.log('No pattern found:', patterns['no_pattern'].length);

console.log('\n=== SAMPLES WITH YEAR IN FILENAME ===');
patterns['has_year_in_filename'].slice(0, 10).forEach(p =>
  console.log(`  ${p.year}: ${p.path}`));

console.log('\n=== SAMPLES WITH YEAR IN TITLE ===');
patterns['has_year_in_title'].slice(0, 10).forEach(p =>
  console.log(`  ${p.year}: ${p.title.slice(0, 50)}`));

console.log('\n=== SAMPLES WITH YEAR IN CONTENT ===');
patterns['has_year_in_content'].slice(0, 10).forEach(p =>
  console.log(`  ${p.year}: ${p.path}`));

// Group no_pattern by category
const byCat = {};
patterns['no_pattern'].forEach(relPath => {
  const cat = relPath.split('/')[0] || 'unknown';
  byCat[cat] = (byCat[cat] || 0) + 1;
});
console.log('\n=== NO PATTERN - BY CATEGORY ===');
Object.entries(byCat).sort((a,b) => b[1] - a[1]).forEach(([cat, count]) => {
  console.log(`  ${count}x ${cat}`);
});
