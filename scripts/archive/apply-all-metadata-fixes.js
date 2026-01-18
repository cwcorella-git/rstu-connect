const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const DOCS_DIR = path.join(__dirname, '../docs');
const DATA_DIR = path.join(__dirname, '../data');

// Load all extraction sources
function loadExtractionData() {
  const sources = {
    contentAuthors: [],
    contentDates: [],
    fuzzyAuthors: []
  };

  // Content-extracted authors
  const contentAuthorsPath = path.join(DATA_DIR, 'content-extracted-authors.json');
  if (fs.existsSync(contentAuthorsPath)) {
    sources.contentAuthors = JSON.parse(fs.readFileSync(contentAuthorsPath, 'utf8'));
    console.log(`Loaded ${sources.contentAuthors.length} content-extracted authors`);
  }

  // Content-extracted dates
  const contentDatesPath = path.join(DATA_DIR, 'content-extracted-dates.json');
  if (fs.existsSync(contentDatesPath)) {
    sources.contentDates = JSON.parse(fs.readFileSync(contentDatesPath, 'utf8'));
    console.log(`Loaded ${sources.contentDates.length} content-extracted dates`);
  }

  // Fuzzy author matches from Anarchist Library
  const fuzzyAuthorsPath = path.join(DATA_DIR, 'fuzzy-author-matches.json');
  if (fs.existsSync(fuzzyAuthorsPath)) {
    sources.fuzzyAuthors = JSON.parse(fs.readFileSync(fuzzyAuthorsPath, 'utf8'));
    console.log(`Loaded ${sources.fuzzyAuthors.length} fuzzy author matches`);
  }

  return sources;
}

// Build lookup maps by document ID
function buildLookups(sources) {
  const lookups = {
    authors: new Map(),
    dates: new Map()
  };

  // Add content-extracted authors (high confidence)
  for (const item of sources.contentAuthors) {
    lookups.authors.set(item.id, {
      author: item.extracted_author,
      confidence: 0.9,
      method: item.extraction_method
    });
  }

  // Add fuzzy author matches (lower confidence, only if not already present)
  for (const item of sources.fuzzyAuthors) {
    if (!lookups.authors.has(item.rstu_id) && item.confidence >= 0.6 && item.author) {
      lookups.authors.set(item.rstu_id, {
        author: item.author,
        confidence: item.confidence,
        method: 'fuzzy_match'
      });
    }
  }

  // Add content-extracted dates
  for (const item of sources.contentDates) {
    if (item.extracted_date && item.extracted_date >= 1800 && item.extracted_date <= 2025) {
      lookups.dates.set(item.id, {
        date: item.extracted_date,
        method: item.extraction_method
      });
    }
  }

  console.log(`\nBuilt lookups: ${lookups.authors.size} authors, ${lookups.dates.size} dates`);
  return lookups;
}

// Generate document ID from file path (matching manifest generation)
function generateId(relativePath, filename) {
  const category = path.dirname(relativePath);
  const basename = path.basename(filename, '.md');
  return `${category}-${basename}`.toLowerCase().replace(/[^a-z0-9-]/g, '-');
}

// Process all documents
function applyMetadata(lookups) {
  let authorFixes = 0;
  let dateFixes = 0;
  let alreadyHasAuthor = 0;
  let alreadyHasDate = 0;
  const applied = [];

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

        // Generate ID
        const relativePath = path.relative(DOCS_DIR, fullPath);
        const id = generateId(relativePath, item);

        let modified = false;
        const changes = { id, title: parsed.data.title || item };

        // Apply author if missing
        if (!parsed.data.author && lookups.authors.has(id)) {
          const authorData = lookups.authors.get(id);
          parsed.data.author = authorData.author;
          authorFixes++;
          modified = true;
          changes.author = authorData.author;
          changes.authorMethod = authorData.method;
        } else if (parsed.data.author) {
          alreadyHasAuthor++;
        }

        // Apply date if missing
        if (!parsed.data.date && lookups.dates.has(id)) {
          const dateData = lookups.dates.get(id);
          parsed.data.date = dateData.date;
          dateFixes++;
          modified = true;
          changes.date = dateData.date;
          changes.dateMethod = dateData.method;
        } else if (parsed.data.date) {
          alreadyHasDate++;
        }

        if (modified) {
          // Write back
          const newContent = matter.stringify(parsed.content, parsed.data);
          fs.writeFileSync(fullPath, newContent);
          applied.push(changes);
        }
      }
    }
  }

  processDir(DOCS_DIR);

  return { authorFixes, dateFixes, alreadyHasAuthor, alreadyHasDate, applied };
}

// Main
console.log('=== Applying All Extracted Metadata ===\n');

const sources = loadExtractionData();
const lookups = buildLookups(sources);
const results = applyMetadata(lookups);

console.log('\n=== Application Results ===');
console.log(`Authors applied: ${results.authorFixes}`);
console.log(`Dates applied: ${results.dateFixes}`);
console.log(`Already had author: ${results.alreadyHasAuthor}`);
console.log(`Already had date: ${results.alreadyHasDate}`);

// Show sample of applied changes
if (results.applied.length > 0) {
  console.log('\n=== Sample Applied Changes ===');
  results.applied.slice(0, 20).forEach(c => {
    let desc = [];
    if (c.author) desc.push(`author: ${c.author}`);
    if (c.date) desc.push(`date: ${c.date}`);
    console.log(`  [${c.id.split('-')[0]}] ${(c.title || '').slice(0, 40)}: ${desc.join(', ')}`);
  });
  if (results.applied.length > 20) {
    console.log(`  ... and ${results.applied.length - 20} more`);
  }
}

// Save application log
fs.writeFileSync(
  path.join(DATA_DIR, 'metadata-applied-log.json'),
  JSON.stringify({
    timestamp: new Date().toISOString(),
    authorFixes: results.authorFixes,
    dateFixes: results.dateFixes,
    applied: results.applied
  }, null, 2)
);

console.log('\n=== Next Steps ===');
console.log('Run: node scripts/generate-reading-manifest.js');
console.log('Then: node scripts/analyze-metadata-gaps.js');
