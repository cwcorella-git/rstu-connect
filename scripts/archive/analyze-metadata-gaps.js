const fs = require('fs');
const path = require('path');

const manifest = require('../src/data/reading-manifest.json');
const docs = manifest.documents;

const noAuthor = docs.filter(d => !d.author);
const noDate = docs.filter(d => !d.date);
const noTags = docs.filter(d => !d.tags || d.tags.length === 0);

console.log('=== METADATA GAPS ===');
console.log('Total documents:', docs.length);
console.log('Missing author:', noAuthor.length, `(${(100 * noAuthor.length / docs.length).toFixed(1)}%)`);
console.log('Missing date:', noDate.length, `(${(100 * noDate.length / docs.length).toFixed(1)}%)`);
console.log('Missing tags:', noTags.length, `(${(100 * noTags.length / docs.length).toFixed(1)}%)`);
console.log('');

// Group by category
const byCategory = {};
for (const d of noAuthor) {
  if (!byCategory[d.category]) byCategory[d.category] = [];
  byCategory[d.category].push(d);
}

console.log('=== Missing Authors by Category ===');
for (const [cat, catDocs] of Object.entries(byCategory).sort((a, b) => b[1].length - a[1].length)) {
  console.log(`${cat}: ${catDocs.length} docs without author`);
}
console.log('');

console.log('=== Sample Docs Missing Author ===');
noAuthor.slice(0, 20).forEach(d => {
  console.log(`  [${d.category}] ${d.title.slice(0, 55)}`);
});

// Output IDs for further processing
fs.writeFileSync(
  path.join(__dirname, '../data/docs-missing-author.json'),
  JSON.stringify(noAuthor.map(d => ({ id: d.id, title: d.title, category: d.category, filename: d.filename })), null, 2)
);

fs.writeFileSync(
  path.join(__dirname, '../data/docs-missing-date.json'),
  JSON.stringify(noDate.map(d => ({ id: d.id, title: d.title, category: d.category, filename: d.filename, author: d.author })), null, 2)
);

console.log('');
console.log('Saved docs-missing-author.json and docs-missing-date.json');
