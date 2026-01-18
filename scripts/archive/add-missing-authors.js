const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const DOCS_DIR = path.join(__dirname, '../docs');

// Known author corrections based on title/filename analysis
const AUTHOR_CORRECTIONS = {
  // Filename patterns -> author
  'On Property - Rinaldo Walcott.md': 'Rinaldo Walcott',
  'Ecology and Revolutionary Thought Audiobook - Murray Bookchin.md': 'Murray Bookchin',
  'Escape From Childhood - John Holt.md': 'John Holt',

  // Title contains author name
  'Mutual Aid a Factor of Evolution Peter Kropotkin': 'Peter Kropotkin',
  'Mutual Aid Peter Kropotkin': 'Peter Kropotkin',
  'To Remember Spain the Anarchist and Syndicalist Revolution': 'Murray Bookchin',
  'Ecology And Revolutionary Thought Audiobook Murray': 'Murray Bookchin',

  // Known works (title -> author)
  'The Conquest of Bread': 'Peter Kropotkin',
  'Fields, Factories and Workshops': 'Peter Kropotkin',
  'Mutual Aid: A Factor of Evolution': 'Peter Kropotkin',
  'Post-Scarcity Anarchism': 'Murray Bookchin',
  'The Ecology of Freedom': 'Murray Bookchin',
  'Debt: The First 5000 Years': 'David Graeber',
  'Bullshit Jobs': 'David Graeber',
  'Anarchism and Other Essays': 'Emma Goldman',
  'God and the State': 'Mikhail Bakunin',
  'Statism and Anarchy': 'Mikhail Bakunin',
  'The Unique and Its Property': 'Max Stirner',
  'Anarcho-Syndicalism: Theory and Practice': 'Rudolf Rocker',
};

// Known authors to extract from content Tags lines
const KNOWN_AUTHORS = [
  'Peter Kropotkin', 'Pëtr Kropotkin', 'Kropotkin',
  'Murray Bookchin', 'Bookchin',
  'David Graeber', 'Graeber',
  'Emma Goldman', 'Goldman',
  'Mikhail Bakunin', 'Bakunin',
  'Kevin Carson', 'Kevin A. Carson',
  'Peter Gelderloos',
  'Noam Chomsky',
  'Rudolf Rocker',
  'Errico Malatesta',
  'Max Stirner',
  'Alexander Berkman',
  'Lucy Parsons',
  'Voltairine de Cleyre',
  'Rosa Luxemburg',
  'Karl Marx',
  'Friedrich Engels',
];

// Normalize author names
function normalizeAuthor(name) {
  const normalizations = {
    'Pëtr Kropotkin': 'Peter Kropotkin',
    'Kropotkin': 'Peter Kropotkin',
    'Bookchin': 'Murray Bookchin',
    'Graeber': 'David Graeber',
    'Goldman': 'Emma Goldman',
    'Bakunin': 'Mikhail Bakunin',
  };
  return normalizations[name] || name;
}

function addMissingAuthors(dryRun = true) {
  console.log('📝 Add Missing Authors');
  console.log('═'.repeat(60));
  console.log(`Mode: ${dryRun ? '🔍 DRY RUN' : '✏️  APPLYING'}\n`);

  let scanned = 0, updated = 0;
  const changes = [];

  function scanDir(dir) {
    for (const item of fs.readdirSync(dir)) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory() && !item.startsWith('.')) {
        scanDir(fullPath);
      } else if (item.endsWith('.md')) {
        scanned++;
        const content = fs.readFileSync(fullPath, 'utf8');
        let parsed;
        try {
          parsed = matter(content);
        } catch (e) {
          continue;
        }

        // Skip if already has author
        if (parsed.data.author) continue;

        let newAuthor = null;
        let method = '';

        // Check filename corrections
        if (AUTHOR_CORRECTIONS[item]) {
          newAuthor = AUTHOR_CORRECTIONS[item];
          method = 'filename';
        }

        // Check title corrections
        if (!newAuthor && parsed.data.title) {
          for (const [pattern, author] of Object.entries(AUTHOR_CORRECTIONS)) {
            if (parsed.data.title.toLowerCase().includes(pattern.toLowerCase())) {
              newAuthor = author;
              method = 'title-match';
              break;
            }
          }
        }

        // Check for known author in Tags line in content
        if (!newAuthor) {
          const tagsMatch = parsed.content.match(/\*\*Tags:\*\*\s*([^\n]+)/i) ||
                           parsed.content.match(/^Tags:\s*([^\n]+)/m);
          if (tagsMatch) {
            const tags = tagsMatch[1].split(',').map(t => t.trim());
            for (const tag of tags) {
              if (KNOWN_AUTHORS.includes(tag)) {
                newAuthor = normalizeAuthor(tag);
                method = 'content-tags';
                break;
              }
            }
          }
        }

        // Check for author in title pattern "X - Author Name"
        if (!newAuthor && parsed.data.title) {
          const titleMatch = parsed.data.title.match(/\s+-\s+([A-Z][a-z]+ [A-Z][a-z]+)\s*$/);
          if (titleMatch && !['Google Docs', 'Carson Now', 'The Flaw'].includes(titleMatch[1])) {
            // Verify it looks like an author name (not a publication)
            const potential = titleMatch[1];
            if (!/^(The|A|An)\s/.test(potential) && !/\s(Press|Journal|Review|Magazine)$/.test(potential)) {
              newAuthor = potential;
              method = 'title-suffix';
            }
          }
        }

        if (newAuthor) {
          updated++;
          changes.push({
            file: path.relative(DOCS_DIR, fullPath),
            author: newAuthor,
            method,
          });

          if (!dryRun) {
            parsed.data.author = newAuthor;
            const newContent = matter.stringify(parsed.content, parsed.data);
            fs.writeFileSync(fullPath, newContent);
          }
        }
      }
    }
  }

  scanDir(DOCS_DIR);

  console.log(`📋 Author Additions (${changes.length}):\n`);
  for (const c of changes.slice(0, 50)) {
    console.log(`   ${c.file}:`);
    console.log(`     + author: "${c.author}" (${c.method})`);
  }
  if (changes.length > 50) {
    console.log(`\n   ... and ${changes.length - 50} more`);
  }

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`📊 Summary: ${scanned} scanned, ${updated} updated`);

  if (dryRun && updated > 0) {
    console.log(`\n💡 Run with --apply to make changes`);
  }
}

const dryRun = !process.argv.includes('--apply');
addMissingAuthors(dryRun);
