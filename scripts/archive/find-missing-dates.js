const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const DOCS_DIR = path.join(__dirname, '../docs');
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

      // Skip if already has date
      if (parsed.data.date) return;

      // Look for dates in content
      const datePatterns = [
        { pattern: /##\s*\*\*(?:Date:?\s*)?(\d{4})\*\*/, name: 'header' },
        { pattern: /\*\*Date:\*\*\s*(\d{4})/, name: 'bold-date' },
        { pattern: /(?:Published|Written|Date)[:\s]+(\d{4})/i, name: 'text' },
      ];

      const firstPart = parsed.content.slice(0, 1500);
      for (const { pattern, name } of datePatterns) {
        const match = firstPart.match(pattern);
        if (match) {
          const year = parseInt(match[1]);
          if (year >= 1800 && year <= 2025) {
            candidates.push({
              file: path.relative(DOCS_DIR, fullPath),
              date: match[1],
              method: name,
              title: (parsed.data.title || '').slice(0, 45),
            });
            break;
          }
        }
      }
    }
  }
}

scanDir(DOCS_DIR);

console.log(`Found ${candidates.length} documents with extractable dates:\n`);
candidates.slice(0, 30).forEach(c => {
  console.log(`  ${c.file}:`);
  console.log(`    + date: ${c.date} (${c.method})`);
});
if (candidates.length > 30) console.log(`\n  ... and ${candidates.length - 30} more`);
