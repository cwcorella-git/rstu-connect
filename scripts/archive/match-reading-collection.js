const fs = require('fs');
const path = require('path');

const MANIFEST_FILE = path.join(__dirname, '../src/data/reading-manifest.json');
const COLLECTION_FILE = path.join(__dirname, '../data/reading-collection.json');
const OUTPUT_FILE = path.join(__dirname, '../data/collection-matches.json');
const CORRECTIONS_FILE = path.join(__dirname, '../data/author-corrections.json');

// Normalize title for comparison
function normalizeTitle(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')  // Remove punctuation
    .replace(/\s+/g, ' ')          // Normalize whitespace
    .trim();
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

// Check if title contains key phrase
function containsKeyPhrase(title, phrases) {
  const normalized = normalizeTitle(title);
  for (const phrase of phrases) {
    if (normalized.includes(normalizeTitle(phrase))) {
      return true;
    }
  }
  return false;
}

function matchDocuments() {
  console.log('🔍 RSTU ↔ Reading Collection Matcher');
  console.log('═'.repeat(50));

  // Load RSTU manifest
  if (!fs.existsSync(MANIFEST_FILE)) {
    console.error('❌ Manifest file not found:', MANIFEST_FILE);
    process.exit(1);
  }
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_FILE, 'utf8'));
  console.log(`📚 RSTU documents: ${manifest.documents.length}`);

  // Load Reading Collection
  if (!fs.existsSync(COLLECTION_FILE)) {
    console.error('❌ Collection file not found:', COLLECTION_FILE);
    console.error('   Run: python3 scripts/parse-reading-collection.py');
    process.exit(1);
  }
  const collection = JSON.parse(fs.readFileSync(COLLECTION_FILE, 'utf8'));
  console.log(`📖 Reading Collection: ${collection.documents.length}`);

  // Filter RSTU docs that need metadata
  const needsEnrichment = manifest.documents.filter(
    doc => !doc.author || !doc.date
  );
  console.log(`📝 RSTU docs needing metadata: ${needsEnrichment.length}`);

  // Build a lookup map from normalized titles
  const collectionMap = new Map();
  for (const doc of collection.documents) {
    const normalized = normalizeTitle(doc.title);
    if (!collectionMap.has(normalized)) {
      collectionMap.set(normalized, doc);
    }
  }

  const matches = [];
  const stats = {
    searched: 0,
    exact_matches: 0,
    fuzzy_matches: 0,
    author_found: 0,
    date_found: 0,
  };

  // Try to match each RSTU doc
  for (const rstuDoc of needsEnrichment) {
    stats.searched++;
    const normalizedTitle = normalizeTitle(rstuDoc.title);

    // Skip very short titles
    if (normalizedTitle.length < 5) continue;

    // Try exact match first
    let matched = collectionMap.get(normalizedTitle);
    let matchType = 'exact';

    // If no exact match, try fuzzy matching
    if (!matched) {
      let bestMatch = null;
      let bestSimilarity = 0;

      for (const doc of collection.documents) {
        const similarity = calculateSimilarity(
          normalizedTitle,
          normalizeTitle(doc.title)
        );

        // Higher threshold for fuzzy matches
        if (similarity > bestSimilarity && similarity >= 0.6) {
          bestSimilarity = similarity;
          bestMatch = { doc, similarity };
        }
      }

      if (bestMatch) {
        matched = bestMatch.doc;
        matchType = 'fuzzy';
      }
    }

    if (matched) {
      if (matchType === 'exact') stats.exact_matches++;
      else stats.fuzzy_matches++;

      const match = {
        rstu_id: rstuDoc.id,
        rstu_title: rstuDoc.title,
        rstu_filename: rstuDoc.filename,
        collection_title: matched.title,
        author: matched.author || null,
        year: matched.year || null,
        topic: matched.topic || null,
        match_type: matchType,
        needs_author: !rstuDoc.author,
        needs_date: !rstuDoc.date,
      };

      if (match.author && !rstuDoc.author) stats.author_found++;
      if (match.year && !rstuDoc.date) stats.date_found++;

      matches.push(match);
    }
  }

  console.log('\n═'.repeat(50));
  console.log('📊 Results Summary');
  console.log(`   Searched: ${stats.searched} documents`);
  console.log(`   Exact matches: ${stats.exact_matches}`);
  console.log(`   Fuzzy matches: ${stats.fuzzy_matches}`);
  console.log(`   Total matches: ${stats.exact_matches + stats.fuzzy_matches}`);
  console.log(`   Authors found: ${stats.author_found}`);
  console.log(`   Dates found: ${stats.date_found}`);

  // Write results
  const output = {
    generated: new Date().toISOString(),
    stats,
    matches,
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
  console.log(`\n📁 Results saved to: ${OUTPUT_FILE}`);

  // Show matches
  if (matches.length > 0) {
    console.log('\n📋 Matches found:');
    matches.forEach((m, i) => {
      console.log(`   ${i + 1}. "${m.rstu_title.slice(0, 50)}..."`);
      console.log(`      → "${m.collection_title.slice(0, 50)}..." (${m.match_type})`);
      console.log(`      Author: ${m.author || '(none)'}, Year: ${m.year || '(none)'}`);
    });
  }

  // Also add matches to author-corrections.json
  if (matches.length > 0) {
    let corrections = { corrections: {}, known_authors: {}, title_to_author: {} };
    if (fs.existsSync(CORRECTIONS_FILE)) {
      corrections = JSON.parse(fs.readFileSync(CORRECTIONS_FILE, 'utf8'));
    }

    let added = 0;
    for (const match of matches) {
      if (match.author && match.needs_author) {
        // Add to title_to_author mapping
        const key = match.rstu_title;
        if (!corrections.title_to_author[key]) {
          corrections.title_to_author[key] = {
            author: match.author,
            date: match.year ? String(match.year) : null,
          };
          added++;
        }
      }
    }

    if (added > 0) {
      fs.writeFileSync(CORRECTIONS_FILE, JSON.stringify(corrections, null, 2));
      console.log(`\n✅ Added ${added} new title_to_author mappings to author-corrections.json`);
    }
  }

  return { stats, matches };
}

matchDocuments();
