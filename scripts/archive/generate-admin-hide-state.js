const fs = require('fs');
const path = require('path');

const manifest = require('../src/data/reading-manifest.json');

// Patterns for documents to hide
const HIDE_PATTERNS = {
  // Hide entire categories
  categories: ['Legislation', 'Notes'],
  // Hide documents matching these patterns (case-insensitive)
  titlePatterns: [
    'meeting',
    'agenda',
    'minutes',
    'bylaws',
    'google docs'
  ],
  // Hide documents with these exact filenames (partial match)
  filenamePatterns: [
    'Google Docs',
    'meeting',
    'Meeting',
    'bylaws',
    'Bylaws'
  ]
};

const hiddenDocuments = [];

for (const doc of manifest.documents) {
  let shouldHide = false;

  // Check category
  if (HIDE_PATTERNS.categories.includes(doc.category)) {
    shouldHide = true;
  }

  // Check title patterns
  if (!shouldHide) {
    const titleLower = doc.title.toLowerCase();
    for (const pattern of HIDE_PATTERNS.titlePatterns) {
      if (titleLower.includes(pattern)) {
        shouldHide = true;
        break;
      }
    }
  }

  // Check filename patterns
  if (!shouldHide) {
    for (const pattern of HIDE_PATTERNS.filenamePatterns) {
      if (doc.filename.includes(pattern)) {
        shouldHide = true;
        break;
      }
    }
  }

  if (shouldHide) {
    hiddenDocuments.push(doc.id);
    console.log(`Hide: [${doc.category}] ${doc.title.slice(0, 50)}`);
  }
}

const adminState = {
  hiddenDocuments,
  deletedDocuments: [],
  lastModified: Date.now()
};

// Save to data directory
const outputPath = path.join(__dirname, '../data/admin-hide-state.json');
fs.writeFileSync(outputPath, JSON.stringify(adminState, null, 2));

console.log(`\n=== Summary ===`);
console.log(`Hidden documents: ${hiddenDocuments.length}`);
console.log(`Saved to: data/admin-hide-state.json`);
console.log(`\nTo apply, run this in browser console:`);
console.log(`localStorage.setItem('rstu_admin_state', JSON.stringify(${JSON.stringify(adminState)}))`);
