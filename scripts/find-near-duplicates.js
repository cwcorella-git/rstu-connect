#!/usr/bin/env node
/**
 * Find near-duplicate documents (>85% title similarity) in the reading library
 */

const fs = require('fs');
const path = require('path');
const manifest = require('../src/data/reading-manifest.json');

// Levenshtein distance-based similarity
function similarity(s1, s2) {
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  if (longer.length === 0) return 1.0;

  const costs = [];
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) costs[j] = j;
      else if (j > 0) {
        let newValue = costs[j - 1];
        if (s1.charAt(i - 1) !== s2.charAt(j - 1))
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  return (longer.length - costs[s2.length]) / longer.length;
}

// Normalize titles for comparison
function normalizeTitle(title) {
  return title
    .toLowerCase()
    .replace(/^article[_\s-]*/i, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Build document info
const docs = manifest.documents.map(doc => {
  const categoryFolder = doc.category.toLowerCase().replace(/\s+/g, '-');
  return {
    id: doc.id,
    title: doc.title,
    normalizedTitle: normalizeTitle(doc.title),
    category: doc.category,
    categoryFolder,
    filename: doc.filename,
    filepath: path.join('docs', categoryFolder, doc.filename),
    tags: doc.tags || [],
    wordCount: doc.wordCount || 0,
    polished: doc.polished || false
  };
});

console.log('=== NEAR-DUPLICATE ANALYSIS ===');
console.log('Total documents:', docs.length);
console.log('Checking similarity (this may take a minute)...\n');

// Find similar pairs (>85% similarity but not exact match)
const similarPairs = [];
const SIMILARITY_THRESHOLD = 0.85;

// Use first 60 chars for comparison to speed up
for (let i = 0; i < docs.length; i++) {
  const t1 = docs[i].normalizedTitle.slice(0, 60);

  for (let j = i + 1; j < docs.length; j++) {
    const t2 = docs[j].normalizedTitle.slice(0, 60);

    // Skip if exactly the same (already handled by exact duplicate script)
    if (t1 === t2) continue;

    const sim = similarity(t1, t2);
    if (sim >= SIMILARITY_THRESHOLD) {
      similarPairs.push({
        similarity: sim,
        doc1: docs[i],
        doc2: docs[j]
      });
    }
  }

  // Progress indicator
  if (i % 500 === 0) {
    process.stdout.write(`\rProgress: ${i}/${docs.length} documents checked...`);
  }
}

console.log(`\rProgress: ${docs.length}/${docs.length} documents checked.`);
console.log(`\nFound ${similarPairs.length} similar pairs (>${SIMILARITY_THRESHOLD * 100}% similar)\n`);

// Sort by similarity descending
similarPairs.sort((a, b) => b.similarity - a.similarity);

// Group overlapping pairs into clusters
const processed = new Set();
const clusters = [];

similarPairs.forEach(pair => {
  const id1 = pair.doc1.filepath;
  const id2 = pair.doc2.filepath;

  // Find existing cluster containing either document
  let existingCluster = clusters.find(c =>
    c.docs.some(d => d.filepath === id1 || d.filepath === id2)
  );

  if (existingCluster) {
    // Add both docs to existing cluster if not already there
    if (!existingCluster.docs.some(d => d.filepath === id1)) {
      existingCluster.docs.push(pair.doc1);
    }
    if (!existingCluster.docs.some(d => d.filepath === id2)) {
      existingCluster.docs.push(pair.doc2);
    }
  } else {
    // Create new cluster
    clusters.push({
      docs: [pair.doc1, pair.doc2],
      maxSimilarity: pair.similarity
    });
  }
});

console.log(`Grouped into ${clusters.length} clusters\n`);

// For each cluster, decide which to keep
const filesToDelete = [];
const decisions = [];

clusters.forEach((cluster, idx) => {
  // Sort by: polished first, then most tags, then highest word count
  const sorted = [...cluster.docs].sort((a, b) => {
    if (a.polished !== b.polished) return b.polished ? 1 : -1;
    if (a.tags.length !== b.tags.length) return b.tags.length - a.tags.length;
    return b.wordCount - a.wordCount;
  });

  const keep = sorted[0];
  const remove = sorted.slice(1);

  decisions.push({
    clusterIndex: idx + 1,
    similarity: (cluster.maxSimilarity * 100).toFixed(1) + '%',
    keep: {
      title: keep.title.slice(0, 60),
      filepath: keep.filepath,
      tags: keep.tags.length,
      wordCount: keep.wordCount
    },
    remove: remove.map(d => ({
      title: d.title.slice(0, 60),
      filepath: d.filepath,
      tags: d.tags.length,
      wordCount: d.wordCount
    }))
  });

  remove.forEach(doc => {
    filesToDelete.push({
      filepath: doc.filepath,
      title: doc.title,
      similarity: (cluster.maxSimilarity * 100).toFixed(1) + '%',
      keptVersion: keep.filepath
    });
  });
});

// Summary
console.log('=== NEAR-DUPLICATE CLEANUP RECOMMENDATION ===');
console.log('Clusters found:', clusters.length);
console.log('Files to DELETE:', filesToDelete.length);
console.log('');

// Save deletion list
const deletionListPath = 'near-duplicates-to-delete.txt';
fs.writeFileSync(deletionListPath, filesToDelete.map(f => f.filepath).join('\n'));
console.log('Deletion list saved to:', deletionListPath);

// Save detailed report
const reportPath = 'near-duplicate-report.json';
fs.writeFileSync(reportPath, JSON.stringify({
  summary: {
    totalDocuments: docs.length,
    similarPairsFound: similarPairs.length,
    clustersFormed: clusters.length,
    filesToDelete: filesToDelete.length,
    similarityThreshold: SIMILARITY_THRESHOLD
  },
  decisions,
  filesToDelete
}, null, 2));
console.log('Detailed report saved to:', reportPath);

// Print preview
console.log('\n=== PREVIEW: First 50 near-duplicate clusters ===\n');
decisions.slice(0, 50).forEach(d => {
  console.log(`Cluster ${d.clusterIndex} (${d.similarity} similar):`);
  console.log(`  [KEEP] ${d.keep.filepath.slice(0, 70)}`);
  console.log(`         (${d.keep.tags} tags, ${d.keep.wordCount} words)`);
  d.remove.forEach(r => {
    console.log(`  [DEL]  ${r.filepath.slice(0, 70)}`);
    console.log(`         (${r.tags} tags, ${r.wordCount} words)`);
  });
  console.log('');
});

if (decisions.length > 50) {
  console.log(`... and ${decisions.length - 50} more clusters`);
}
