const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const MANIFEST_FILE = path.join(__dirname, '../src/data/reading-manifest.json');
const OUTPUT_FILE = path.join(__dirname, '../data/anarchist-matches.json');

// PostgreSQL connection to veritable-games server
const pool = new Pool({
  host: '192.168.1.15',
  port: 5432,
  database: 'veritable_games',
  user: 'postgres',
  password: 'postgres',
  connectionTimeoutMillis: 5000,
});

// Normalize title for comparison
function normalizeTitle(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')  // Remove punctuation
    .replace(/\s+/g, ' ')          // Normalize whitespace
    .trim();
}

// Calculate similarity between two strings (simple Jaccard similarity on words)
function calculateSimilarity(str1, str2) {
  const words1 = new Set(str1.split(' ').filter(w => w.length > 2));
  const words2 = new Set(str2.split(' ').filter(w => w.length > 2));

  if (words1.size === 0 || words2.size === 0) return 0;

  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
}

async function enrichMetadata() {
  console.log('🔍 RSTU Connect Metadata Enrichment');
  console.log('═'.repeat(50));

  // Load RSTU manifest
  if (!fs.existsSync(MANIFEST_FILE)) {
    console.error('❌ Manifest file not found:', MANIFEST_FILE);
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_FILE, 'utf8'));
  console.log(`📚 Loaded ${manifest.documents.length} RSTU documents`);

  // Filter docs missing author or date
  const needsEnrichment = manifest.documents.filter(
    doc => !doc.author || !doc.date
  );
  console.log(`📝 ${needsEnrichment.length} documents need metadata enrichment`);

  // Test database connection
  let client;
  try {
    client = await pool.connect();
    const result = await client.query('SELECT COUNT(*) FROM anarchist.documents');
    console.log(`🔗 Connected to Anarchist Library (${result.rows[0].count} documents)`);
  } catch (err) {
    console.error('❌ Failed to connect to PostgreSQL:', err.message);
    console.error('Make sure the server at 192.168.1.15 is accessible.');
    process.exit(1);
  }

  const matches = [];
  const stats = {
    searched: 0,
    matched: 0,
    author_found: 0,
    date_found: 0,
  };

  // Search for each document
  for (const doc of needsEnrichment) {
    stats.searched++;
    const normalizedTitle = normalizeTitle(doc.title);

    // Skip very short titles
    if (normalizedTitle.length < 5) continue;

    // Extract key words for search (remove common words)
    const stopWords = ['the', 'a', 'an', 'of', 'and', 'in', 'to', 'for', 'on', 'with', 'by'];
    const keywords = normalizedTitle
      .split(' ')
      .filter(w => w.length > 2 && !stopWords.includes(w))
      .slice(0, 5)
      .join(' ');

    if (!keywords) continue;

    try {
      // Search by title using ILIKE with keywords
      const query = `
        SELECT id, slug, title, author, publication_date, language, source_url
        FROM anarchist.documents
        WHERE language = 'en'
          AND (
            LOWER(title) LIKE $1
            OR LOWER(title) LIKE $2
          )
        ORDER BY
          CASE WHEN LOWER(title) LIKE $1 THEN 0 ELSE 1 END,
          LENGTH(title)
        LIMIT 5
      `;

      const result = await client.query(query, [
        `%${keywords}%`,
        `%${normalizedTitle.slice(0, 30)}%`
      ]);

      if (result.rows.length > 0) {
        // Find best match by similarity
        let bestMatch = null;
        let bestSimilarity = 0;

        for (const row of result.rows) {
          const similarity = calculateSimilarity(
            normalizedTitle,
            normalizeTitle(row.title)
          );

          if (similarity > bestSimilarity && similarity >= 0.5) {
            bestSimilarity = similarity;
            bestMatch = row;
          }
        }

        if (bestMatch && bestSimilarity >= 0.5) {
          stats.matched++;

          const match = {
            rstu_id: doc.id,
            rstu_title: doc.title,
            rstu_filename: doc.filename,
            anarchist_slug: bestMatch.slug,
            anarchist_title: bestMatch.title,
            author: bestMatch.author || null,
            date: bestMatch.publication_date || null,
            source_url: bestMatch.source_url || null,
            similarity: Math.round(bestSimilarity * 100),
            needs_author: !doc.author,
            needs_date: !doc.date,
          };

          if (match.author && !doc.author) stats.author_found++;
          if (match.date && !doc.date) stats.date_found++;

          matches.push(match);

          if (stats.matched % 10 === 0) {
            process.stdout.write(`\r🔍 Searched: ${stats.searched}/${needsEnrichment.length}, Matched: ${stats.matched}`);
          }
        }
      }
    } catch (err) {
      console.error(`\n⚠️  Error searching for "${doc.title}":`, err.message);
    }
  }

  client.release();
  await pool.end();

  console.log('\n');
  console.log('═'.repeat(50));
  console.log('📊 Results Summary');
  console.log(`   Searched: ${stats.searched} documents`);
  console.log(`   Matched: ${stats.matched} documents`);
  console.log(`   Authors found: ${stats.author_found}`);
  console.log(`   Dates found: ${stats.date_found}`);

  // Sort matches by similarity (highest first)
  matches.sort((a, b) => b.similarity - a.similarity);

  // Ensure output directory exists
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write results
  const output = {
    generated: new Date().toISOString(),
    stats,
    matches,
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
  console.log(`\n📁 Results saved to: ${OUTPUT_FILE}`);

  // Show top matches
  if (matches.length > 0) {
    console.log('\n📋 Top 10 Matches:');
    matches.slice(0, 10).forEach((m, i) => {
      console.log(`   ${i + 1}. "${m.rstu_title.slice(0, 40)}..." → "${m.anarchist_title.slice(0, 40)}..."`);
      console.log(`      Author: ${m.author || '(none)'}, Date: ${m.date || '(none)'}, Similarity: ${m.similarity}%`);
    });
  }
}

enrichMetadata().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
