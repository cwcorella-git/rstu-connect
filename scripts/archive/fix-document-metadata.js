const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const DOCS_DIR = path.join(__dirname, '../docs');
const CORRECTIONS_FILE = path.join(__dirname, '../data/author-corrections.json');

function fixMetadata(dryRun = true) {
  // Load corrections
  if (!fs.existsSync(CORRECTIONS_FILE)) {
    console.error('❌ Corrections file not found:', CORRECTIONS_FILE);
    process.exit(1);
  }

  const corrections = JSON.parse(fs.readFileSync(CORRECTIONS_FILE, 'utf8'));
  const stats = {
    scanned: 0,
    corrected: 0,
    removed: 0,
    title_matched: 0,
    errors: 0,
  };
  const changes = [];

  function scanDirectory(dir) {
    const items = fs.readdirSync(dir);

    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        if (!item.startsWith('.') && item !== 'node_modules') {
          scanDirectory(fullPath);
        }
      } else if (item.endsWith('.md')) {
        stats.scanned++;
        const relativePath = path.relative(DOCS_DIR, fullPath);

        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          const parsed = matter(content);
          const data = parsed.data;
          const markdown = parsed.content;

          let modified = false;
          const oldAuthor = data.author ? String(data.author).trim() : null;
          const oldDate = data.date ? String(data.date).trim() : null;
          const title = data.title || item.replace('.md', '');

          // Check for author corrections
          if (oldAuthor && corrections.corrections[oldAuthor] !== undefined) {
            const newAuthor = corrections.corrections[oldAuthor];
            if (newAuthor === null) {
              delete data.author;
              stats.removed++;
              changes.push({
                file: relativePath,
                field: 'author',
                old: oldAuthor,
                new: '(removed)',
              });
            } else {
              data.author = newAuthor;
              stats.corrected++;
              changes.push({
                file: relativePath,
                field: 'author',
                old: oldAuthor,
                new: newAuthor,
              });
            }
            modified = true;
          }

          // Check for title-based metadata (only if missing)
          if (!data.author || !data.date) {
            for (const [titlePattern, meta] of Object.entries(corrections.title_to_author)) {
              if (title.toLowerCase().includes(titlePattern.toLowerCase())) {
                if (!data.author && meta.author) {
                  data.author = meta.author;
                  stats.title_matched++;
                  changes.push({
                    file: relativePath,
                    field: 'author',
                    old: '(none)',
                    new: meta.author,
                    source: 'title_match',
                  });
                  modified = true;
                }
                if (!data.date && meta.date) {
                  data.date = meta.date;
                  changes.push({
                    file: relativePath,
                    field: 'date',
                    old: '(none)',
                    new: meta.date,
                    source: 'title_match',
                  });
                  modified = true;
                }
                break;
              }
            }
          }

          // Write back if modified
          if (modified && !dryRun) {
            const newContent = matter.stringify(markdown, data);
            fs.writeFileSync(fullPath, newContent);
          }

        } catch (err) {
          console.error(`❌ Error processing ${relativePath}:`, err.message);
          stats.errors++;
        }
      }
    });
  }

  scanDirectory(DOCS_DIR);

  // Print results
  console.log('\n📝 Document Metadata Fix');
  console.log('═'.repeat(50));
  console.log(`Mode: ${dryRun ? '🔍 DRY RUN (no changes made)' : '✏️  APPLYING CHANGES'}`);
  console.log(`\nScanned: ${stats.scanned} documents`);
  console.log(`Corrections applied: ${stats.corrected}`);
  console.log(`Bad authors removed: ${stats.removed}`);
  console.log(`Title-based matches: ${stats.title_matched}`);
  if (stats.errors > 0) {
    console.log(`Errors: ${stats.errors}`);
  }

  if (changes.length > 0) {
    console.log('\n📋 Changes:');
    changes.forEach(change => {
      const source = change.source ? ` (${change.source})` : '';
      console.log(`  ${change.file}`);
      console.log(`    ${change.field}: "${change.old}" → "${change.new}"${source}`);
    });
  }

  if (dryRun && changes.length > 0) {
    console.log('\n💡 Run with --apply to make these changes');
  }

  return { stats, changes };
}

// Check command line args
const args = process.argv.slice(2);
const dryRun = !args.includes('--apply');

fixMetadata(dryRun);
