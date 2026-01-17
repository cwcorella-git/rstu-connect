#!/usr/bin/env node
/**
 * Extract author and date from document content and update frontmatter
 */

const fs = require('fs');
const path = require('path');

const docsDir = path.join(__dirname, '../docs');

let updated = 0;
let skipped = 0;

// Common author patterns in document content
const authorPatterns = [
  /^#+\s*By\s+(.+)$/im,
  /^By\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)$/im,
  /^Author:\s*(.+)$/im,
  /^Written by\s+(.+)$/im,
  /\bBy\s+([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+)/m,
];

// Date patterns
const datePatterns = [
  /^#+\s*(\d{4})$/m,
  /\((\d{4})\)/,
  /^Date:\s*(\d{4})/im,
  /Published\s+(\d{4})/i,
  /©\s*(\d{4})/,
  /First\s+(?:Printing|Edition|Published)\s+.*?(\d{4})/i,
];

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

  // Parse existing frontmatter
  const lines = frontmatter.split('\n');
  let hasAuthor = lines.some(l => l.startsWith('author:') && !l.includes('null') && !l.includes('Unknown'));
  let hasDate = lines.some(l => l.startsWith('date:') && !l.includes('null') && !l.includes('Unknown'));

  if (hasAuthor && hasDate) {
    skipped++;
    return;
  }

  let extractedAuthor = null;
  let extractedDate = null;

  // Search in first 100 lines of body for metadata
  const searchArea = body.split('\n').slice(0, 100).join('\n');

  // Extract author
  if (!hasAuthor) {
    for (const pattern of authorPatterns) {
      const match = searchArea.match(pattern);
      if (match && match[1]) {
        let author = match[1].trim();
        // Clean up author
        author = author.replace(/[#*_]/g, '').trim();
        // Skip if it looks like a title or URL
        if (author.length > 3 && author.length < 100 &&
            !author.includes('http') &&
            !author.includes('Date:') &&
            /^[A-Z]/.test(author)) {
          extractedAuthor = author;
          break;
        }
      }
    }
  }

  // Extract date
  if (!hasDate) {
    for (const pattern of datePatterns) {
      const match = searchArea.match(pattern);
      if (match && match[1]) {
        const year = parseInt(match[1]);
        if (year >= 1800 && year <= 2026) {
          extractedDate = year.toString();
          break;
        }
      }
    }
  }

  if (!extractedAuthor && !extractedDate) {
    skipped++;
    return;
  }

  // Update frontmatter
  const newLines = [...lines];

  if (extractedAuthor && !hasAuthor) {
    // Find where to insert author (after title)
    const titleIdx = newLines.findIndex(l => l.startsWith('title:'));
    if (titleIdx !== -1) {
      const escapedAuthor = extractedAuthor.replace(/"/g, '\\"');
      newLines.splice(titleIdx + 1, 0, `author: "${escapedAuthor}"`);
    }
  }

  if (extractedDate && !hasDate) {
    // Find where to insert date (after author or title)
    const authorIdx = newLines.findIndex(l => l.startsWith('author:'));
    const titleIdx = newLines.findIndex(l => l.startsWith('title:'));
    const insertIdx = authorIdx !== -1 ? authorIdx + 1 : (titleIdx !== -1 ? titleIdx + 1 : 1);
    newLines.splice(insertIdx, 0, `date: ${extractedDate}`);
  }

  const newFrontmatter = newLines.join('\n');
  const newContent = '---' + newFrontmatter + '---' + body;

  fs.writeFileSync(filepath, newContent, 'utf8');

  const changes = [];
  if (extractedAuthor) changes.push(`author: "${extractedAuthor}"`);
  if (extractedDate) changes.push(`date: ${extractedDate}`);

  console.log(`Updated: ${path.relative(docsDir, filepath)}`);
  console.log(`  Added: ${changes.join(', ')}`);
  updated++;
}

console.log('Extracting metadata from document content...\n');
walkDir(docsDir);

console.log(`\n=== DONE ===`);
console.log(`Updated: ${updated}`);
console.log(`Skipped: ${skipped}`);
