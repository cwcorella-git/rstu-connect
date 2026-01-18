const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const DOCS_DIR = path.join(__dirname, '../docs');

// Bad single-word authors to remove (false positives from extraction)
const BAD_AUTHORS = [
  'TIME', 'Police', 'Harvard', 'Data', 'Clinton', 'Mutt', 'Aragorn',
  'libcom', 'tenants', 'Kropotkin', 'Lebanese',
  // Bad multi-word extractions
  'opening access', 'Join Tenants Together', 'How To', 'In Sheffield',
  'offering rent', 'And Enshittification', 'regular people', 'These Tenants',
  'Organizing Toolkit', 'Residential Tenancy'
];

// Authors to replace with full names
const AUTHOR_REPLACEMENTS = {
  'RSTU': 'Reno Sparks Tenants Union',
  'IWW': 'Industrial Workers of the World'
};

// Legitimate short/single-word authors to keep as-is
const VALID_SHORT_AUTHORS = [
  'Wikipedia', 'Anonymous', 'CrimethInc', 'Crimethinc',
  'Jacobin', 'Shelterforce', 'ACLU', 'NLRB', 'Britannica'
];

let removed = 0;
let replaced = 0;

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

      const author = parsed.data.author;
      if (!author) continue;

      let modified = false;

      // Check if it's a bad author to remove
      if (BAD_AUTHORS.includes(author)) {
        delete parsed.data.author;
        modified = true;
        removed++;
        console.log(`Removed: "${author}" from ${item.slice(0, 50)}`);
      }
      // Check if it needs replacement
      else if (AUTHOR_REPLACEMENTS[author]) {
        parsed.data.author = AUTHOR_REPLACEMENTS[author];
        modified = true;
        replaced++;
        console.log(`Replaced: "${author}" → "${AUTHOR_REPLACEMENTS[author]}" in ${item.slice(0, 40)}`);
      }

      if (modified) {
        const newContent = matter.stringify(parsed.content, parsed.data);
        fs.writeFileSync(fullPath, newContent);
      }
    }
  }
}

console.log('=== Fixing Bad Author Assignments ===\n');
processDir(DOCS_DIR);

console.log(`\n=== Summary ===`);
console.log(`Removed: ${removed}`);
console.log(`Replaced: ${replaced}`);
