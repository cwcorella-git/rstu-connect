const fs = require('fs');
const path = require('path');

const manifest = require('../src/data/reading-manifest.json');
const readingCollection = require('../data/reading-collection.json');

// Normalize title for comparison
function normalize(title) {
  return title.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Get existing RSTU titles (normalized)
const rstuTitles = new Set(manifest.documents.map(d => normalize(d.title)));

// Priority authors
const priorityAuthors = [
  'bookchin', 'kropotkin', 'graeber', 'goldman', 'bakunin',
  'rocker', 'chomsky', 'malatesta', 'luxemburg', 'berkman'
];

// Find import candidates from Reading Collection
const candidates = [];

for (const doc of readingCollection.documents) {
  const normalized = normalize(doc.title);

  // Skip if already in RSTU (fuzzy match)
  let exists = false;
  for (const rstuTitle of rstuTitles) {
    if (rstuTitle.includes(normalized.slice(0, 30)) || normalized.includes(rstuTitle.slice(0, 30))) {
      exists = true;
      break;
    }
  }
  if (exists) continue;

  // Check if priority author
  const authorLower = (doc.author || '').toLowerCase();
  const isPriority = priorityAuthors.some(a => authorLower.includes(a));

  // Check if housing-related
  const titleLower = doc.title.toLowerCase();
  const isHousing = doc.topic === 'Housing' ||
    titleLower.includes('tenant') ||
    titleLower.includes('rent') ||
    titleLower.includes('housing') ||
    titleLower.includes('landlord');

  if (isPriority || isHousing) {
    candidates.push({
      title: doc.title,
      author: doc.author,
      year: doc.publication,
      topic: doc.topic,
      priority: isPriority ? 'author' : 'housing',
      priorityAuthor: isPriority ? priorityAuthors.find(a => authorLower.includes(a)) : null
    });
  }
}

// Sort by priority author first, then by author name
candidates.sort((a, b) => {
  if (a.priorityAuthor && !b.priorityAuthor) return -1;
  if (!a.priorityAuthor && b.priorityAuthor) return 1;
  return (a.author || '').localeCompare(b.author || '');
});

console.log(`Found ${candidates.length} import candidates from Reading Collection:\n`);

// Group by author
const byAuthor = {};
for (const c of candidates) {
  const key = c.priorityAuthor || c.priority;
  if (!byAuthor[key]) byAuthor[key] = [];
  byAuthor[key].push(c);
}

for (const [author, docs] of Object.entries(byAuthor)) {
  console.log(`${author.toUpperCase()} (${docs.length}):`);
  docs.slice(0, 5).forEach(d => console.log(`  - ${d.title.slice(0, 60)} (${d.year})`));
  if (docs.length > 5) console.log(`  ... and ${docs.length - 5} more`);
  console.log('');
}

// Save to file
fs.writeFileSync(
  path.join(__dirname, '../data/import-candidates.json'),
  JSON.stringify({ total: candidates.length, candidates }, null, 2)
);

console.log(`\nSaved to data/import-candidates.json`);
