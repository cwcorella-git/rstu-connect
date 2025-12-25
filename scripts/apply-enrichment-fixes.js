const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const DOCS_DIR = path.join(__dirname, '../docs');
const MATCHES_FILE = path.join(__dirname, '../data/anarchist-matches.json');

function applyFixes() {
  console.log('=== Applying Metadata Enrichment Fixes ===\n');

  // Load matches
  const matches = JSON.parse(fs.readFileSync(MATCHES_FILE, 'utf8'));
  console.log(`Loaded ${matches.length} matches from anarchist-matches.json\n`);

  // Build lookup by RSTU ID
  const matchById = {};
  for (const m of matches) {
    matchById[m.rstu_id] = m;
  }

  let authorFixes = 0;
  let dateFixes = 0;

  // Walk through docs
  function processDir(dir) {
    for (const item of fs.readdirSync(dir)) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory() && !item.startsWith('.')) {
        processDir(fullPath);
      } else if (item.endsWith('.md')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        let parsed;
        try {
          parsed = matter(content);
        } catch (e) {
          continue;
        }

        // Generate ID similar to manifest generation
        const relativePath = path.relative(DOCS_DIR, fullPath);
        const category = path.dirname(relativePath);
        const filename = path.basename(item, '.md');
        const id = `${category}-${filename}`.toLowerCase().replace(/[^a-z0-9-]/g, '-');

        const match = matchById[id];
        if (!match) continue;

        let modified = false;

        // Apply author if missing in source but available in Anarchist Library
        if (!parsed.data.author && match.anarchist_author) {
          parsed.data.author = match.anarchist_author;
          authorFixes++;
          modified = true;
          console.log(`[author] ${parsed.data.title || item}: ${match.anarchist_author}`);
        }

        // Apply date if missing in source but available in Anarchist Library
        if (!parsed.data.date && match.anarchist_publication_date) {
          // Parse year from publication date
          const yearMatch = match.anarchist_publication_date.match(/\d{4}/);
          if (yearMatch) {
            parsed.data.date = parseInt(yearMatch[0]);
            dateFixes++;
            modified = true;
            console.log(`[date]   ${parsed.data.title || item}: ${yearMatch[0]}`);
          }
        }

        if (modified) {
          // Write back
          const newContent = matter.stringify(parsed.content, parsed.data);
          fs.writeFileSync(fullPath, newContent);
        }
      }
    }
  }

  processDir(DOCS_DIR);

  console.log('\n=== Summary ===');
  console.log(`Author fixes applied: ${authorFixes}`);
  console.log(`Date fixes applied: ${dateFixes}`);
  console.log(`\nRun 'npm run build' to regenerate manifest.`);
}

applyFixes();
