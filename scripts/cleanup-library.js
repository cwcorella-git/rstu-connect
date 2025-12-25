const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const DOCS_DIR = path.join(__dirname, '../docs');

// ═══════════════════════════════════════════════════════════
// TAG NORMALIZATION
// ═══════════════════════════════════════════════════════════

// Standard tag format (lowercase, consistent naming)
const TAG_NORMALIZATIONS = {
  // Case normalization
  'Abolition': 'abolition',
  'nevada': 'Nevada',
  'rstu': 'RSTU',

  // Merge similar tags
  'anarcho-syndicalism': 'syndicalism',
  'anarchist': 'anarchism',

  // Remove low-value tags
  'PDF': null,
  'pdf': null,
  'Audio': null,
  'article': null,

  // Fix typos/formatting
  'mutual-aid': 'mutual aid',
  'direct-action': 'direct action',
};

// Author names that should be removed as tags if doc has author
const AUTHOR_TAG_PATTERNS = [
  'Kropotkin', 'Peter Kropotkin', 'Pëtr Kropotkin',
  'Bookchin', 'Murray Bookchin',
  'Graeber', 'David Graeber',
  'Goldman', 'Emma Goldman',
  'Bakunin', 'Mikhail Bakunin',
  'Kevin Carson', 'Kevin A. Carson',
  'Jeff Shantz',
  'Audible Anarchist',
  'Dave Neal',
  'Staughton Lynd',
  'Wayne Price',
  'Albert Meltzer',
  'Harry Kelly',
  'Bill Haywood',
  'Federica Montseny',
  'Errico Malatesta',
  'Rosa Luxemburg',
  'Vladimir Lenin',
  'Karl Marx',
  'Amadeo Bordiga',
];

// ═══════════════════════════════════════════════════════════
// TITLE FIXES
// ═══════════════════════════════════════════════════════════

// Titles to fix (exact matches or patterns)
const TITLE_FIXES = {
  // Remove file extensions
  'What Is A Tenants Union - Google Docs.pdf': 'What Is A Tenants Union',

  // Known bad titles → correct titles
  'Debt': 'Debt: The First 5,000 Years',
  'AB121 EN': 'Nevada Assembly Bill 121',
  'AB223 EN': 'Nevada Assembly Bill 223',
  'edit': null,  // Remove this document
  'edit last': null,  // Remove this document
};

// ═══════════════════════════════════════════════════════════
// MALFORMED AUTHOR FIXES
// ═══════════════════════════════════════════════════════════

// Authors that are clearly parsing errors
const BAD_AUTHORS = {
  'Strike Wikipedia': null,
  'Hour Day': null,
  'Sri Lanka': null,
  'Mouvement C': 'Mouvement Communiste',
  'The New Temple Press': 'New Temple Press',
  'sub.media': null,  // This is a website, not an author
  're.Marx': null,    // This is a website, not an author
};

function cleanupDocument(filePath, dryRun = true) {
  const content = fs.readFileSync(filePath, 'utf8');
  let parsed;

  try {
    parsed = matter(content);
  } catch (err) {
    return { path: filePath, error: 'Invalid frontmatter' };
  }

  const data = parsed.data;
  const markdown = parsed.content;
  const changes = [];

  // ─────────────────────────────────────────────────────────
  // FIX TITLE
  // ─────────────────────────────────────────────────────────
  if (data.title) {
    let newTitle = data.title;

    // Check for exact fix
    if (TITLE_FIXES[newTitle] !== undefined) {
      if (TITLE_FIXES[newTitle] === null) {
        return { path: filePath, delete: true, reason: 'Bad title' };
      }
      changes.push({ field: 'title', from: newTitle, to: TITLE_FIXES[newTitle] });
      newTitle = TITLE_FIXES[newTitle];
    }

    // Remove file extensions from title
    const extMatch = newTitle.match(/\.(pdf|md|doc|docx|txt|epub|pptx?)$/i);
    if (extMatch) {
      const cleaned = newTitle.replace(/\.(pdf|md|doc|docx|txt|epub|pptx?)$/i, '').trim();
      changes.push({ field: 'title', from: newTitle, to: cleaned, reason: 'Remove extension' });
      newTitle = cleaned;
    }

    // Remove "aboutreaderurl=" and source artifacts
    if (newTitle.includes('aboutreaderurl=') || newTitle.includes('**Source**:')) {
      const cleaned = newTitle
        .replace(/\s*aboutreaderurl=.*$/, '')
        .replace(/\s*\*\*Source\*\*:.*$/, '')
        .trim();
      changes.push({ field: 'title', from: newTitle, to: cleaned, reason: 'Remove artifacts' });
      newTitle = cleaned;
    }

    // Remove trailing underscores and artifacts
    if (/_[a-z0-9]+$/i.test(newTitle)) {
      const cleaned = newTitle.replace(/_[a-z0-9_]+$/i, '').trim();
      if (cleaned.length > 10) {
        changes.push({ field: 'title', from: newTitle, to: cleaned, reason: 'Remove underscore suffix' });
        newTitle = cleaned;
      }
    }

    // Replace underscores with proper characters (but only standalone underscores between words)
    if (/\s_\s|\s_$|^_\s|_\s[A-Z]/.test(newTitle)) {
      const cleaned = newTitle
        .replace(/\s_\s/g, ': ')
        .replace(/\s_$/g, '')
        .replace(/^_\s/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      if (cleaned !== newTitle && cleaned.length > 10) {
        changes.push({ field: 'title', from: newTitle, to: cleaned, reason: 'Replace underscores' });
        newTitle = cleaned;
      }
    }

    // Remove " | The Anarchist Library" suffix
    if (newTitle.includes('The Anarchist Library')) {
      const cleaned = newTitle
        .replace(/\s*[\|_]\s*The Anarchist Library.*$/i, '')
        .trim();
      if (cleaned.length > 10) {
        changes.push({ field: 'title', from: newTitle, to: cleaned, reason: 'Remove library suffix' });
        newTitle = cleaned;
      }
    }

    data.title = newTitle;
  }

  // ─────────────────────────────────────────────────────────
  // FIX AUTHOR
  // ─────────────────────────────────────────────────────────
  if (data.author) {
    const author = String(data.author).trim();

    // Check for bad author
    if (BAD_AUTHORS[author] !== undefined) {
      if (BAD_AUTHORS[author] === null) {
        changes.push({ field: 'author', from: author, to: '(removed)', reason: 'Bad author' });
        delete data.author;
      } else {
        changes.push({ field: 'author', from: author, to: BAD_AUTHORS[author], reason: 'Fix author' });
        data.author = BAD_AUTHORS[author];
      }
    }
  }

  // ─────────────────────────────────────────────────────────
  // FIX TAGS
  // ─────────────────────────────────────────────────────────
  if (data.tags && Array.isArray(data.tags)) {
    const originalTags = [...data.tags];
    let newTags = data.tags.map(tag => {
      // Apply normalizations
      if (TAG_NORMALIZATIONS[tag] !== undefined) {
        return TAG_NORMALIZATIONS[tag];
      }
      return tag;
    }).filter(tag => tag !== null);  // Remove nulls

    // Remove author tags if document has an author
    if (data.author) {
      const authorLower = data.author.toLowerCase();
      newTags = newTags.filter(tag => {
        const tagLower = tag.toLowerCase();
        // Remove if tag is an author name
        if (AUTHOR_TAG_PATTERNS.some(ap => ap.toLowerCase() === tagLower)) {
          return false;
        }
        // Remove if tag matches document author
        if (tagLower === authorLower || authorLower.includes(tagLower) || tagLower.includes(authorLower.split(' ')[0])) {
          return false;
        }
        return true;
      });
    }

    // Remove duplicates (case-insensitive)
    const seen = new Set();
    newTags = newTags.filter(tag => {
      const lower = tag.toLowerCase();
      if (seen.has(lower)) return false;
      seen.add(lower);
      return true;
    });

    if (JSON.stringify(originalTags) !== JSON.stringify(newTags)) {
      changes.push({ field: 'tags', from: originalTags, to: newTags });
      data.tags = newTags;
    }
  }

  // ─────────────────────────────────────────────────────────
  // WRITE CHANGES
  // ─────────────────────────────────────────────────────────
  if (changes.length > 0 && !dryRun) {
    const newContent = matter.stringify(markdown, data);
    fs.writeFileSync(filePath, newContent);
  }

  return { path: filePath, changes };
}

function cleanupLibrary(dryRun = true) {
  console.log('🧹 Library Cleanup');
  console.log('═'.repeat(60));
  console.log(`Mode: ${dryRun ? '🔍 DRY RUN' : '✏️  APPLYING CHANGES'}\n`);

  const stats = {
    scanned: 0,
    modified: 0,
    deleted: 0,
    errors: 0,
  };

  const allChanges = [];
  const toDelete = [];

  function scanDirectory(dir) {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        if (!item.startsWith('.') && item !== 'node_modules') {
          scanDirectory(fullPath);
        }
      } else if (item.endsWith('.md')) {
        stats.scanned++;

        const result = cleanupDocument(fullPath, dryRun);

        if (result.error) {
          stats.errors++;
        } else if (result.delete) {
          toDelete.push({ path: fullPath, reason: result.reason });
        } else if (result.changes && result.changes.length > 0) {
          stats.modified++;
          allChanges.push({
            file: path.relative(DOCS_DIR, fullPath),
            changes: result.changes,
          });
        }
      }
    }
  }

  scanDirectory(DOCS_DIR);

  // Handle deletions
  if (toDelete.length > 0) {
    console.log(`\n🗑️  Files to delete (${toDelete.length}):`);
    for (const { path: filePath, reason } of toDelete) {
      console.log(`   • ${path.relative(DOCS_DIR, filePath)} - ${reason}`);
      if (!dryRun) {
        fs.unlinkSync(filePath);
        stats.deleted++;
      }
    }
  }

  // Show changes
  console.log(`\n📋 Changes (${allChanges.length} files):`);
  for (const { file, changes } of allChanges.slice(0, 30)) {
    console.log(`\n   ${file}:`);
    for (const change of changes) {
      if (change.field === 'tags') {
        console.log(`      tags: [${change.from.slice(0, 3).join(', ')}...] → [${change.to.slice(0, 3).join(', ')}...]`);
      } else {
        const from = typeof change.from === 'string' ? change.from.slice(0, 40) : change.from;
        const to = typeof change.to === 'string' ? change.to.slice(0, 40) : change.to;
        console.log(`      ${change.field}: "${from}" → "${to}"`);
      }
    }
  }

  if (allChanges.length > 30) {
    console.log(`\n   ... and ${allChanges.length - 30} more files`);
  }

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`📊 Summary:`);
  console.log(`   Scanned: ${stats.scanned} documents`);
  console.log(`   Modified: ${stats.modified} documents`);
  console.log(`   Deleted: ${dryRun ? toDelete.length + ' (pending)' : stats.deleted}`);
  if (stats.errors > 0) console.log(`   Errors: ${stats.errors}`);

  if (dryRun) {
    console.log(`\n💡 Run with --apply to make these changes`);
  }

  return { stats, changes: allChanges, toDelete };
}

// Check command line args
const args = process.argv.slice(2);
const dryRun = !args.includes('--apply');

cleanupLibrary(dryRun);
