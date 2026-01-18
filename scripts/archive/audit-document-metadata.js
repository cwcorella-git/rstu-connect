const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const DOCS_DIR = path.join(__dirname, '../docs');
const OUTPUT_FILE = path.join(__dirname, '../data/metadata-audit.json');

// Known bad author patterns (obviously not real authors)
const BAD_AUTHOR_PATTERNS = [
  /\.pdf$/i,
  /\.md$/i,
  /\.doc$/i,
  /\.txt$/i,
  /google docs/i,
  /audio book/i,
  /^the anarchist library$/i,
  /^libcom\.org$/i,
];

// Known good collective/organization/pseudonym authors (not flagged as suspicious)
const KNOWN_COLLECTIVES = [
  'the jane addams collective',
  'symbiosis research collective',
  'anarchist federation',
  'crimethinc',
  'international workers association',
  'angry education workers',
  'curious george brigade',
  'sub.media',
  're.marx',
  'mutt',  // Pseudonym, editor of A Black Autonomy Reader
];

// Suspicious patterns (need review)
const SUSPICIOUS_PATTERNS = [
  /^\w+$/,  // Single word only
  /^.{1,3}$/, // Very short (1-3 chars)
  /^\d/,    // Starts with number
  /[<>{}[\]]/,  // Contains brackets
];

function auditMetadata() {
  const results = {
    timestamp: new Date().toISOString(),
    summary: {
      total: 0,
      with_author: 0,
      with_date: 0,
      missing_author: 0,
      missing_date: 0,
      bad_author: 0,
      suspicious_author: 0,
    },
    bad_authors: {},  // Map of bad author -> count
    suspicious_authors: {},  // Map of suspicious author -> count
    issues: [],
  };

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
        const relativePath = path.relative(DOCS_DIR, fullPath);
        const content = fs.readFileSync(fullPath, 'utf8');

        let data;
        try {
          const parsed = matter(content);
          data = parsed.data;
        } catch (err) {
          results.issues.push({
            file: relativePath,
            issues: ['invalid_frontmatter'],
            author: null,
            date: null,
            title: item,
          });
          results.summary.total++;
          return;
        }

        results.summary.total++;

        const docIssues = [];
        const author = data.author ? String(data.author).trim() : null;
        const date = data.date ? String(data.date).trim() : null;
        const title = data.title || item.replace('.md', '');

        // Check author
        if (!author) {
          docIssues.push('missing_author');
          results.summary.missing_author++;
        } else {
          results.summary.with_author++;

          // Check for bad author patterns
          const isBad = BAD_AUTHOR_PATTERNS.some(pattern => pattern.test(author));
          if (isBad) {
            docIssues.push('bad_author');
            results.summary.bad_author++;
            results.bad_authors[author] = (results.bad_authors[author] || 0) + 1;
          } else {
            // Skip known collectives/organizations
            const isKnownCollective = KNOWN_COLLECTIVES.some(c =>
              author.toLowerCase().includes(c)
            );

            // Check for suspicious patterns (unless it's a known collective)
            const isSuspicious = !isKnownCollective &&
              SUSPICIOUS_PATTERNS.some(pattern => pattern.test(author));
            if (isSuspicious) {
              docIssues.push('suspicious_author');
              results.summary.suspicious_author++;
              results.suspicious_authors[author] = (results.suspicious_authors[author] || 0) + 1;
            }
          }
        }

        // Check date
        if (!date) {
          docIssues.push('missing_date');
          results.summary.missing_date++;
        } else {
          results.summary.with_date++;
        }

        // Only add to issues if there are problems
        if (docIssues.length > 0) {
          results.issues.push({
            file: relativePath,
            issues: docIssues,
            author,
            date,
            title,
          });
        }
      }
    });
  }

  scanDirectory(DOCS_DIR);

  // Sort issues by severity
  results.issues.sort((a, b) => {
    const severityOrder = { bad_author: 0, suspicious_author: 1, missing_author: 2, missing_date: 3 };
    const aMax = Math.min(...a.issues.map(i => severityOrder[i] ?? 99));
    const bMax = Math.min(...b.issues.map(i => severityOrder[i] ?? 99));
    return aMax - bMax;
  });

  // Sort bad/suspicious authors by count
  results.bad_authors = Object.fromEntries(
    Object.entries(results.bad_authors).sort((a, b) => b[1] - a[1])
  );
  results.suspicious_authors = Object.fromEntries(
    Object.entries(results.suspicious_authors).sort((a, b) => b[1] - a[1])
  );

  // Ensure output directory exists
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write results
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));

  // Print summary
  console.log('\n📊 Document Metadata Audit');
  console.log('═'.repeat(50));
  console.log(`Total documents: ${results.summary.total}`);
  console.log(`\nAuthors:`);
  console.log(`  ✅ With author: ${results.summary.with_author} (${(results.summary.with_author / results.summary.total * 100).toFixed(1)}%)`);
  console.log(`  ❌ Missing author: ${results.summary.missing_author} (${(results.summary.missing_author / results.summary.total * 100).toFixed(1)}%)`);
  console.log(`  ⚠️  Bad author: ${results.summary.bad_author}`);
  console.log(`  ❓ Suspicious author: ${results.summary.suspicious_author}`);
  console.log(`\nDates:`);
  console.log(`  ✅ With date: ${results.summary.with_date} (${(results.summary.with_date / results.summary.total * 100).toFixed(1)}%)`);
  console.log(`  ❌ Missing date: ${results.summary.missing_date} (${(results.summary.missing_date / results.summary.total * 100).toFixed(1)}%)`);

  if (Object.keys(results.bad_authors).length > 0) {
    console.log(`\n🚫 Bad Authors (need removal/correction):`);
    Object.entries(results.bad_authors).slice(0, 10).forEach(([author, count]) => {
      console.log(`  "${author}" (${count} docs)`);
    });
  }

  if (Object.keys(results.suspicious_authors).length > 0) {
    console.log(`\n❓ Suspicious Authors (need review):`);
    Object.entries(results.suspicious_authors).slice(0, 15).forEach(([author, count]) => {
      console.log(`  "${author}" (${count} docs)`);
    });
  }

  console.log(`\n📁 Full report: ${OUTPUT_FILE}`);
}

auditMetadata();
