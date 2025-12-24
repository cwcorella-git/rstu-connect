const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const DOCS_DIR = path.join(__dirname, '../docs');

// ═══════════════════════════════════════════════════════════
// SPECIFIC TITLE FIXES
// ═══════════════════════════════════════════════════════════
const TITLE_FIXES = {
  'AB121 EN': 'Nevada Assembly Bill 121 - Landlord Notice Requirements',
  'AB121_EN': 'Nevada Assembly Bill 121 - Landlord Notice Requirements',
  'AB223 EN': 'Nevada Assembly Bill 223 - Tenant Protections',
  'AB223_EN': 'Nevada Assembly Bill 223 - Tenant Protections',
  // Fix underscores in titles
};

// ═══════════════════════════════════════════════════════════
// TAG CLEANUP RULES
// ═══════════════════════════════════════════════════════════

// Tags to remove entirely
const TAGS_TO_REMOVE = [
  'PDF', 'pdf',
  'Audio', 'audio',
  'article', 'Article',
  'Abolition',  // Keep only lowercase 'abolition'
];

// Tags to normalize
const TAG_NORMALIZATIONS = {
  'Abolition': 'abolition',
  'nevada': 'Nevada',
  'rstu': 'RSTU',
  'anarcho-syndicalism': 'syndicalism',
  'mutual-aid': 'mutual aid',
  'direct-action': 'direct action',
};

// Author tags to remove if document has author field
const AUTHOR_TAGS = [
  'Kropotkin', 'Peter Kropotkin', 'Pëtr Kropotkin',
  'Bookchin', 'Murray Bookchin',
  'Graeber', 'David Graeber',
  'Goldman', 'Emma Goldman',
  'Bakunin', 'Mikhail Bakunin',
  'Kevin Carson', 'Kevin A. Carson',
  'Jeff Shantz',
  'Dave Neal',
  'Wayne Price',
  'Albert Meltzer',
  'Karl Marx',
  'Rosa Luxemburg',
  'Simoun Magsalin',
  'Evan Milner',
  'Anarchist Black Cross',
  'Black Rose Anarchist Federation',
  'Saša Kaluža',
  'Mouvement Communiste',
];

function fixDocument(filePath, dryRun = true) {
  const content = fs.readFileSync(filePath, 'utf8');
  let parsed;

  try {
    parsed = matter(content);
  } catch (err) {
    return { error: true };
  }

  const data = parsed.data;
  const markdown = parsed.content;
  const changes = [];

  // Fix title
  if (data.title) {
    let newTitle = data.title;

    // Check for specific fixes
    if (TITLE_FIXES[newTitle]) {
      changes.push({ field: 'title', from: newTitle, to: TITLE_FIXES[newTitle] });
      newTitle = TITLE_FIXES[newTitle];
    }

    // Replace underscore followed by space (e.g., "Title_ Subtitle" → "Title: Subtitle")
    // But only when underscore has a space after it or before a capital letter
    if (/_ [A-Z]/.test(newTitle)) {
      const fixed = newTitle.replace(/_ ([A-Z])/g, ': $1');
      if (fixed !== newTitle) {
        changes.push({ field: 'title', from: newTitle, to: fixed });
        newTitle = fixed;
      }
    }

    data.title = newTitle;
  }

  // Fix tags
  if (data.tags && Array.isArray(data.tags)) {
    const originalTags = [...data.tags];
    let newTags = data.tags
      // Normalize
      .map(tag => TAG_NORMALIZATIONS[tag] || tag)
      // Remove unwanted
      .filter(tag => !TAGS_TO_REMOVE.includes(tag));

    // Geographic/topic tags that should never be removed as author tags
    const PROTECTED_TAGS = [
      'Nevada', 'California', 'Canada', 'UK', 'US', 'USA', 'Spain', 'France', 'Germany',
      'Italy', 'Mexico', 'Argentina', 'Chile', 'Brazil', 'Australia', 'Ireland',
      'Vancouver', 'Oakland', 'Richmond', 'Manchester', 'Philadelphia', 'Ukraine',
      'housing', 'tenants', 'legislation', 'strikes', 'unions', 'abolition', 'prisons',
    ];

    // Remove author tags if document has author
    if (data.author) {
      const authorLower = String(data.author).toLowerCase();
      newTags = newTags.filter(tag => {
        const tagLower = tag.toLowerCase();

        // Never remove protected geographic/topic tags
        if (PROTECTED_TAGS.some(pt => pt.toLowerCase() === tagLower)) {
          return true;
        }

        // Remove if exact match to a known author tag
        if (AUTHOR_TAGS.some(at => at.toLowerCase() === tagLower)) {
          return false;
        }
        // Remove if tag exactly matches document's author
        if (tagLower === authorLower) {
          return false;
        }
        return true;
      });
    }

    // Remove duplicates (case-insensitive)
    const seen = new Set();
    newTags = newTags.filter(tag => {
      const key = tag.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    if (JSON.stringify(originalTags.sort()) !== JSON.stringify(newTags.sort())) {
      changes.push({
        field: 'tags',
        removed: originalTags.filter(t => !newTags.includes(t)),
        added: newTags.filter(t => !originalTags.includes(t)),
      });
      data.tags = newTags;
    }
  }

  // Write if changed
  if (changes.length > 0 && !dryRun) {
    const newContent = matter.stringify(markdown, data);
    fs.writeFileSync(filePath, newContent);
  }

  return { changes };
}

function fixLibrary(dryRun = true) {
  console.log('🔧 Fixing Remaining Issues');
  console.log('═'.repeat(60));
  console.log(`Mode: ${dryRun ? '🔍 DRY RUN' : '✏️  APPLYING'}\n`);

  let scanned = 0, modified = 0;
  const allChanges = [];

  function scan(dir) {
    for (const item of fs.readdirSync(dir)) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory() && !item.startsWith('.')) {
        scan(fullPath);
      } else if (item.endsWith('.md')) {
        scanned++;
        const result = fixDocument(fullPath, dryRun);
        if (result.changes && result.changes.length > 0) {
          modified++;
          allChanges.push({
            file: path.relative(DOCS_DIR, fullPath),
            changes: result.changes,
          });
        }
      }
    }
  }

  scan(DOCS_DIR);

  // Show changes
  console.log(`📋 Changes (${allChanges.length} files):\n`);
  for (const { file, changes } of allChanges.slice(0, 40)) {
    console.log(`   ${file}:`);
    for (const c of changes) {
      if (c.field === 'tags') {
        if (c.removed.length) console.log(`      - removed: [${c.removed.join(', ')}]`);
        if (c.added.length) console.log(`      + added: [${c.added.join(', ')}]`);
      } else {
        console.log(`      ${c.field}: "${c.from}" → "${c.to}"`);
      }
    }
  }
  if (allChanges.length > 40) {
    console.log(`\n   ... and ${allChanges.length - 40} more`);
  }

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`📊 Summary: ${scanned} scanned, ${modified} modified`);

  if (dryRun) {
    console.log(`\n💡 Run with --apply to make changes`);
  }
}

const dryRun = !process.argv.includes('--apply');
fixLibrary(dryRun);
