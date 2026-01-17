#!/usr/bin/env node
/**
 * Extract author from filename pattern "Title - Author Name.md"
 */

const fs = require('fs');
const path = require('path');

const docsDir = path.join(__dirname, '../docs');

let updated = 0;
let skipped = 0;

// Pattern: "Title - First Last.md" or "Title - First M. Last.md"
// Must end with a proper name (not Wikipedia, Unknown, etc.)
const filenameAuthorPattern = / - ([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+)(?:_liber\d)?\.md$/;

// Not valid authors - organizations, websites, common words
const notAuthors = new Set([
  'Wikipedia', 'Unknown', 'Reader Mode', 'Google Docs', 'Google',
  'Medium', 'Anonymous', 'Various Authors', 'Admin', 'Editor',
  'The Guardian', 'New York', 'Los Angeles', 'San Francisco',
  "Anna's Archive", 'Free Software', 'Open Source', 'Public Domain',
  'GNU Project', 'Creative Commons', 'Library', 'Archive',
]);

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
  // Check filename for author pattern
  const match = filename.match(filenameAuthorPattern);
  if (!match) {
    skipped++;
    return;
  }

  let author = match[1].trim();

  // Validate
  if (notAuthors.has(author)) {
    skipped++;
    return;
  }
  if (!author.includes(' ')) {
    skipped++;
    return;
  }
  if (author.length < 5 || author.length > 40) {
    skipped++;
    return;
  }
  if (/\d/.test(author)) {
    skipped++;
    return;
  }

  // Read file
  let content = fs.readFileSync(filepath, 'utf8');

  if (!content.startsWith('---')) {
    skipped++;
    return;
  }

  const endIdx = content.indexOf('---', 3);
  if (endIdx === -1) {
    skipped++;
    return;
  }

  const frontmatter = content.substring(3, endIdx);
  const body = content.substring(endIdx + 3);

  // Check if already has a valid author
  const authorMatch = frontmatter.match(/^author:\s*(.+)$/m);
  if (authorMatch) {
    const authorVal = authorMatch[1].trim().replace(/['"]/g, '');
    if (authorVal && authorVal !== 'null' && authorVal.toLowerCase() !== 'unknown' && authorVal.length > 3) {
      skipped++;
      return;
    }
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

  console.log(`Updated: ${path.relative(docsDir, filepath)} -> author: "${author}"`);
  updated++;
}

console.log('Extracting authors from filenames...\n');
walkDir(docsDir);

console.log(`\n=== DONE ===`);
console.log(`Updated: ${updated}`);
console.log(`Skipped: ${skipped}`);
