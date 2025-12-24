const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const DOCS_DIR = path.join(__dirname, '../docs');
const authorCandidates = new Map();

// Geographic/organization names to exclude
const EXCLUDED = new Set([
  'United States', 'United Kingdom', 'New York', 'Los Angeles', 'San Francisco',
  'North Carolina', 'South Africa', 'South Korea', 'Hong Kong', 'Costa Rica',
  'El Salvador', 'Sri Lanka', 'East Palestine', 'Climate Strike', 'General Strike',
  'Black Lives', 'Black Flag', 'Direct Action', 'Mutual Aid', 'Class War',
  'World War', 'Trade Union', 'Labor Union', 'Angry Brigade', 'Black Panther',
]);

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

      // Skip if has author
      if (parsed.data.author) return;

      // Find Tags line
      const tagsMatch = parsed.content.match(/\*\*Tags:\*\*\s*([^\n]+)/i) ||
                       parsed.content.match(/^Tags:\s*([^\n]+)/m);
      if (!tagsMatch) return;

      const tags = tagsMatch[1].split(',').map(t => t.trim());
      for (const tag of tags) {
        // Look for "First Last" pattern (author-like)
        if (/^[A-Z][a-z]+ [A-Z][a-z]+$/.test(tag) && !EXCLUDED.has(tag)) {
          if (!authorCandidates.has(tag)) {
            authorCandidates.set(tag, []);
          }
          authorCandidates.get(tag).push(path.relative(DOCS_DIR, fullPath));
        }
      }
    }
  }
}

scanDir(DOCS_DIR);

const sorted = [...authorCandidates.entries()].sort((a, b) => b[1].length - a[1].length);
console.log('Author candidates from content Tags (docs without author field):');
console.log('');
sorted.slice(0, 50).forEach(([name, files]) => {
  console.log(`  ${files.length}x "${name}"`);
  files.slice(0, 2).forEach(f => console.log(`      - ${f}`));
});
console.log('');
console.log(`Total candidates: ${sorted.length}`);
