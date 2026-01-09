const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database connection from environment variable or individual settings
// Set LOCAL_PG_URL=postgresql://user:pass@host:port/db or individual vars
const pool = new Pool(
  process.env.LOCAL_PG_URL
    ? { connectionString: process.env.LOCAL_PG_URL }
    : {
        host: process.env.LOCAL_PG_HOST || 'localhost',
        port: parseInt(process.env.LOCAL_PG_PORT || '5432'),
        database: process.env.LOCAL_PG_DATABASE || 'veritable_games',
        user: process.env.LOCAL_PG_USER || 'postgres',
        password: process.env.LOCAL_PG_PASSWORD,
      }
);

if (!process.env.LOCAL_PG_URL && !process.env.LOCAL_PG_PASSWORD) {
  console.warn('Warning: No database credentials configured.');
  console.warn('Set LOCAL_PG_URL or LOCAL_PG_PASSWORD environment variable.');
}

async function enrichMetadata() {
  try {
    // Read the RSTU manifest
    console.log('Reading RSTU manifest...');
    const manifestPath = path.join(__dirname, '../src/data/reading-manifest.json');
    const manifestData = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    const manifest = manifestData.documents;

    console.log(`Total documents in manifest: ${manifest.length}`);

    // Find documents missing author OR date
    const docsNeedingMetadata = manifest.filter(doc => !doc.author || !doc.date);
    console.log(`Documents missing author or date: ${docsNeedingMetadata.length}`);

    const matches = [];
    let matchCount = 0;
    let noMatchCount = 0;

    // Connect to database
    console.log('Connecting to PostgreSQL database...');
    await pool.connect();
    console.log('Connected successfully!');

    // Check table schema
    console.log('\nChecking table schema...');
    const schemaQuery = `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'anarchist' AND table_name = 'documents'
      ORDER BY ordinal_position;
    `;
    const schemaResult = await pool.query(schemaQuery);
    console.log('Available columns:', schemaResult.rows.map(r => r.column_name).join(', '));

    // Query each document
    console.log('\nSearching for matches...');
    for (const doc of docsNeedingMetadata) {
      const cleanTitle = doc.title.trim();

      // Try exact match first
      let query = `
        SELECT *
        FROM anarchist.documents
        WHERE LOWER(title) = LOWER($1)
      `;
      let result = await pool.query(query, [cleanTitle]);

      // If no exact match, try LIKE match
      if (result.rows.length === 0) {
        query = `
          SELECT *
          FROM anarchist.documents
          WHERE LOWER(title) LIKE LOWER($1)
          LIMIT 1
        `;
        result = await pool.query(query, [`%${cleanTitle}%`]);
      }

      if (result.rows.length > 0) {
        const anarchistDoc = result.rows[0];
        matches.push({
          rstu_id: doc.id,
          rstu_title: doc.title,
          rstu_author: doc.author,
          rstu_date: doc.date,
          anarchist_title: anarchistDoc.title,
          anarchist_author: anarchistDoc.author,
          anarchist_publication_date: anarchistDoc.publication_date,
          anarchist_language: anarchistDoc.language,
          anarchist_category: anarchistDoc.category
        });
        matchCount++;
        console.log(`✓ Match found: "${doc.title}" -> "${anarchistDoc.title}"`);
      } else {
        noMatchCount++;
        if (noMatchCount <= 10) {
          console.log(`✗ No match: "${doc.title}"`);
        }
      }
    }

    // Save matches to JSON
    const outputPath = path.join(__dirname, '../data/anarchist-matches.json');
    fs.writeFileSync(outputPath, JSON.stringify(matches, null, 2), 'utf-8');

    console.log('\n=== SUMMARY ===');
    console.log(`Total documents in manifest: ${manifest.length}`);
    console.log(`Documents missing metadata: ${docsNeedingMetadata.length}`);
    console.log(`Matches found: ${matchCount}`);
    console.log(`No matches: ${noMatchCount}`);
    console.log(`\nMatches saved to: ${outputPath}`);

  } catch (error) {
    console.error('Error:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

enrichMetadata();
