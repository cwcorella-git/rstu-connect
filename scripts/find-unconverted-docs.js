const fs = require('fs');
const path = require('path');

const DOCS_DIR = path.join(__dirname, '../docs');

// Check if document is properly converted
function checkDocument(filepath) {
  const content = fs.readFileSync(filepath, 'utf8');
  const lines = content.split('\n');

  // Check if it has frontmatter
  if (!content.trim().startsWith('---')) {
    return { status: 'no_frontmatter', reason: 'Missing YAML frontmatter' };
  }

  // Check for malformed frontmatter (unclosed quotes, etc.)
  const frontmatterEnd = content.indexOf('---', 3);
  if (frontmatterEnd === -1) {
    return { status: 'malformed_frontmatter', reason: 'Unclosed frontmatter block' };
  }

  const frontmatter = content.substring(3, frontmatterEnd);

  // Check for common malformation patterns
  if (frontmatter.includes("'") && frontmatter.includes('"')) {
    // Mixed quote types might indicate malformation
    const hasMismatchedQuotes = frontmatter.match(/["'][^"']*["']/g);
    if (frontmatter.includes(`"`) && frontmatter.includes(`'`) &&
        (frontmatter.includes(`"'`) || frontmatter.includes(`'"`))) {
      return { status: 'malformed_frontmatter', reason: 'Mismatched quotes in frontmatter' };
    }
  }

  // Check for unclosed quotes
  const quotePattern = /"[^"]*$/m; // Quote that doesn't close on same line
  if (frontmatter.match(quotePattern)) {
    return { status: 'malformed_frontmatter', reason: 'Unclosed quotes in frontmatter' };
  }

  // Check if it has proper markdown structure
  const bodyStart = frontmatterEnd + 3;
  const body = content.substring(bodyStart).trim();

  if (!body) {
    return { status: 'empty_body', reason: 'Empty document body' };
  }

  // Check for markdown headers
  const hasHeaders = body.split('\n').some(line => line.match(/^#{1,6}\s/));

  if (!hasHeaders) {
    return { status: 'no_headers', reason: 'No markdown headers in body' };
  }

  return { status: 'ok', reason: 'Properly formatted' };
}

// Scan all documents
function scanDocuments() {
  const results = {
    no_frontmatter: [],
    malformed_frontmatter: [],
    no_headers: [],
    empty_body: [],
    ok: []
  };

  function walkDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        walkDir(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.md') && entry.name !== 'README.md') {
        const relativePath = path.relative(DOCS_DIR, fullPath);

        try {
          const result = checkDocument(fullPath);
          results[result.status].push({ path: relativePath, reason: result.reason });
        } catch (err) {
          console.error(`Error checking ${relativePath}:`, err.message);
        }
      }
    }
  }

  walkDir(DOCS_DIR);
  return results;
}

console.log('Scanning for unconverted/malformed documents...\n');
const results = scanDocuments();

console.log('=== DOCUMENTS NEEDING CONVERSION ===\n');

if (results.no_frontmatter.length > 0) {
  console.log(`\n📄 NO FRONTMATTER (${results.no_frontmatter.length} files):`);
  results.no_frontmatter.forEach(doc => {
    console.log(`  - ${doc.path}`);
  });
}

if (results.malformed_frontmatter.length > 0) {
  console.log(`\n⚠️  MALFORMED FRONTMATTER (${results.malformed_frontmatter.length} files):`);
  results.malformed_frontmatter.forEach(doc => {
    console.log(`  - ${doc.path} (${doc.reason})`);
  });
}

if (results.no_headers.length > 0) {
  console.log(`\n📝 NO MARKDOWN HEADERS (${results.no_headers.length} files):`);
  results.no_headers.slice(0, 20).forEach(doc => {
    console.log(`  - ${doc.path}`);
  });
  if (results.no_headers.length > 20) {
    console.log(`  ... and ${results.no_headers.length - 20} more`);
  }
}

if (results.empty_body.length > 0) {
  console.log(`\n❌ EMPTY BODY (${results.empty_body.length} files):`);
  results.empty_body.forEach(doc => {
    console.log(`  - ${doc.path}`);
  });
}

console.log('\n\n=== SUMMARY ===');
console.log(`Total documents scanned: ${Object.values(results).reduce((sum, arr) => sum + arr.length, 0)}`);
console.log(`✅ Properly formatted: ${results.ok.length}`);
console.log(`❌ Need conversion: ${results.no_frontmatter.length + results.malformed_frontmatter.length + results.no_headers.length + results.empty_body.length}`);
console.log(`  - No frontmatter: ${results.no_frontmatter.length}`);
console.log(`  - Malformed frontmatter: ${results.malformed_frontmatter.length}`);
console.log(`  - No headers: ${results.no_headers.length}`);
console.log(`  - Empty body: ${results.empty_body.length}`);
