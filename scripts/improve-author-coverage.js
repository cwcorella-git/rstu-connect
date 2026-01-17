#!/usr/bin/env node
/**
 * Improve author coverage by extracting from multiple sources:
 * 1. Filename patterns (Title - Author Name.md)
 * 2. Content patterns (By Name, Author: Name)
 * 3. Known organizational authors
 * 4. Title patterns
 */

const fs = require('fs');
const path = require('path');

const docsDir = path.join(__dirname, '../docs');

let updated = 0;
let skipped = 0;

// Known organizational authors (when individual author isn't available)
const orgAuthors = {
  'iww': 'Industrial Workers of the World',
  'industrial workers of the world': 'Industrial Workers of the World',
  'cnt': 'Confederación Nacional del Trabajo',
  'fau': 'Freie Arbeiterinnen- und Arbeiter-Union',
  'crimethinc': 'CrimethInc.',
  'anarchist federation': 'Anarchist Federation',
  'solidarity federation': 'Solidarity Federation',
  'black rose': 'Black Rose Anarchist Federation',
  'libcom': 'libcom.org',
  'anarchist library': 'The Anarchist Library',
  'wikipedia': 'Wikipedia contributors',
  'class war': 'Class War Federation',
  'freedom press': 'Freedom Press',
};

// Common author name patterns in content
const contentPatterns = [
  // "By FirstName LastName" at start of line (with optional middle initial)
  /^By\s+([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+(?:[- ][A-Z][a-z]+)?)\s*[-,\n]/m,
  // "By FIRSTNAME LASTNAME" (all caps)
  /^By\s+([A-Z]{2,}(?:\s+[A-Z]\.?\s*)?[A-Z]{2,})\s*[-,\n]/m,
  // "Author: Name"
  /^Author:\s*([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+(?:[- ][A-Z][a-z]+)?)/m,
  // "## By Name" or "### By Name"
  /^#+\s*By\s+([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+(?:[- ][A-Z][a-z]+)?)/m,
  // "Written by Name"
  /[Ww]ritten\s+[Bb]y\s+([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+(?:[- ][A-Z][a-z]+)?)/,
  // "- Name" right after title (common in essays)
  /^-\s*([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+(?:[- ][A-Z][a-z]+)?)\s*$/m,
];

// Words that indicate NOT an author
const notAuthorWords = [
  'Wikipedia', 'Unknown', 'Anonymous', 'Various', 'Editor', 'Staff',
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
  'Chapter', 'Volume', 'Part', 'Section', 'Introduction', 'Conclusion',
  'University', 'College', 'Institute', 'Foundation', 'Association',
  'Press', 'Publishing', 'Books', 'Library', 'Archive',
  'The', 'And', 'For', 'From', 'With', 'About',
];

function isValidAuthor(name) {
  if (!name) return false;
  name = name.trim();

  // Must have space (first + last name) or be a known org
  if (!name.includes(' ') && name.length < 15) return false;

  // Reasonable length
  if (name.length < 5 || name.length > 60) return false;

  // No numbers
  if (/\d/.test(name)) return false;

  // Not a bad word
  for (const word of notAuthorWords) {
    if (name.includes(word)) return false;
  }

  // Not all lowercase
  if (name === name.toLowerCase()) return false;

  return true;
}

function extractAuthorFromFilename(filename) {
  // Pattern: "Title - Author Name.md" or "Title - Author Name_something.md"
  const match = filename.match(/ - ([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+(?:[- ][A-Z][a-z]+)?)(?:_|\.|$)/);
  if (match && isValidAuthor(match[1])) {
    return match[1].trim();
  }
  return null;
}

function extractAuthorFromContent(body, title) {
  // Only search first 50 lines
  const searchArea = body.split('\n').slice(0, 50).join('\n');

  for (const pattern of contentPatterns) {
    const match = searchArea.match(pattern);
    if (match && match[1]) {
      let author = match[1].trim();
      // Convert ALL CAPS to Title Case
      if (author === author.toUpperCase()) {
        author = author.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
      }
      if (isValidAuthor(author)) {
        return author;
      }
    }
  }

  // Check for organizational author from title or content
  const lowerTitle = title.toLowerCase();
  const lowerContent = searchArea.toLowerCase();

  for (const [pattern, orgName] of Object.entries(orgAuthors)) {
    if (lowerTitle.includes(pattern) || lowerContent.includes(pattern)) {
      // Only use org author if it's prominent (in title or first few lines)
      const first5Lines = body.split('\n').slice(0, 5).join('\n').toLowerCase();
      if (lowerTitle.includes(pattern) || first5Lines.includes(pattern)) {
        return orgName;
      }
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
        authorVal !== 'Unknown' &&
        authorVal.length > 3) {
      skipped++;
      return;
    }
  }

  // Get title for context
  const titleMatch = frontmatter.match(/^title:\s*["']?(.+?)["']?\s*$/m);
  const title = titleMatch ? titleMatch[1] : '';

  // Try extraction methods in order of reliability
  let author = null;

  // 1. Try filename
  author = extractAuthorFromFilename(filename);

  // 2. Try content patterns
  if (!author) {
    author = extractAuthorFromContent(body, title);
  }

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

console.log('Improving author coverage...\n');
walkDir(docsDir);

console.log(`\n=== DONE ===`);
console.log(`Updated: ${updated}`);
console.log(`Skipped: ${skipped}`);
