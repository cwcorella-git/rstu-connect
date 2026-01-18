const fs = require('fs');
const path = require('path');

const MANIFEST_FILE = path.join(__dirname, '../src/data/reading-manifest.json');

function analyzeLibrary() {
  console.log('📊 Library Content Analysis');
  console.log('═'.repeat(60));

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_FILE, 'utf8'));
  console.log(`Total documents: ${manifest.documents.length}\n`);

  // ═══════════════════════════════════════════════════════════
  // TAG ANALYSIS
  // ═══════════════════════════════════════════════════════════
  console.log('🏷️  TAG ANALYSIS');
  console.log('─'.repeat(60));

  const tagCounts = new Map();
  const tagFormats = new Map(); // Track different formats of similar tags

  for (const doc of manifest.documents) {
    for (const tag of doc.tags || []) {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);

      // Track normalized version
      const normalized = tag.toLowerCase().trim();
      if (!tagFormats.has(normalized)) {
        tagFormats.set(normalized, new Set());
      }
      tagFormats.get(normalized).add(tag);
    }
  }

  // Sort by count
  const sortedTags = [...tagCounts.entries()].sort((a, b) => b[1] - a[1]);

  console.log(`\nTotal unique tags: ${tagCounts.size}`);
  console.log(`\nTop 30 tags:`);
  sortedTags.slice(0, 30).forEach(([tag, count], i) => {
    console.log(`   ${(i + 1).toString().padStart(2)}. "${tag}" (${count})`);
  });

  // Find inconsistent tag formats
  console.log(`\n⚠️  Inconsistent tag formats (same tag, different cases/formats):`);
  let inconsistentCount = 0;
  for (const [normalized, variants] of tagFormats) {
    if (variants.size > 1) {
      inconsistentCount++;
      const variantList = [...variants].join(', ');
      console.log(`   • ${variantList}`);
    }
  }
  if (inconsistentCount === 0) console.log('   (none found)');

  // Find truncated tags (end with partial words)
  console.log(`\n⚠️  Potentially truncated tags:`);
  const truncatedTags = sortedTags.filter(([tag]) =>
    tag.length > 3 && (
      /[a-z]$/i.test(tag) && !/\b(ing|tion|ism|ist|ity|ness|ment|ance|ence|able|ible|ful|less|ous|ive|al|ly|er|or|ed|es|s)\b$/i.test(tag) &&
      tag.split(' ').pop().length < 4
    )
  );
  truncatedTags.slice(0, 20).forEach(([tag, count]) => {
    console.log(`   • "${tag}" (${count})`);
  });

  // Find author-like tags
  console.log(`\n⚠️  Author-like tags (may be redundant if doc has author):`);
  const authorPatterns = [
    /^[A-Z][a-z]+ [A-Z][a-z]+$/,  // First Last
    /^[A-Z]\. [A-Z][a-z]+$/,      // F. Last
    /Kropotkin|Bookchin|Graeber|Goldman|Bakunin|Marx|Engels/i,
  ];
  const authorTags = sortedTags.filter(([tag]) =>
    authorPatterns.some(p => p.test(tag))
  );
  authorTags.forEach(([tag, count]) => {
    console.log(`   • "${tag}" (${count})`);
  });

  // ═══════════════════════════════════════════════════════════
  // TITLE ANALYSIS
  // ═══════════════════════════════════════════════════════════
  console.log('\n\n📝 TITLE ANALYSIS');
  console.log('─'.repeat(60));

  const titleIssues = {
    truncated: [],
    hasFileExt: [],
    hasUnderscore: [],
    allCaps: [],
    startsWithArticle: [],
    hasWeirdChars: [],
    tooShort: [],
    hasDatePrefix: [],
  };

  for (const doc of manifest.documents) {
    const title = doc.title;

    // Truncated (ends mid-word or with ellipsis-like pattern)
    if (title.length > 50 && /[a-z]$/i.test(title) && !/\b(the|a|an|of|and|in|to|for)\b$/i.test(title.toLowerCase())) {
      const lastWord = title.split(/\s+/).pop();
      if (lastWord && lastWord.length < 4 && !/^(I|II|III|IV|V|UK|US|LA|NY|DC)$/i.test(lastWord)) {
        titleIssues.truncated.push({ title, filename: doc.filename });
      }
    }

    // Has file extension
    if (/\.(pdf|md|doc|txt|epub|pptx?)$/i.test(title)) {
      titleIssues.hasFileExt.push({ title, filename: doc.filename });
    }

    // Has underscores (filename artifacts)
    if (/_/.test(title)) {
      titleIssues.hasUnderscore.push({ title, filename: doc.filename });
    }

    // All caps words (more than 3 consecutive caps)
    if (/[A-Z]{4,}/.test(title) && !/\b(ISBN|JSTOR|PDF|USA|UK|NYC|NYPD|IWW|AFL|CIO)\b/.test(title)) {
      titleIssues.allCaps.push({ title, filename: doc.filename });
    }

    // Starts with "Article_" or similar
    if (/^(Article|Planning|Misc)_/i.test(title)) {
      titleIssues.startsWithArticle.push({ title, filename: doc.filename });
    }

    // Has weird characters
    if (/[<>{}[\]|\\]/.test(title)) {
      titleIssues.hasWeirdChars.push({ title, filename: doc.filename });
    }

    // Too short to be meaningful
    if (title.length < 10) {
      titleIssues.tooShort.push({ title, filename: doc.filename });
    }

    // Has date prefix like "1944" or "91723"
    if (/^\d{4,}/.test(title)) {
      titleIssues.hasDatePrefix.push({ title, filename: doc.filename });
    }
  }

  console.log(`\nTitle issues found:`);
  for (const [issue, docs] of Object.entries(titleIssues)) {
    if (docs.length > 0) {
      console.log(`\n⚠️  ${issue.replace(/([A-Z])/g, ' $1').trim()} (${docs.length}):`);
      docs.slice(0, 10).forEach(d => {
        console.log(`   • "${d.title.slice(0, 60)}..."`);
      });
      if (docs.length > 10) console.log(`   ... and ${docs.length - 10} more`);
    }
  }

  // ═══════════════════════════════════════════════════════════
  // AUTHOR ANALYSIS
  // ═══════════════════════════════════════════════════════════
  console.log('\n\n👤 AUTHOR ANALYSIS');
  console.log('─'.repeat(60));

  const authorCounts = new Map();
  const docsWithAuthor = manifest.documents.filter(d => d.author);

  for (const doc of docsWithAuthor) {
    authorCounts.set(doc.author, (authorCounts.get(doc.author) || 0) + 1);
  }

  const sortedAuthors = [...authorCounts.entries()].sort((a, b) => b[1] - a[1]);
  console.log(`\nDocuments with author: ${docsWithAuthor.length} (${(docsWithAuthor.length / manifest.documents.length * 100).toFixed(1)}%)`);
  console.log(`Unique authors: ${authorCounts.size}`);
  console.log(`\nTop 20 authors:`);
  sortedAuthors.slice(0, 20).forEach(([author, count], i) => {
    console.log(`   ${(i + 1).toString().padStart(2)}. ${author} (${count})`);
  });

  // Find docs with author that also have author as tag
  console.log(`\n⚠️  Docs with author AND author tag (redundant):`);
  let redundantCount = 0;
  for (const doc of docsWithAuthor) {
    const authorLower = doc.author.toLowerCase();
    const redundantTags = (doc.tags || []).filter(tag =>
      authorLower.includes(tag.toLowerCase()) || tag.toLowerCase().includes(authorLower.split(' ')[0].toLowerCase())
    );
    if (redundantTags.length > 0) {
      redundantCount++;
      if (redundantCount <= 10) {
        console.log(`   • "${doc.title.slice(0, 40)}..." - author: "${doc.author}", tags: [${redundantTags.join(', ')}]`);
      }
    }
  }
  if (redundantCount > 10) console.log(`   ... and ${redundantCount - 10} more`);

  // Save analysis
  const analysisFile = path.join(__dirname, '../data/library-analysis.json');
  fs.writeFileSync(analysisFile, JSON.stringify({
    generated: new Date().toISOString(),
    summary: {
      totalDocs: manifest.documents.length,
      uniqueTags: tagCounts.size,
      docsWithAuthor: docsWithAuthor.length,
      uniqueAuthors: authorCounts.size,
    },
    tagCounts: Object.fromEntries(sortedTags),
    titleIssues,
    authorCounts: Object.fromEntries(sortedAuthors),
  }, null, 2));

  console.log(`\n\n📁 Full analysis saved to: ${analysisFile}`);
}

analyzeLibrary();
