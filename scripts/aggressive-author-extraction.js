const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const DOCS_DIR = path.join(__dirname, '../docs');

// Known organizations/collectives that author documents
const ORGANIZATIONS = [
  'CrimethInc', 'Crimethinc', 'It\'s Going Down', 'ItsGoingDown',
  'Anarchist Black Cross', 'Black Rose', 'Industrial Workers of the World', 'IWW',
  'Workers Solidarity Movement', 'Anarchist Federation', 'Reno Sparks Tenants Union', 'RSTU',
  'Autonomous Tenants Union', 'Tenants Together', 'Wikipedia', 'Britannica',
  'Nevada Current', 'Nevada Independent', 'AP News', 'TIME', 'Harvard',
  'National Park Service', 'ACLU', 'NLRB', 'FBI', 'Police', 'FBI',
  'Shelterforce', 'Jacobin', 'The Flaw', 'Labor Notes'
];

// Known individual authors (expanded list)
const KNOWN_AUTHORS = [
  'Murray Bookchin', 'Peter Kropotkin', 'Mikhail Bakunin', 'Emma Goldman',
  'David Graeber', 'Noam Chomsky', 'Rudolf Rocker', 'Errico Malatesta',
  'Alexander Berkman', 'Lucy Parsons', 'Colin Ward', 'Kevin Carson',
  'Wayne Price', 'Zoe Baker', 'Mark Bray', 'Uri Gordon', 'Jeff Shantz',
  'Tom Wetzel', 'Robert Anton Wilson', 'Rosa Luxemburg', 'Karl Marx',
  'Friedrich Engels', 'Antonio Gramsci', 'Guy Debord', 'Angela Davis',
  'bell hooks', 'Audre Lorde', 'Paolo Freire', 'Frantz Fanon',
  'Helge Döhring', 'Saša Kaluža', 'Paolo Soleri', 'Henri Lefebvre',
  'Matthew Frederick', 'Timothy Hsiao', 'Bill Haywood', 'Hubert Lagardelle',
  'John Crump', 'Shirley Fredericks', 'Albert Meltzer', 'George Barrett',
  'Voltairine de Cleyre', 'Gustav Landauer', 'Pierre-Joseph Proudhon',
  'Max Stirner', 'William Godwin', 'Leo Tolstoy', 'Howard Zinn',
  'Shawn Fain', 'Staughton Lynd', 'Immanuel Ness'
];

function extractAuthorFromFilename(filename) {
  // Pattern: "Title - Author Name.md" or "Title_Author Name.md"
  const dashMatch = filename.match(/[-–]\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)(?:\.md)?$/);
  if (dashMatch) {
    const potential = dashMatch[1].trim();
    // Avoid false positives like "Part I", "Volume II"
    if (!potential.match(/^(Part|Volume|Chapter|Section|Issue)\s/i)) {
      return { author: potential, method: 'filename_dash' };
    }
  }

  // Pattern: "author-name-title.md" at start
  const prefixMatch = filename.match(/^([a-z]+-[a-z]+(?:-[a-z]+)?)-/);
  if (prefixMatch) {
    const words = prefixMatch[1].split('-');
    if (words.length >= 2 && words.length <= 4) {
      const name = words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      // Check if it looks like a name (not "The Great" etc)
      if (!name.match(/^(The|A|An|How|What|Why|When|Where)\s/i)) {
        return { author: name, method: 'filename_prefix' };
      }
    }
  }

  return null;
}

function extractAuthorFromContent(content, title) {
  const lines = content.split('\n');
  const first50Lines = lines.slice(0, 50).join('\n');

  // Check for known authors in content
  for (const author of KNOWN_AUTHORS) {
    const regex = new RegExp(`\\b${author.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (first50Lines.match(regex)) {
      return { author, method: 'known_author_content' };
    }
  }

  // Check for organizations
  for (const org of ORGANIZATIONS) {
    const regex = new RegExp(`\\b${org.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (first50Lines.match(regex)) {
      return { author: org, method: 'organization' };
    }
  }

  // Pattern: "by Author Name" or "By Author Name"
  const byMatch = first50Lines.match(/\bby\s+([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+)/i);
  if (byMatch) {
    return { author: byMatch[1], method: 'by_attribution' };
  }

  // Pattern: "Author: Name" or "Author Name:"
  const authorColonMatch = first50Lines.match(/Author:\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i);
  if (authorColonMatch) {
    return { author: authorColonMatch[1], method: 'author_field' };
  }

  // Pattern: "Written by Name"
  const writtenByMatch = first50Lines.match(/[Ww]ritten\s+by\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/);
  if (writtenByMatch) {
    return { author: writtenByMatch[1], method: 'written_by' };
  }

  // For articles ending with source name, use that
  if (title) {
    // "Title - Source Name" pattern in title
    const sourceMatch = title.match(/[-–]\s*([A-Za-z][A-Za-z\s]+)$/);
    if (sourceMatch) {
      const source = sourceMatch[1].trim();
      // Check if it's a known org
      for (const org of ORGANIZATIONS) {
        if (source.toLowerCase().includes(org.toLowerCase())) {
          return { author: org, method: 'title_source' };
        }
      }
    }
  }

  return null;
}

// Assign default authors based on category/content type
function assignDefaultAuthor(filename, category) {
  // RSTU organizational documents
  if (filename.includes('RSTU') || filename.includes('rstu') ||
      filename.includes('Reno Sparks Tenant')) {
    return { author: 'Reno Sparks Tenants Union', method: 'organizational_default' };
  }

  // Google Docs = likely RSTU docs
  if (filename.includes('Google Docs')) {
    return { author: 'Reno Sparks Tenants Union', method: 'google_docs_default' };
  }

  // Legislation
  if (category === 'Legislation' || filename.match(/bill.*no/i)) {
    return { author: 'Nevada Legislature', method: 'legislation_default' };
  }

  // Meeting notes
  if (filename.toLowerCase().includes('meeting')) {
    return { author: 'Reno Sparks Tenants Union', method: 'meeting_notes_default' };
  }

  // Wikipedia articles
  if (filename.includes('Wikipedia') || filename.includes('wikipedia')) {
    return { author: 'Wikipedia', method: 'wikipedia_default' };
  }

  return null;
}

function processDocuments() {
  const results = [];
  let processed = 0;
  let extracted = 0;

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

        // Skip if already has author
        if (parsed.data.author) {
          continue;
        }

        processed++;

        // Get category from path
        const relativePath = path.relative(DOCS_DIR, fullPath);
        const category = path.dirname(relativePath);

        // Try extraction methods in order of confidence
        let result = extractAuthorFromFilename(item);
        if (!result) {
          result = extractAuthorFromContent(parsed.content, parsed.data.title);
        }
        if (!result) {
          result = assignDefaultAuthor(item, category);
        }

        if (result) {
          extracted++;

          // Apply the author
          parsed.data.author = result.author;
          const newContent = matter.stringify(parsed.content, parsed.data);
          fs.writeFileSync(fullPath, newContent);

          results.push({
            file: item.slice(0, 50),
            author: result.author,
            method: result.method
          });

          console.log(`[${result.method}] ${item.slice(0, 35)}: ${result.author}`);
        }
      }
    }
  }

  processDir(DOCS_DIR);

  return { processed, extracted, results };
}

console.log('=== Aggressive Author Extraction ===\n');
const { processed, extracted, results } = processDocuments();

console.log('\n=== Summary ===');
console.log(`Processed: ${processed} docs without authors`);
console.log(`Extracted: ${extracted} authors`);

// Count by method
const byMethod = {};
for (const r of results) {
  byMethod[r.method] = (byMethod[r.method] || 0) + 1;
}
console.log('\nBy method:');
for (const [method, count] of Object.entries(byMethod).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${method}: ${count}`);
}
