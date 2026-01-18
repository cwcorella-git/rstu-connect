#!/usr/bin/env node
/**
 * Final author extraction from titles and special patterns
 */

const fs = require('fs');
const path = require('path');

const docsDir = path.join(__dirname, '../docs');

let updated = 0;
let skipped = 0;

// Title patterns that indicate author
const titleAuthorPatterns = [
  // "Title - Author Name" in title field
  / - ([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+)$/,
  // "Title by Author Name"
  / by ([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+)$/i,
  // "Author Name's Title"
  /^([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+)'s /,
];

// Known authors from titles
const knownTitleAuthors = {
  'Mahatma Gandhi': 'Mahatma Gandhi',
  'Murray Bookchin': 'Murray Bookchin',
  'Peter Kropotkin': 'Peter Kropotkin',
  'Emma Goldman': 'Emma Goldman',
  'Noam Chomsky': 'Noam Chomsky',
  'David Graeber': 'David Graeber',
  'Rosa Luxemburg': 'Rosa Luxemburg',
  'Henry George': 'Henry George',
  'Karl Marx': 'Karl Marx',
  'Friedrich Engels': 'Friedrich Engels',
};

// Content patterns for "Name with Name" or similar
const specialPatterns = [
  // "Neil Landau with Matthew Frederick"
  /^([A-Z][a-z]+\s+[A-Z][a-z]+)\s+with\s+[A-Z][a-z]+\s+[A-Z][a-z]+/m,
  // "by Name" in content (more lenient)
  /^by\s+([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+)/im,
];

function isValidAuthor(name) {
  if (!name) return false;
  name = name.trim();
  if (!name.includes(' ')) return false;
  if (name.length < 5 || name.length > 50) return false;
  if (/\d/.test(name)) return false;
  if (/Wikipedia|Unknown|Anonymous|Editor|Press|University/i.test(name)) return false;
  return true;
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

  // Get title
  const titleMatch = frontmatter.match(/^title:\s*["']?(.+?)["']?\s*$/m);
  const title = titleMatch ? titleMatch[1] : '';

  let author = null;

  // 1. Check for known authors in title
  for (const [name, authorName] of Object.entries(knownTitleAuthors)) {
    if (title.includes(name)) {
      author = authorName;
      break;
    }
  }

  // 2. Try title patterns
  if (!author) {
    for (const pattern of titleAuthorPatterns) {
      const match = title.match(pattern);
      if (match && match[1] && isValidAuthor(match[1])) {
        author = match[1].trim();
        break;
      }
    }
  }

  // 3. Try special content patterns
  if (!author) {
    const searchArea = body.split('\n').slice(0, 30).join('\n');
    for (const pattern of specialPatterns) {
      const match = searchArea.match(pattern);
      if (match && match[1] && isValidAuthor(match[1])) {
        author = match[1].trim();
        break;
      }
    }
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

console.log('Final author extraction...\n');
walkDir(docsDir);

console.log(`\n=== DONE ===`);
console.log(`Updated: ${updated}`);
console.log(`Skipped: ${skipped}`);
