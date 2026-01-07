#!/usr/bin/env node
/**
 * Analyze tag coverage in the reading library
 */

const manifest = require('../src/data/reading-manifest.json');

const noTags = manifest.documents.filter(d => !d.tags || d.tags.length === 0);
const withTags = manifest.documents.filter(d => d.tags && d.tags.length > 0);

console.log('=== TAG ANALYSIS ===\n');
console.log('Total documents:', manifest.documents.length);
console.log('With tags:', withTags.length);
console.log('Without tags:', noTags.length);
console.log('Coverage:', ((withTags.length / manifest.documents.length) * 100).toFixed(1) + '%');

// Group untagged by category
const byCategory = {};
for (const doc of noTags) {
  if (!byCategory[doc.category]) byCategory[doc.category] = [];
  byCategory[doc.category].push(doc);
}

console.log('\n=== UNTAGGED BY CATEGORY ===\n');
Object.entries(byCategory)
  .sort((a, b) => b[1].length - a[1].length)
  .forEach(([cat, docs]) => {
    console.log(`${cat}: ${docs.length}`);
  });

console.log('\n=== SAMPLE UNTAGGED DOCUMENTS ===\n');
noTags.slice(0, 20).forEach(d => {
  console.log(`[${d.category}] ${d.title.substring(0, 70)}`);
});

// Show Contemporary Analysis sample
const caUntagged = noTags.filter(d => d.category === 'Contemporary Analysis');
console.log('\n=== UNTAGGED CONTEMPORARY ANALYSIS (sample) ===\n');
caUntagged.slice(0, 30).forEach(d => {
  console.log(d.title.substring(0, 80));
});
