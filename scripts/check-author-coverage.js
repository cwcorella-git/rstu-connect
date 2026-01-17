#!/usr/bin/env node
/**
 * Check author coverage statistics
 */

const manifest = require('../src/data/reading-manifest.json');

let withAuthor = 0;
const total = manifest.documents.length;
const authors = {};

for (const doc of manifest.documents) {
  if (doc.author && doc.author !== 'Unknown') {
    withAuthor++;
    authors[doc.author] = (authors[doc.author] || 0) + 1;
  }
}

console.log('=== AUTHOR COVERAGE ===');
console.log('Total documents:', total);
console.log('With author:', withAuthor, `(${Math.round(withAuthor/total*100)}%)`);
console.log('Without author:', total - withAuthor);
console.log('');
console.log('=== TOP AUTHORS ===');
Object.entries(authors)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 15)
  .forEach(([author, count]) => console.log(`  ${count}x ${author}`));
