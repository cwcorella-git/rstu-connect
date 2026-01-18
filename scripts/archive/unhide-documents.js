const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const DOCS_DIR = path.join(__dirname, '../docs');

let unhidden = 0;

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

      // Remove hidden field if present
      if (parsed.data.hidden !== undefined) {
        delete parsed.data.hidden;
        const newContent = matter.stringify(parsed.content, parsed.data);
        fs.writeFileSync(fullPath, newContent);
        unhidden++;
        console.log(`Unhidden: ${path.relative(DOCS_DIR, fullPath)}`);
      }
    }
  }
}

console.log('=== Removing hidden field from documents ===\n');
processDir(DOCS_DIR);
console.log(`\nUnhidden ${unhidden} documents`);
