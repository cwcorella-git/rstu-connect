const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const DOCS_DIR = path.join(__dirname, '../docs');

// Pattern: ## **Author Name** at start of content
const AUTHOR_HEADER_PATTERN = /^##\s*\*\*([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+)\*\*/m;

// Exclude these as they're not authors
const EXCLUDED = new Set([
  'Date Unknown', 'Source Unknown', 'Tags Unknown', 'Further Reading',
  'Original Source', 'External Links', 'See Also', 'Related Articles',
]);

const candidates = [];

function scanDir(dir) {
  for (const item of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory() && !item.startsWith('.')) {
      scanDir(fullPath);
    } else if (item.endsWith('.md')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      let parsed;
      try { parsed = matter(content); } catch (e) { return; }

      // Skip if already has author
      if (parsed.data.author) return;

      // Look for author header in first 500 chars
      const firstPart = parsed.content.slice(0, 500);
      const match = firstPart.match(AUTHOR_HEADER_PATTERN);

      if (match && !EXCLUDED.has(match[1])) {
        // Also try to extract date
        const dateMatch = firstPart.match(/##\s*\*\*(?:Date:?\s*)?(\d{4})\*\*/);

        candidates.push({
          file: path.relative(DOCS_DIR, fullPath),
          author: match[1],
          date: dateMatch ? dateMatch[1] : null,
          title: (parsed.data.title || '').slice(0, 50),
        });
      }
    }
  }
}

scanDir(DOCS_DIR);

console.log(`Found ${candidates.length} documents with author in content header:\n`);
candidates.slice(0, 30).forEach(c => {
  console.log(`  ${c.file}:`);
  console.log(`    + author: "${c.author}"${c.date ? `, date: ${c.date}` : ''}`);
});
if (candidates.length > 30) {
  console.log(`\n  ... and ${candidates.length - 30} more`);
}

// Export for use in fix script
if (process.argv.includes('--json')) {
  console.log(JSON.stringify(candidates, null, 2));
}
