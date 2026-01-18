#!/usr/bin/env node
/**
 * Author extraction v4 - targeted patterns from deep content analysis:
 * 1. Copyright notices (© Author Name)
 * 2. Author links in content ([Author Name](url))
 * 3. Bylines deeper in content ("by Author Name" or "— Author Name")
 * 4. Authors in filenames with underscores (Title_Author_suffix.md)
 * 5. Title pages in PDF-converted documents
 */

const fs = require('fs');
const path = require('path');

const docsDir = path.join(__dirname, '../docs');

let updated = 0;
let skipped = 0;

// Specific author mappings from content analysis
const KNOWN_DOCUMENT_AUTHORS = {
  'Colin_Ward_Anarchy_in_Action.md': 'Colin Ward',
  'TAL_murray-bookchin_urbanization-without-cities.md': 'Murray Bookchin',
  'Murray_Bookchin__Libertarian_Municipalism__An_Overview_a4.md': 'Murray Bookchin',
};

// Words that indicate NOT an author
const NOT_AUTHOR_WORDS = [
  'Wikipedia', 'Unknown', 'Anonymous', 'Various', 'Editor', 'Staff',
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
  'Chapter', 'Volume', 'Part', 'Section', 'Introduction', 'Conclusion',
  'University', 'College', 'Institute', 'Foundation', 'Association',
  'Press', 'Publishing', 'Books', 'Library', 'Archive', 'Document',
  'The', 'And', 'For', 'From', 'With', 'About', 'Article',
  'Reader', 'Mode', 'Episode', 'Preview', 'Sample', 'All Rights',
  'Copyright', 'Reserved', 'Open Access',
];

function isValidAuthor(name) {
  if (!name) return false;
  name = name.trim();

  if (name.length < 4 || name.length > 80) return false;
  if (/\d{3,}/.test(name)) return false; // No long numbers
  if (name.includes('@')) return false; // No emails
  if (name.includes('http')) return false; // No URLs

  for (const word of NOT_AUTHOR_WORDS) {
    if (name.toLowerCase() === word.toLowerCase()) return false;
    if (name.toLowerCase().startsWith(word.toLowerCase() + ' ') &&
        !['the author', 'the editor'].includes(name.toLowerCase())) return false;
  }

  // Must have at least one capital letter
  if (!/[A-Z]/.test(name)) return false;

  return true;
}

function extractFromBody(body, filename) {
  // Check known mappings first
  if (KNOWN_DOCUMENT_AUTHORS[filename]) {
    return KNOWN_DOCUMENT_AUTHORS[filename];
  }

  const first5000 = body.substring(0, 5000);

  // Pattern 1: Copyright notice - "Copyright © 2020 Author Name" or "© Author Name"
  const copyrightMatch = first5000.match(/(?:Copyright\s*)?©\s*(?:\d{4}\s*)?([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);
  if (copyrightMatch && isValidAuthor(copyrightMatch[1])) {
    return copyrightMatch[1].trim();
  }

  // Pattern 2: "The right of X to be identified as author"
  const rightOfMatch = first5000.match(/right of\s+([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+to be identified as (?:the )?author/i);
  if (rightOfMatch && isValidAuthor(rightOfMatch[1])) {
    return rightOfMatch[1].trim();
  }

  // Pattern 3: Author link markdown - [Author Name](url/author/...)
  const authorLinkMatch = first5000.match(/\[([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+)\]\([^)]*\/author\//);
  if (authorLinkMatch && isValidAuthor(authorLinkMatch[1])) {
    return authorLinkMatch[1].trim();
  }

  // Pattern 4: "by Author Name," with date following
  const byDateMatch = first5000.match(/\bby\s+([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s*[,\-]\s*(?:January|February|March|April|May|June|July|August|September|October|November|December|\d{1,2})/i);
  if (byDateMatch && isValidAuthor(byDateMatch[1])) {
    return byDateMatch[1].trim();
  }

  // Pattern 5: Em-dash byline "— Author Name"
  const emDashMatch = first5000.match(/[—–]\s*([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+)(?:\s*$|\s*\n)/m);
  if (emDashMatch && isValidAuthor(emDashMatch[1])) {
    return emDashMatch[1].trim();
  }

  // Pattern 6: Italicized author "*Author Name*"
  const italicMatch = first5000.match(/^\*([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+)\*\s*$/m);
  if (italicMatch && isValidAuthor(italicMatch[1])) {
    return italicMatch[1].trim();
  }

  // Pattern 7: "By Author Name -" at start of line
  const byDashMatch = first5000.match(/^By\s+([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+)\s*-/m);
  if (byDashMatch && isValidAuthor(byDashMatch[1])) {
    return byDashMatch[1].trim();
  }

  // Pattern 8: Author in liber3-style filename (Title_Author Name_liber3.md)
  const liber3Match = filename.match(/_([A-Z][a-z]+(?:,?\s+[A-Z]\.?\s*)?[A-Z][a-z]+(?:;\s*[A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+)?)_liber3\.md$/);
  if (liber3Match) {
    // Take first author if multiple separated by semicolon
    const firstAuthor = liber3Match[1].split(';')[0].trim();
    if (isValidAuthor(firstAuthor)) {
      return firstAuthor;
    }
  }

  // Pattern 9: Multiple authors in filename (Author1, Author2_liber3.md)
  const multiAuthorMatch = filename.match(/_([A-Z][a-z]+\s+[A-Z][a-z]+(?:,\s*[A-Z][a-z]+\s+[A-Z][a-z]+)+)_/);
  if (multiAuthorMatch && isValidAuthor(multiAuthorMatch[1].split(',')[0].trim())) {
    return multiAuthorMatch[1].split(',')[0].trim();
  }

  // Pattern 10: "Chris Allan and A. Scott Du Pree" style in content
  const andMatch = first5000.match(/^([A-Z][a-z]+\s+[A-Z][a-z]+)\s+and\s+([A-Z]\.?\s*[A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s*$/m);
  if (andMatch && isValidAuthor(andMatch[1])) {
    return andMatch[1] + ' and ' + andMatch[2];
  }

  return null;
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filepath = path.join(dir, file);
    const stat = fs.statSync(filepath);
    if (stat.isDirectory()) {
      walkDir(filepath);
    } else if (file.endsWith('.md')) {
      processFile(filepath, file);
    }
  }
}

function processFile(filepath, filename) {
  let content = fs.readFileSync(filepath, 'utf8');

  if (!content.startsWith('---')) return;

  const endIdx = content.indexOf('---', 3);
  if (endIdx === -1) return;

  const frontmatter = content.substring(3, endIdx);
  const body = content.substring(endIdx + 3);

  // Check if already has a valid author
  const authorMatch = frontmatter.match(/^author:\s*["']?(.+?)["']?\s*$/m);
  if (authorMatch) {
    const authorVal = authorMatch[1].trim().replace(/['"]/g, '');
    if (authorVal &&
        authorVal !== 'null' &&
        authorVal.toLowerCase() !== 'unknown' &&
        authorVal !== '' &&
        authorVal.length > 3) {
      skipped++;
      return;
    }
  }

  const author = extractFromBody(body, filename);

  if (!author) {
    skipped++;
    return;
  }

  // Update frontmatter
  const lines = frontmatter.split('\n');
  const existingAuthorIdx = lines.findIndex(l => l.startsWith('author:'));
  const escapedAuthor = author.replace(/"/g, '\\"');

  if (existingAuthorIdx !== -1) {
    lines[existingAuthorIdx] = `author: "${escapedAuthor}"`;
  } else {
    const titleIdx = lines.findIndex(l => l.startsWith('title:'));
    const insertIdx = titleIdx !== -1 ? titleIdx + 1 : 1;
    lines.splice(insertIdx, 0, `author: "${escapedAuthor}"`);
  }

  const newFrontmatter = lines.join('\n');
  const newContent = '---' + newFrontmatter + '---' + body;

  fs.writeFileSync(filepath, newContent, 'utf8');

  console.log(`Updated: ${path.relative(docsDir, filepath)} -> "${author}"`);
  updated++;
}

console.log('Author extraction v4 - deep content patterns...\n');
walkDir(docsDir);

console.log(`\n=== DONE ===`);
console.log(`Updated: ${updated}`);
console.log(`Skipped: ${skipped}`);
