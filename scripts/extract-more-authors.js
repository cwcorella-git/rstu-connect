#!/usr/bin/env node
/**
 * Extract more authors using additional patterns
 */

const fs = require('fs');
const path = require('path');

const docsDir = path.join(__dirname, '../docs');

let updated = 0;
let skipped = 0;

// More author patterns
const authorPatterns = [
  // "By FirstName LastName," or "By FirstName LastName -"
  /^By\s+([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+(?:[- ][A-Z][a-z]+)?)\s*[,\-]/m,
  // "by FirstName LastName" (lowercase by)
  /^by\s+([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+(?:[- ][A-Z][a-z]+)?)\s*$/m,
  // "| By FirstName LastName"
  /\|\s*By\s+([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+(?:[- ][A-Z][a-z]+)?)/m,
  // "*By FirstName LastName*" (italic)
  /\*By\s+([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+(?:[- ][A-Z][a-z]+)?)\*/m,
  // "**By FirstName LastName**" (bold)
  /\*\*By\s+([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+(?:[- ][A-Z][a-z]+)?)\*\*/m,
  // "Posted by FirstName LastName"
  /[Pp]osted\s+[Bb]y\s+([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+(?:[- ][A-Z][a-z]+)?)/m,
  // "Authored by FirstName LastName"
  /[Aa]uthored\s+[Bb]y\s+([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+(?:[- ][A-Z][a-z]+)?)/m,
  // "from FirstName LastName" (common in interviews)
  /[Ff]rom\s+([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+(?:[- ][A-Z][a-z]+)?)\s*$/m,
  // "FirstName LastName writes" or "FirstName LastName argues"
  /^([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+)\s+(?:writes|argues|explains|discusses|examines)/m,
  // Interview pattern: "Interview with FirstName LastName"
  /[Ii]nterview\s+with\s+([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+(?:[- ][A-Z][a-z]+)?)/,
  // "A conversation with FirstName LastName"
  /[Cc]onversation\s+with\s+([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+(?:[- ][A-Z][a-z]+)?)/,
];

// Words that indicate NOT an author
const notAuthorWords = [
  'Wikipedia', 'Unknown', 'Anonymous', 'Various', 'Editor', 'Staff',
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
  'Chapter', 'Volume', 'Part', 'Section', 'Introduction', 'Conclusion',
  'University', 'College', 'Press', 'Publishing', 'Books',
  'The', 'And', 'For', 'From', 'With', 'About', 'This', 'That',
  'Read', 'More', 'Click', 'Here', 'View', 'Download',
];

function isValidAuthor(name) {
  if (!name) return false;
  name = name.trim();

  // Must have space (first + last name)
  if (!name.includes(' ')) return false;

  // Reasonable length
  if (name.length < 5 || name.length > 50) return false;

  // No numbers
  if (/\d/.test(name)) return false;

  // Not a bad word
  for (const word of notAuthorWords) {
    if (name.includes(word)) return false;
  }

  // Should start with capital letter
  if (!/^[A-Z]/.test(name)) return false;

  return true;
}

function extractAuthor(body) {
  // Search first 60 lines
  const searchArea = body.split('\n').slice(0, 60).join('\n');

  for (const pattern of authorPatterns) {
    const match = searchArea.match(pattern);
    if (match && match[1]) {
      let author = match[1].trim();
      // Clean up
      author = author.replace(/[.,;:]+$/, '').trim();
      if (isValidAuthor(author)) {
        return author;
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

console.log('Extracting more authors...\n');
walkDir(docsDir);

console.log(`\n=== DONE ===`);
console.log(`Updated: ${updated}`);
console.log(`Skipped: ${skipped}`);
