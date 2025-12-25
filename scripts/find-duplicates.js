const fs = require('fs');
const path = require('path');

const MANIFEST_FILE = path.join(__dirname, '../src/data/reading-manifest.json');
const OUTPUT_FILE = path.join(__dirname, '../data/duplicate-analysis.json');

// Normalize title for comparison
function normalizeTitle(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')  // Remove punctuation
    .replace(/\s+/g, ' ')          // Normalize whitespace
    .replace(/\b(the|a|an|of|and|in|to|for|on|with|by)\b/g, '') // Remove stop words
    .replace(/\s+/g, ' ')
    .trim();
}

// Extract core title (remove author names, dates, suffixes)
function extractCoreTitle(title) {
  let core = title
    .toLowerCase()
    // Remove common suffixes
    .replace(/\s*[-–—]\s*(audio\s*book|study\s*guide|pdf|a4|liber\d*).*$/i, '')
    .replace(/\s*\((audio|book|pdf|epub)\).*$/i, '')
    // Remove author names at end (pattern: "Title - Author Name")
    .replace(/\s*[-–—]\s*[a-z]+\s+[a-z]+\s*$/i, '')
    // Remove file artifacts
    .replace(/\s*_.*$/, '')
    .replace(/\s*article_.*$/i, '')
    // Clean up
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return core;
}

// Calculate Jaccard similarity
function calculateSimilarity(str1, str2) {
  const words1 = new Set(str1.split(' ').filter(w => w.length > 2));
  const words2 = new Set(str2.split(' ').filter(w => w.length > 2));

  if (words1.size === 0 || words2.size === 0) return 0;

  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
}

function findDuplicates() {
  console.log('🔍 Duplicate Document Analysis');
  console.log('═'.repeat(50));

  // Load manifest
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_FILE, 'utf8'));
  console.log(`📚 Total documents: ${manifest.documents.length}`);

  // Group by normalized title
  const titleGroups = new Map();
  const coreGroups = new Map();

  for (const doc of manifest.documents) {
    const normalized = normalizeTitle(doc.title);
    const core = extractCoreTitle(doc.title);

    // Group by normalized title
    if (!titleGroups.has(normalized)) {
      titleGroups.set(normalized, []);
    }
    titleGroups.get(normalized).push(doc);

    // Group by core title
    if (core.length >= 5) {
      if (!coreGroups.has(core)) {
        coreGroups.set(core, []);
      }
      coreGroups.get(core).push(doc);
    }
  }

  // Find exact duplicates (same normalized title)
  const exactDuplicates = [];
  for (const [title, docs] of titleGroups) {
    if (docs.length > 1) {
      exactDuplicates.push({
        normalized_title: title,
        count: docs.length,
        documents: docs.map(d => ({
          id: d.id,
          title: d.title,
          filename: d.filename,
          category: d.category,
          author: d.author,
          date: d.date,
          wordCount: d.wordCount,
        }))
      });
    }
  }

  // Find near-duplicates (same core title, different versions)
  const nearDuplicates = [];
  for (const [core, docs] of coreGroups) {
    if (docs.length > 1) {
      // Check if they're not already in exact duplicates
      const normalizedTitles = new Set(docs.map(d => normalizeTitle(d.title)));
      if (normalizedTitles.size > 1) {
        nearDuplicates.push({
          core_title: core,
          count: docs.length,
          documents: docs.map(d => ({
            id: d.id,
            title: d.title,
            filename: d.filename,
            category: d.category,
            author: d.author,
            date: d.date,
            wordCount: d.wordCount,
          }))
        });
      }
    }
  }

  // Find potential duplicates via similarity matching
  const potentialDuplicates = [];
  const docs = manifest.documents;
  const checked = new Set();

  for (let i = 0; i < docs.length; i++) {
    const doc1 = docs[i];
    const norm1 = normalizeTitle(doc1.title);

    if (norm1.length < 10) continue; // Skip very short titles

    for (let j = i + 1; j < docs.length; j++) {
      const doc2 = docs[j];
      const norm2 = normalizeTitle(doc2.title);

      if (norm2.length < 10) continue;

      const key = [doc1.id, doc2.id].sort().join('|');
      if (checked.has(key)) continue;
      checked.add(key);

      const similarity = calculateSimilarity(norm1, norm2);

      if (similarity >= 0.7 && similarity < 1.0) {
        // Check if not already in exact or near duplicates
        const inExact = exactDuplicates.some(g =>
          g.documents.some(d => d.id === doc1.id) &&
          g.documents.some(d => d.id === doc2.id)
        );
        const inNear = nearDuplicates.some(g =>
          g.documents.some(d => d.id === doc1.id) &&
          g.documents.some(d => d.id === doc2.id)
        );

        if (!inExact && !inNear) {
          potentialDuplicates.push({
            similarity: Math.round(similarity * 100),
            doc1: {
              id: doc1.id,
              title: doc1.title,
              filename: doc1.filename,
              category: doc1.category,
              author: doc1.author,
              wordCount: doc1.wordCount,
            },
            doc2: {
              id: doc2.id,
              title: doc2.title,
              filename: doc2.filename,
              category: doc2.category,
              author: doc2.author,
              wordCount: doc2.wordCount,
            }
          });
        }
      }
    }
  }

  // Sort by similarity
  potentialDuplicates.sort((a, b) => b.similarity - a.similarity);

  // Calculate stats
  const exactDupDocs = exactDuplicates.reduce((sum, g) => sum + g.count - 1, 0);
  const nearDupDocs = nearDuplicates.reduce((sum, g) => sum + g.count - 1, 0);

  console.log(`\n📊 Duplicate Analysis:`);
  console.log(`   Exact duplicates: ${exactDuplicates.length} groups (${exactDupDocs} removable)`);
  console.log(`   Near duplicates: ${nearDuplicates.length} groups (${nearDupDocs} variants)`);
  console.log(`   Potential matches: ${potentialDuplicates.length} pairs`);

  // Show exact duplicates
  if (exactDuplicates.length > 0) {
    console.log(`\n🔴 Exact Duplicates (${exactDuplicates.length} groups):`);
    exactDuplicates.slice(0, 15).forEach((group, i) => {
      console.log(`   ${i + 1}. "${group.documents[0].title.slice(0, 50)}..." (${group.count} copies)`);
      group.documents.forEach(d => {
        console.log(`      • ${d.category}/${d.filename.slice(0, 40)}... (${d.wordCount} words)`);
      });
    });
    if (exactDuplicates.length > 15) {
      console.log(`   ... and ${exactDuplicates.length - 15} more groups`);
    }
  }

  // Show near duplicates
  if (nearDuplicates.length > 0) {
    console.log(`\n🟡 Near Duplicates (${nearDuplicates.length} groups):`);
    nearDuplicates.slice(0, 15).forEach((group, i) => {
      console.log(`   ${i + 1}. Core: "${group.core_title.slice(0, 40)}..." (${group.count} versions)`);
      group.documents.forEach(d => {
        const suffix = d.author ? ` by ${d.author}` : '';
        console.log(`      • "${d.title.slice(0, 50)}..."${suffix}`);
      });
    });
    if (nearDuplicates.length > 15) {
      console.log(`   ... and ${nearDuplicates.length - 15} more groups`);
    }
  }

  // Save full analysis
  const analysis = {
    generated: new Date().toISOString(),
    summary: {
      total_documents: manifest.documents.length,
      exact_duplicate_groups: exactDuplicates.length,
      exact_duplicates_removable: exactDupDocs,
      near_duplicate_groups: nearDuplicates.length,
      potential_pairs: potentialDuplicates.length,
    },
    exact_duplicates: exactDuplicates,
    near_duplicates: nearDuplicates,
    potential_duplicates: potentialDuplicates.slice(0, 50), // Top 50
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(analysis, null, 2));
  console.log(`\n📁 Full analysis saved to: ${OUTPUT_FILE}`);

  return analysis;
}

findDuplicates();
