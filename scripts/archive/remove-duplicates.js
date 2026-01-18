const fs = require('fs');
const path = require('path');

const ANALYSIS_FILE = path.join(__dirname, '../data/duplicate-analysis.json');
const DOCS_DIR = path.join(__dirname, '../docs');

function removeDuplicates(dryRun = true) {
  console.log('🗑️  Duplicate Removal');
  console.log('═'.repeat(50));
  console.log(`Mode: ${dryRun ? '🔍 DRY RUN' : '✏️  REMOVING FILES'}`);

  // Load analysis
  if (!fs.existsSync(ANALYSIS_FILE)) {
    console.error('❌ Analysis file not found. Run find-duplicates.js first.');
    process.exit(1);
  }

  const analysis = JSON.parse(fs.readFileSync(ANALYSIS_FILE, 'utf8'));
  console.log(`\n📊 Found ${analysis.exact_duplicates.length} duplicate groups`);

  const toRemove = [];
  const kept = [];

  for (const group of analysis.exact_duplicates) {
    const docs = group.documents;

    // Score each document (higher = better to keep)
    const scored = docs.map(doc => {
      let score = 0;

      // Prefer non-Misc categories
      if (doc.category !== 'Misc') score += 100;

      // Prefer documents with author
      if (doc.author) score += 50;

      // Prefer documents with date (but not "2025" which is often auto-generated)
      if (doc.date && doc.date !== '2025') score += 30;

      // Prefer higher word count (more complete)
      score += Math.min(doc.wordCount / 1000, 20);

      // Prefer cleaner filenames (no Article_ prefix)
      if (!doc.filename.startsWith('Article_')) score += 10;

      return { ...doc, score };
    });

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);

    // Keep the best one, remove the rest
    const keepDoc = scored[0];
    const removeDocs = scored.slice(1);

    kept.push({
      title: keepDoc.title,
      category: keepDoc.category,
      filename: keepDoc.filename,
      score: keepDoc.score,
    });

    for (const doc of removeDocs) {
      toRemove.push({
        title: doc.title,
        category: doc.category,
        filename: doc.filename,
        reason: `Duplicate of ${keepDoc.category}/${keepDoc.filename}`,
        score: doc.score,
      });
    }
  }

  console.log(`\n✅ Keeping: ${kept.length} documents`);
  console.log(`🗑️  Removing: ${toRemove.length} duplicates`);

  // Show what we're removing
  console.log('\n📋 Files to remove:');
  toRemove.forEach((doc, i) => {
    console.log(`   ${i + 1}. ${doc.category}/${doc.filename}`);
  });

  // Actually remove files if not dry run
  if (!dryRun) {
    let removed = 0;
    let errors = 0;

    for (const doc of toRemove) {
      // Find the actual file path
      const categoryDir = doc.category.toLowerCase().replace(/\s+/g, '-');
      const filePath = path.join(DOCS_DIR, categoryDir, doc.filename);

      // Also check misc directory
      const miscPath = path.join(DOCS_DIR, 'misc', doc.filename);

      let actualPath = null;
      if (fs.existsSync(filePath)) {
        actualPath = filePath;
      } else if (fs.existsSync(miscPath)) {
        actualPath = miscPath;
      }

      if (actualPath) {
        try {
          fs.unlinkSync(actualPath);
          removed++;
          console.log(`   ✓ Removed: ${path.relative(DOCS_DIR, actualPath)}`);
        } catch (err) {
          errors++;
          console.error(`   ✗ Error removing ${actualPath}: ${err.message}`);
        }
      } else {
        console.log(`   ? Not found: ${doc.category}/${doc.filename}`);
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Removed: ${removed} files`);
    if (errors > 0) console.log(`   Errors: ${errors}`);
  }

  if (dryRun) {
    console.log('\n💡 Run with --apply to remove these files');
  }

  return { kept, toRemove };
}

// Check command line args
const args = process.argv.slice(2);
const dryRun = !args.includes('--apply');

removeDuplicates(dryRun);
