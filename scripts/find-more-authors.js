const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const DOCS_DIR = path.join(__dirname, '../docs');

// Well-known anarchist/left authors and their works
const KNOWN_WORKS = {
  'Mutual Aid': 'Peter Kropotkin',
  'Conquest of Bread': 'Peter Kropotkin',
  'Fields Factories': 'Peter Kropotkin',
  'Appeal to the Young': 'Peter Kropotkin',
  'Anarchist Morality': 'Peter Kropotkin',
  'Modern Science and Anarchism': 'Peter Kropotkin',
  'Post-Scarcity Anarchism': 'Murray Bookchin',
  'Ecology of Freedom': 'Murray Bookchin',
  'Social Ecology': 'Murray Bookchin',
  'Libertarian Municipalism': 'Murray Bookchin',
  'Listen Marxist': 'Murray Bookchin',
  'Communalism': 'Murray Bookchin',
  'Debt.*5000': 'David Graeber',
  'Bullshit Jobs': 'David Graeber',
  'Fragments of an Anarchist': 'David Graeber',
  'Direct Action.*Ethnography': 'David Graeber',
  'Anarchism.*Other Essays': 'Emma Goldman',
  'Living My Life': 'Emma Goldman',
  'God and the State': 'Mikhail Bakunin',
  'Statism and Anarchy': 'Mikhail Bakunin',
  'Unique and Its Property': 'Max Stirner',
  'Ego and Its Own': 'Max Stirner',
  'Anarcho-Syndicalism.*Theory.*Practice': 'Rudolf Rocker',
  'Nationalism and Culture': 'Rudolf Rocker',
  'ABC of Anarchism': 'Alexander Berkman',
  'Prison Memoirs': 'Alexander Berkman',
  'Conquest of Violence': 'Bart de Ligt',
  'Anarchy Works': 'Peter Gelderloos',
  'Worshiping Power': 'Peter Gelderloos',
  'Studies in Mutualist': 'Kevin Carson',
  'Organization Theory': 'Kevin Carson',
  'Homebrew Industrial': 'Kevin Carson',
  'Iron Fist': 'Kevin Carson',
};

// Author name patterns in titles/filenames
const AUTHOR_PATTERNS = [
  /peter\s*kropotkin/i,
  /murray\s*bookchin/i,
  /david\s*graeber/i,
  /emma\s*goldman/i,
  /mikhail\s*bakunin/i,
  /max\s*stirner/i,
  /rudolf\s*rocker/i,
  /alexander\s*berkman/i,
  /kevin\s*(?:a\.\s*)?carson/i,
  /peter\s*gelderloos/i,
  /noam\s*chomsky/i,
  /errico\s*malatesta/i,
  /lucy\s*parsons/i,
  /voltairine\s*de\s*cleyre/i,
  /rosa\s*luxemburg/i,
  /karl\s*marx/i,
];

const AUTHOR_MAP = {
  'peter kropotkin': 'Peter Kropotkin',
  'murray bookchin': 'Murray Bookchin',
  'david graeber': 'David Graeber',
  'emma goldman': 'Emma Goldman',
  'mikhail bakunin': 'Mikhail Bakunin',
  'max stirner': 'Max Stirner',
  'rudolf rocker': 'Rudolf Rocker',
  'alexander berkman': 'Alexander Berkman',
  'kevin carson': 'Kevin Carson',
  'kevin a. carson': 'Kevin Carson',
  'peter gelderloos': 'Peter Gelderloos',
  'noam chomsky': 'Noam Chomsky',
  'errico malatesta': 'Errico Malatesta',
  'lucy parsons': 'Lucy Parsons',
  'voltairine de cleyre': 'Voltairine de Cleyre',
  'rosa luxemburg': 'Rosa Luxemburg',
  'karl marx': 'Karl Marx',
};

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

      // Skip if has author
      if (parsed.data.author) return;

      const title = parsed.data.title || '';
      const filename = item;
      const searchText = `${title} ${filename} ${parsed.content.slice(0, 500)}`.toLowerCase();

      let foundAuthor = null;
      let method = '';

      // Check known works
      for (const [pattern, author] of Object.entries(KNOWN_WORKS)) {
        if (new RegExp(pattern, 'i').test(searchText)) {
          foundAuthor = author;
          method = 'known-work';
          break;
        }
      }

      // Check author patterns
      if (!foundAuthor) {
        for (const pattern of AUTHOR_PATTERNS) {
          const match = searchText.match(pattern);
          if (match) {
            const normalized = match[0].toLowerCase().replace(/\s+/g, ' ');
            foundAuthor = AUTHOR_MAP[normalized] || match[0];
            method = 'name-pattern';
            break;
          }
        }
      }

      if (foundAuthor) {
        candidates.push({
          file: path.relative(DOCS_DIR, fullPath),
          author: foundAuthor,
          method,
          title: title.slice(0, 50),
        });
      }
    }
  }
}

scanDir(DOCS_DIR);

console.log(`Found ${candidates.length} documents with identifiable authors:\n`);
candidates.forEach(c => {
  console.log(`  ${c.file}:`);
  console.log(`    title: "${c.title}..."`);
  console.log(`    author: "${c.author}" (${c.method})`);
  console.log('');
});
