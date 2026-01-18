#!/usr/bin/env node
/**
 * Find documents with issues in reading-manifest.json
 */

const fs = require('fs');
const path = require('path');

const manifest = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/data/reading-manifest.json'), 'utf8')
);

const issues = {
  hashPrefix: [],        // Titles starting with #
  lowercaseStart: [],    // Titles starting with lowercase
  authorInTitle: [],     // Author name appears in title
  unknownAuthor: [],     // Author is "Unknown" or null
  noDate: [],            // No date
  truncatedTitle: [],    // Title ends with ... or is cut off
  quoteTitle: [],        // Title starts with quote or dash
  articlePrefix: [],     // Title starts with "Article_" or similar
  numbersOnly: [],       // Title is mostly numbers
  duplicateTitles: [],   // Same title appears multiple times
};

const titleCounts = {};

for (const doc of manifest.documents) {
  const title = doc.title || '';
  const author = doc.author;
  const date = doc.date;

  // Track duplicates
  const normalizedTitle = title.toLowerCase().trim();
  titleCounts[normalizedTitle] = (titleCounts[normalizedTitle] || 0) + 1;

  // Check for # prefix
  if (title.startsWith('#') || title.startsWith('## ')) {
    issues.hashPrefix.push({ title, file: doc.filename, category: doc.category });
  }

  // Check for lowercase start (excluding articles and common words)
  if (/^[a-z]/.test(title) && !/^(the|a|an|of|in|on|at|to|for|and|or|but)\s/i.test(title)) {
    issues.lowercaseStart.push({ title, file: doc.filename, category: doc.category });
  }

  // Check for author in title
  if (author && author !== 'Unknown' && title.toLowerCase().includes(author.toLowerCase().split(' ')[0])) {
    issues.authorInTitle.push({ title, author, file: doc.filename, category: doc.category });
  }

  // Check for unknown/null author
  if (!author || author === 'Unknown' || author === 'null') {
    issues.unknownAuthor.push({ title, file: doc.filename, category: doc.category });
  }

  // Check for no date
  if (!date || date === 'Unknown') {
    issues.noDate.push({ title, file: doc.filename, category: doc.category });
  }

  // Check for truncated titles
  if (title.endsWith('...') || title.endsWith('…') || /[a-z]$/.test(title) && title.length > 60) {
    issues.truncatedTitle.push({ title, file: doc.filename, category: doc.category });
  }

  // Check for quote/dash prefix
  if (/^[—–\-"'"']/.test(title)) {
    issues.quoteTitle.push({ title, file: doc.filename, category: doc.category });
  }

  // Check for Article_ prefix or similar patterns
  if (/^(Article_|Planning_|Chapter_|\d+[-_])/i.test(title)) {
    issues.articlePrefix.push({ title, file: doc.filename, category: doc.category });
  }

  // Check for titles that are mostly numbers
  if (/^\d[\d\s\-_]+$/.test(title)) {
    issues.numbersOnly.push({ title, file: doc.filename, category: doc.category });
  }
}

// Find duplicates
for (const [normalizedTitle, count] of Object.entries(titleCounts)) {
  if (count > 1) {
    const docs = manifest.documents.filter(d => (d.title || '').toLowerCase().trim() === normalizedTitle);
    issues.duplicateTitles.push({
      title: docs[0].title,
      count,
      files: docs.map(d => d.filename)
    });
  }
}

// Print report
console.log('=== DOCUMENT ISSUES REPORT ===\n');
console.log(`Total documents: ${manifest.documents.length}\n`);

console.log(`\n--- Titles starting with # (${issues.hashPrefix.length}) ---`);
issues.hashPrefix.slice(0, 20).forEach(d => console.log(`  "${d.title.substring(0, 60)}..." [${d.category}]`));
if (issues.hashPrefix.length > 20) console.log(`  ... and ${issues.hashPrefix.length - 20} more`);

console.log(`\n--- Titles starting with quote/dash (${issues.quoteTitle.length}) ---`);
issues.quoteTitle.slice(0, 20).forEach(d => console.log(`  "${d.title.substring(0, 60)}..." [${d.category}]`));
if (issues.quoteTitle.length > 20) console.log(`  ... and ${issues.quoteTitle.length - 20} more`);

console.log(`\n--- Titles with Article_ prefix (${issues.articlePrefix.length}) ---`);
issues.articlePrefix.slice(0, 20).forEach(d => console.log(`  "${d.title.substring(0, 60)}..." [${d.category}]`));
if (issues.articlePrefix.length > 20) console.log(`  ... and ${issues.articlePrefix.length - 20} more`);

console.log(`\n--- Lowercase titles (${issues.lowercaseStart.length}) ---`);
issues.lowercaseStart.slice(0, 20).forEach(d => console.log(`  "${d.title.substring(0, 60)}..." [${d.category}]`));
if (issues.lowercaseStart.length > 20) console.log(`  ... and ${issues.lowercaseStart.length - 20} more`);

console.log(`\n--- Unknown/missing author (${issues.unknownAuthor.length}) ---`);
console.log(`  (Showing first 10)`);
issues.unknownAuthor.slice(0, 10).forEach(d => console.log(`  "${d.title.substring(0, 50)}..." [${d.category}]`));

console.log(`\n--- No date (${issues.noDate.length}) ---`);
console.log(`  (Showing first 10)`);
issues.noDate.slice(0, 10).forEach(d => console.log(`  "${d.title.substring(0, 50)}..." [${d.category}]`));

console.log(`\n--- Duplicate titles (${issues.duplicateTitles.length}) ---`);
issues.duplicateTitles.slice(0, 10).forEach(d => console.log(`  "${d.title.substring(0, 50)}..." (${d.count}x)`));
if (issues.duplicateTitles.length > 10) console.log(`  ... and ${issues.duplicateTitles.length - 10} more`);

console.log(`\n--- Truncated titles (${issues.truncatedTitle.length}) ---`);
issues.truncatedTitle.slice(0, 10).forEach(d => console.log(`  "${d.title.substring(0, 60)}..." [${d.category}]`));
if (issues.truncatedTitle.length > 10) console.log(`  ... and ${issues.truncatedTitle.length - 10} more`);

console.log('\n=== SUMMARY ===');
console.log(`Hash prefix: ${issues.hashPrefix.length}`);
console.log(`Quote/dash prefix: ${issues.quoteTitle.length}`);
console.log(`Article_ prefix: ${issues.articlePrefix.length}`);
console.log(`Lowercase start: ${issues.lowercaseStart.length}`);
console.log(`Unknown author: ${issues.unknownAuthor.length}`);
console.log(`No date: ${issues.noDate.length}`);
console.log(`Duplicates: ${issues.duplicateTitles.length}`);
console.log(`Truncated: ${issues.truncatedTitle.length}`);
