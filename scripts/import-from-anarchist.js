const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const pool = new Pool({
  host: '192.168.1.15',
  port: 5432,
  database: 'veritable_games',
  user: 'postgres',
  password: 'postgres'
});

// Map Anarchist Library categories to RSTU categories
const CATEGORY_MAP = {
  'anarchist-en': 'classic-theory',
  'housing': 'housing-rent-tenants',
  'labor': 'labor-unions',
  'organizing': 'organizing-action',
  'history': 'historical',
  'contemporary': 'contemporary-analysis'
};

// Priority slugs to import (from cross-reference with Reading Collection)
const PRIORITY_SLUGS = [
  // Murray Bookchin
  'murray-bookchin-free-cities',
  'murray-bookchin-from-urbanization-to-cities',
  'murray-bookchin-listen-marxist',
  'murray-bookchin-the-next-revolution',
  'murray-bookchin-social-anarchism-or-lifestyle-anarchism',
  // Peter Kropotkin
  'peter-kropotkin-the-conquest-of-bread',
  'peter-kropotkin-fields-factories-and-workshops',
  'peter-kropotkin-modern-science-and-anarchy',
  'peter-kropotkin-memoirs-of-a-revolutionist',
  // David Graeber
  'david-graeber-bullshit-jobs',
  'david-graeber-direct-action-an-ethnography',
  'david-graeber-the-utopia-of-rules',
  'david-graeber-possibilities',
  // Emma Goldman
  'emma-goldman-my-disillusionment-in-russia',
  'emma-goldman-marriage-and-love',
  'emma-goldman-the-psychology-of-political-violence',
  // Rudolf Rocker
  'rudolf-rocker-anarcho-syndicalism-theory-and-practice',
  // Housing-related
  'autonomous-tenants-union-tactics',
  'housing-and-squatting',
  'libertarian-socialist-program-to-intervene-in-the-housing-movement-liza-anarquista-madrid',
];

const DOCKER_CONTAINER = 'm4s0kwo4kc4oooocck4sswc4';
const SERVER = 'user@192.168.1.15';

async function fetchDocumentContent(filePath) {
  try {
    // Fetch document content from Docker container via SSH
    const cmd = `ssh ${SERVER} "docker exec ${DOCKER_CONTAINER} cat '/app/anarchist-library/${filePath}'" 2>/dev/null`;
    const content = execSync(cmd, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
    return content;
  } catch (error) {
    console.error(`  Failed to fetch: ${filePath}`);
    return null;
  }
}

function mapToRSTUCategory(doc) {
  const title = doc.title.toLowerCase();
  const author = (doc.author || '').toLowerCase();

  // Housing-related
  if (title.includes('tenant') || title.includes('housing') || title.includes('rent') || title.includes('landlord')) {
    return 'housing-rent-tenants';
  }
  // Labor/unions
  if (title.includes('union') || title.includes('labor') || title.includes('strike') || title.includes('syndicalism')) {
    return 'labor-unions';
  }
  // Organizing
  if (title.includes('organizing') || title.includes('direct action') || title.includes('tactics')) {
    return 'organizing-action';
  }
  // Historical figures - classic theory
  if (['kropotkin', 'bakunin', 'goldman', 'malatesta', 'rocker'].some(a => author.includes(a))) {
    return 'classic-theory';
  }
  // Contemporary
  if (['bookchin', 'graeber', 'chomsky', 'carson'].some(a => author.includes(a))) {
    return 'contemporary-analysis';
  }
  // Default
  return 'classic-theory';
}

async function importDocuments() {
  console.log('=== RSTU Connect Document Import from Anarchist Library ===\n');

  try {
    // Load existing RSTU manifest
    const manifestPath = path.join(__dirname, '../src/data/reading-manifest.json');
    const manifestData = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const existingTitles = new Set(manifestData.documents.map(d => d.title.toLowerCase()));

    console.log(`Existing RSTU documents: ${manifestData.documents.length}`);

    // Query for priority documents
    console.log('\nQuerying Anarchist Library for priority documents...');
    const query = `
      SELECT title, author, publication_date, slug, file_path, language, category
      FROM anarchist.documents
      WHERE language = 'en'
      AND (
        author IN ('Murray Bookchin', 'Peter Kropotkin', 'David Graeber', 'Emma Goldman', 'Mikhail Bakunin', 'Rudolf Rocker')
        OR LOWER(title) LIKE '%tenant%'
        OR LOWER(title) LIKE '%housing%'
        OR LOWER(title) LIKE '%rent strike%'
      )
      ORDER BY author, title
      LIMIT 100
    `;
    const result = await pool.query(query);
    console.log(`Found ${result.rows.length} potential imports\n`);

    const imported = [];
    const skipped = [];

    for (const doc of result.rows) {
      // Skip if already exists in RSTU
      if (existingTitles.has(doc.title.toLowerCase())) {
        skipped.push({ title: doc.title, reason: 'already exists' });
        continue;
      }

      console.log(`Processing: ${doc.title.slice(0, 60)}...`);

      // Fetch content from server
      const content = await fetchDocumentContent(doc.file_path);
      if (!content) {
        skipped.push({ title: doc.title, reason: 'fetch failed' });
        continue;
      }

      // Determine category
      const category = mapToRSTUCategory(doc);
      const categoryDir = path.join(__dirname, '../docs', category);

      // Ensure category directory exists
      if (!fs.existsSync(categoryDir)) {
        fs.mkdirSync(categoryDir, { recursive: true });
      }

      // Create filename from slug
      const filename = `${doc.slug}.md`;
      const filepath = path.join(categoryDir, filename);

      // Check if content already has frontmatter
      let finalContent = content;
      if (!content.trim().startsWith('---')) {
        // Add frontmatter
        const frontmatter = [
          '---',
          `title: "${doc.title.replace(/"/g, '\\"')}"`,
          doc.author ? `author: "${doc.author}"` : null,
          doc.publication_date ? `date: ${doc.publication_date}` : null,
          '---',
          ''
        ].filter(Boolean).join('\n');
        finalContent = frontmatter + content;
      }

      // Write file
      fs.writeFileSync(filepath, finalContent);
      imported.push({
        title: doc.title,
        author: doc.author,
        category,
        filename
      });
      console.log(`  ✓ Imported to ${category}/${filename}`);
    }

    // Save import summary
    const summary = {
      timestamp: new Date().toISOString(),
      imported: imported.length,
      skipped: skipped.length,
      documents: imported
    };
    fs.writeFileSync(
      path.join(__dirname, '../data/import-summary.json'),
      JSON.stringify(summary, null, 2)
    );

    console.log('\n=== IMPORT SUMMARY ===');
    console.log(`Imported: ${imported.length} documents`);
    console.log(`Skipped: ${skipped.length} documents`);
    if (imported.length > 0) {
      console.log('\nImported documents:');
      imported.forEach(d => console.log(`  - ${d.title.slice(0, 50)} (${d.category})`));
    }
    console.log('\nRun "npm run build" to regenerate manifest.');

  } catch (error) {
    console.error('Error:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  importDocuments();
}

module.exports = { importDocuments, fetchDocumentContent };
