const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const DOCS_DIR = path.join(__dirname, '../docs');
let updated = 0;
let alreadyHasTags = 0;
let noTopics = 0;

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

      // Skip if already has tags
      if (parsed.data.tags && parsed.data.tags.length > 0) {
        alreadyHasTags++;
        continue;
      }

      // Check for topics field (from Anarchist Library imports)
      if (parsed.data.topics && Array.isArray(parsed.data.topics) && parsed.data.topics.length > 0) {
        // Convert topics to tags
        parsed.data.tags = parsed.data.topics.map(t =>
          t.replace(/-/g, ' ')
           .split(' ')
           .map(w => w.charAt(0).toUpperCase() + w.slice(1))
           .join(' ')
        );

        // Write back
        const newContent = matter.stringify(parsed.content, parsed.data);
        fs.writeFileSync(fullPath, newContent);
        updated++;
        console.log(`[tags] ${parsed.data.title || item}: ${parsed.data.tags.join(', ')}`);
      } else {
        noTopics++;
      }
    }
  }
}

console.log('=== Extracting Topics as Tags ===\n');
processDir(DOCS_DIR);

console.log('\n=== Summary ===');
console.log('Updated with tags:', updated);
console.log('Already had tags:', alreadyHasTags);
console.log('No topics found:', noTopics);
