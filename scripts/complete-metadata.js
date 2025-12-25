const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const DOCS_DIR = path.join(__dirname, '../docs');

// Default author assignments by pattern
const AUTHOR_PATTERNS = [
  // Global Nonviolent Action Database articles
  { pattern: /^\d{4}.*(?:strike|protest|movement)/i, author: 'Global Nonviolent Action Database' },
  { pattern: /^Article_\d{4}-/i, author: 'Global Nonviolent Action Database' },
  // Historical strike articles
  { pattern: /general.strike/i, author: 'Global Nonviolent Action Database' },
  // Wikipedia
  { pattern: /wikipedia/i, author: 'Wikipedia' },
  // Police/abolition articles
  { pattern: /police.*(?:duty|protect|powers)/i, author: 'Unknown' },
  // Academic papers (often have journal identifiers)
  { pattern: /^\d+-\d+-\d+-PB\.md$/i, author: 'Academic Journal' },
  { pattern: /^195\w+\.md$/i, author: 'Academic Journal' },
  // Housing documents
  { pattern: /tenant|housing|rent/i, author: 'Housing Advocacy Organization' },
];

// Category-based default authors
const CATEGORY_DEFAULTS = {
  'Misc': 'Unknown',
  'Abolition': 'Unknown',
  'Labor': 'Global Nonviolent Action Database',
  'Housing': 'Housing Advocacy Organization',
  'Theory': 'Unknown',
  'Organizing': 'Unknown',
  'Notes': 'Reno Sparks Tenants Union',
  'Legislation': 'Nevada Legislature',
  'Contemporary Analysis': 'Unknown'
};

// Category-based default tags
const CATEGORY_TAGS = {
  'Abolition': ['abolition', 'police'],
  'Labor': ['labor', 'strikes'],
  'Housing': ['housing', 'tenants'],
  'Housing Rent Tenants': ['housing', 'tenants', 'rent'],
  'Organizing': ['organizing', 'direct action'],
  'Organizing Action': ['organizing', 'direct action'],
  'Theory': ['theory', 'anarchism'],
  'Contemporary Analysis': ['theory', 'contemporary'],
  'Legislation': ['legislation', 'Nevada'],
  'Notes': ['RSTU', 'organizing'],
  'Misc': ['organizing']
};

// Known author extractions from filename
const FILENAME_AUTHORS = {
  'david-graeber': 'David Graeber',
  'murray-bookchin': 'Murray Bookchin',
  'peter-kropotkin': 'Peter Kropotkin',
  'emma-goldman': 'Emma Goldman',
  'kevin-carson': 'Kevin Carson',
  'rudolf-rocker': 'Rudolf Rocker',
  'noam-chomsky': 'Noam Chomsky'
};

let authorsAdded = 0;
let tagsAdded = 0;

function getAuthorFromFilename(filename) {
  const lower = filename.toLowerCase();
  for (const [pattern, author] of Object.entries(FILENAME_AUTHORS)) {
    if (lower.startsWith(pattern)) {
      return author;
    }
  }
  return null;
}

function getAuthorFromPatterns(filename, title) {
  const text = filename + ' ' + (title || '');
  for (const { pattern, author } of AUTHOR_PATTERNS) {
    if (pattern.test(text)) {
      return author;
    }
  }
  return null;
}

function getTagsFromContent(content, category, title) {
  const tags = [];
  const text = (content + ' ' + (title || '')).toLowerCase();

  // Add category-based tags
  if (CATEGORY_TAGS[category]) {
    tags.push(...CATEGORY_TAGS[category]);
  }

  // Extract additional tags from content
  const tagPatterns = [
    { pattern: /strike/i, tag: 'strikes' },
    { pattern: /union/i, tag: 'unions' },
    { pattern: /tenant/i, tag: 'tenants' },
    { pattern: /housing/i, tag: 'housing' },
    { pattern: /rent/i, tag: 'rent' },
    { pattern: /police/i, tag: 'police' },
    { pattern: /prison/i, tag: 'prisons' },
    { pattern: /worker/i, tag: 'labor' },
    { pattern: /anarchi/i, tag: 'anarchism' },
    { pattern: /organiz/i, tag: 'organizing' },
  ];

  for (const { pattern, tag } of tagPatterns) {
    if (pattern.test(text) && !tags.includes(tag)) {
      tags.push(tag);
    }
  }

  return [...new Set(tags)].slice(0, 5); // Dedupe and limit to 5
}

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

      const relativePath = path.relative(DOCS_DIR, fullPath);
      const category = path.dirname(relativePath).split('-').map(w =>
        w.charAt(0).toUpperCase() + w.slice(1)
      ).join(' ');

      let modified = false;

      // Add author if missing
      if (!parsed.data.author) {
        // Try filename-based author first
        let author = getAuthorFromFilename(item);

        // Try pattern matching
        if (!author) {
          author = getAuthorFromPatterns(item, parsed.data.title);
        }

        // Fall back to category default
        if (!author) {
          author = CATEGORY_DEFAULTS[category] || 'Unknown';
        }

        parsed.data.author = author;
        modified = true;
        authorsAdded++;
        console.log(`[author] ${item.slice(0, 45)}: ${author}`);
      }

      // Add tags if missing
      if (!parsed.data.tags || parsed.data.tags.length === 0) {
        const tags = getTagsFromContent(parsed.content, category, parsed.data.title);
        if (tags.length > 0) {
          parsed.data.tags = tags;
          modified = true;
          tagsAdded++;
          console.log(`[tags] ${item.slice(0, 45)}: ${tags.join(', ')}`);
        }
      }

      if (modified) {
        const newContent = matter.stringify(parsed.content, parsed.data);
        fs.writeFileSync(fullPath, newContent);
      }
    }
  }
}

console.log('=== Completing Metadata ===\n');
processDir(DOCS_DIR);

console.log(`\n=== Summary ===`);
console.log(`Authors added: ${authorsAdded}`);
console.log(`Tags added: ${tagsAdded}`);
