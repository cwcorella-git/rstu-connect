#!/usr/bin/env node
/**
 * Extract authors from document content using various patterns
 */

const fs = require('fs');
const path = require('path');

const docsDir = path.join(__dirname, '../docs');

let updated = 0;
let skipped = 0;

// Author patterns - very specific to avoid false positives
const authorPatterns = [
  // "**Author:** FirstName LastName" (markdown bold)
  /\*\*[Aa]uthor:\*\*\s*([A-Z][a-z]+(?:\s+(?:[A-Z]\.?\s*)?[A-Z]?[a-z']+)+)/m,
  // "## Author: FirstName LastName"
  /^#+\s*[Aa]uthor:\s*([A-Z][a-z]+(?:\s+(?:[A-Z]\.?\s*)?[A-Z]?[a-z']+)+)/m,
  // "By FirstName LastName" at start of line
  /^[Bb]y\s+([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+(?:-[A-Z][a-z]+)?)\s*$/m,
  // "## By FirstName LastName"
  /^#+\s*[Bb]y\s+([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+(?:-[A-Z][a-z]+)?)\s*$/m,
  // "Author: FirstName LastName" plain text
  /^[Aa]uthor:\s*([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+(?:-[A-Z][a-z]+)?)\s*$/m,
  // "Written by FirstName LastName"
  /^[Ww]ritten\s+[Bb]y:?\s+([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+(?:-[A-Z][a-z]+)?)\s*$/m,
  // "# FirstName LastName" (common for essays where author name is first header)
  /^#\s+([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+(?:-[A-Z][a-z]+)?)\s*$/m,
  // "| FirstName LastName" (Wikipedia-style attribution)
  /^\|\s*([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+(?:-[A-Z][a-z]+)?)\s*\|?/m,
  // "Translated by FirstName LastName"
  /[Tt]ranslated\s+[Bb]y:?\s+([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+(?:-[A-Z][a-z]+)?)/m,
  // "A report from FirstName LastName"
  /[Aa]\s+report\s+(?:from|by)\s+([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z']+(?:-[A-Z][a-z]+)?)/m,
];

// Names that are likely not authors (organizations, etc.)
const notAuthors = [
  'The Guardian', 'The Atlantic', 'New York', 'Los Angeles', 'San Francisco',
  'United States', 'North America', 'South America', 'Wikipedia', 'Google',
  'Anonymous Author', 'Unknown Author', 'The Anarchist', 'The Communist',
  'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December', 'Home Page', 'Main Page',
  'Read More', 'See Also', 'External Links', 'References', 'Related Articles',
  'Anonymous', 'Unknown', 'Various Authors', 'Contributors', 'Wikimedia',
  'Race Today', 'Black Flag', 'Class War', 'Libcom', 'Anarchist Library',
];

function extractAuthor(content) {
  // Only search first 30 lines
  const lines = content.split('\n').slice(0, 30);
  const searchArea = lines.join('\n');

  for (const pattern of authorPatterns) {
    const match = searchArea.match(pattern);
    if (match && match[1]) {
      let author = match[1].trim();

      // Validate author name
      if (!author.includes(' ')) continue; // Must have first + last name
      if (author.length < 5 || author.length > 50) continue;
      if (notAuthors.some(n => author.includes(n))) continue;
      if (/\d/.test(author)) continue; // No numbers in author names

      // Clean up trailing punctuation
      author = author.replace(/[.,;:]+$/, '').trim();

      return author;
    }
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
      processFile(filepath);
    }
  }
}

function processFile(filepath) {
  let content = fs.readFileSync(filepath, 'utf8');

  if (!content.startsWith('---')) return;

  const endIdx = content.indexOf('---', 3);
  if (endIdx === -1) return;

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

  // Try to extract author from body
  const author = extractAuthor(body);

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
    // Insert after title
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

console.log('Extracting authors from document content...\n');
walkDir(docsDir);

console.log(`\n=== DONE ===`);
console.log(`Updated: ${updated}`);
console.log(`Skipped: ${skipped}`);
