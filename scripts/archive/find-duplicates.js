const fs = require('fs');
const path = require('path');
const manifest = require('../src/data/reading-manifest.json');

// Normalize titles for comparison
function normalizeTitle(title) {
  return title
    .toLowerCase()
    .replace(/^article[_\s-]*/i, '')  // Remove 'Article_' prefix
    .replace(/[^a-z0-9\s]/g, ' ')      // Remove special chars
    .replace(/\s+/g, ' ')              // Collapse whitespace
    .trim();
}

// Group documents by normalized title
const titleGroups = {};
manifest.documents.forEach(doc => {
  const normalized = normalizeTitle(doc.title);
  if (!titleGroups[normalized]) {
    titleGroups[normalized] = [];
  }

  // Get category folder name (lowercase, hyphenated)
  const categoryFolder = doc.category.toLowerCase().replace(/\s+/g, '-');

  titleGroups[normalized].push({
    id: doc.id,
    title: doc.title,
    category: doc.category,
    categoryFolder,
    filename: doc.filename,
    filepath: path.join('docs', categoryFolder, doc.filename),
    tags: doc.tags || [],
    wordCount: doc.wordCount || 0,
    polished: doc.polished || false
  });
});

// Find duplicates (groups with more than 1 document)
const duplicates = Object.entries(titleGroups)
  .filter(([_, docs]) => docs.length > 1)
  .sort((a, b) => b[1].length - a[1].length);

console.log('=== DUPLICATE ANALYSIS REPORT ===');
console.log('Total documents:', manifest.documents.length);
console.log('Unique titles (normalized):', Object.keys(titleGroups).length);
console.log('Duplicate groups:', duplicates.length);
console.log('Documents in duplicate groups:', duplicates.reduce((sum, [_, docs]) => sum + docs.length, 0));
console.log('');

// Determine which files to keep and which to delete
const filesToDelete = [];
const filesToKeep = [];

duplicates.forEach(([normalized, docs]) => {
  // Sort by: polished first, then most tags, then highest word count
  const sorted = [...docs].sort((a, b) => {
    if (a.polished !== b.polished) return b.polished ? 1 : -1;
    if (a.tags.length !== b.tags.length) return b.tags.length - a.tags.length;
    return b.wordCount - a.wordCount;
  });

  const keep = sorted[0];
  const remove = sorted.slice(1);

  filesToKeep.push({
    title: keep.title,
    filepath: keep.filepath,
    tags: keep.tags.length,
    wordCount: keep.wordCount,
    polished: keep.polished,
    duplicateCount: docs.length
  });

  remove.forEach(doc => {
    filesToDelete.push({
      filepath: doc.filepath,
      title: doc.title,
      reason: `Duplicate of: ${keep.filepath}`,
      keptVersion: keep.filepath
    });
  });
});

// Print summary
console.log('=== CLEANUP RECOMMENDATION ===');
console.log('Files to KEEP (best version):', filesToKeep.length);
console.log('Files to DELETE:', filesToDelete.length);
console.log('');

// Save deletion list
const deletionListPath = 'duplicates-to-delete.txt';
fs.writeFileSync(deletionListPath, filesToDelete.map(f => f.filepath).join('\n'));
console.log('Deletion list saved to:', deletionListPath);

// Save detailed report
const reportPath = 'duplicate-report.json';
fs.writeFileSync(reportPath, JSON.stringify({
  summary: {
    totalDocuments: manifest.documents.length,
    uniqueTitles: Object.keys(titleGroups).length,
    duplicateGroups: duplicates.length,
    filesToDelete: filesToDelete.length,
    filesToKeep: filesToKeep.length
  },
  filesToDelete,
  filesToKeep,
  duplicateGroups: duplicates.map(([normalized, docs]) => ({
    normalizedTitle: normalized.slice(0, 80),
    count: docs.length,
    documents: docs.map(d => ({
      category: d.category,
      filename: d.filename,
      filepath: d.filepath,
      tags: d.tags.length,
      wordCount: d.wordCount
    }))
  }))
}, null, 2));
console.log('Detailed report saved to:', reportPath);

// Print first 30 duplicates for preview
console.log('\n=== PREVIEW: First 30 duplicate groups ===\n');
duplicates.slice(0, 30).forEach(([normalized, docs], i) => {
  console.log(`${i + 1}. "${docs[0].title.slice(0, 60)}..." (${docs.length} copies)`);
  docs.forEach((doc, j) => {
    const status = j === 0 ? 'KEEP' : 'DELETE';
    const tagInfo = doc.tags.length > 0 ? `${doc.tags.length} tags` : 'no tags';
    console.log(`   [${status}] ${doc.category}/${doc.filename.slice(0, 40)}... (${tagInfo}, ${doc.wordCount} words)`);
  });
  console.log('');
});
