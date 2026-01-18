#!/usr/bin/env node
/**
 * Safe metadata extraction - only extract when patterns are very clear
 */

const fs = require('fs');
const path = require('path');

const docsDir = path.join(__dirname, '../docs');

let updated = 0;
let skipped = 0;

// Only very reliable author patterns
const authorPatterns = [
  // "By Author Name" at start of line
  /^[Bb]y\s+([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+)(?:\s*$|\s*[-,\n])/m,
  // "## By Author Name"
  /^#+\s*[Bb]y\s+([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+)/m,
  // "Author: Name"
  /^[Aa]uthor:\s*([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+)/m,
  // "Written by Name"
  /^[Ww]ritten\s+[Bb]y\s+([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+)/m,
];

// Reliable date patterns
const datePatterns = [
  /©\s*(\d{4})/,
  /[Cc]opyright\s+(\d{4})/,
  /[Pp]ublished\s+(?:in\s+)?(\d{4})/,
  /[Ff]irst\s+[Pp]ublished\s+.*?(\d{4})/,
  /^#+\s*(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})/m,
  /\((\d{4})\)\s*$/m,  // (Year) at end of line
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

  const lines = frontmatter.split('\n');

  // Check for existing valid author
  let hasAuthor = lines.some(l => {
    if (!l.startsWith('author:')) return false;
    const val = l.substring(7).trim().replace(/["']/g, '');
    return val && val !== 'null' && val !== 'Unknown' && val.length > 3;
  });

  // Check for existing valid date
  let hasDate = lines.some(l => {
    if (!l.startsWith('date:')) return false;
    const val = l.substring(5).trim();
    return /\d{4}/.test(val);
  });

  if (hasAuthor && hasDate) {
    skipped++;
    return;
  }

  let extractedAuthor = null;
  let extractedDate = null;

  // Search first 50 lines only
  const searchArea = body.split('\n').slice(0, 50).join('\n');

  // Extract author
  if (!hasAuthor) {
    for (const pattern of authorPatterns) {
      const match = searchArea.match(pattern);
      if (match && match[1]) {
        let author = match[1].trim();
        // Must have space (first + last name) and be reasonable length
        if (author.includes(' ') && author.length > 5 && author.length < 50) {
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
        if (year >= 1850 && year <= 2026) {
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
    const titleIdx = newLines.findIndex(l => l.startsWith('title:'));
    const authorIdx = newLines.findIndex(l => l.startsWith('author:'));
    const escapedAuthor = extractedAuthor.replace(/"/g, '\\"');

    if (authorIdx !== -1) {
      newLines[authorIdx] = `author: "${escapedAuthor}"`;
    } else if (titleIdx !== -1) {
      newLines.splice(titleIdx + 1, 0, `author: "${escapedAuthor}"`);
    }
  }

  if (extractedDate && !hasDate) {
    const authorIdx = newLines.findIndex(l => l.startsWith('author:'));
    const titleIdx = newLines.findIndex(l => l.startsWith('title:'));
    const dateIdx = newLines.findIndex(l => l.startsWith('date:'));
    const insertIdx = authorIdx !== -1 ? authorIdx + 1 : (titleIdx !== -1 ? titleIdx + 1 : 1);

    if (dateIdx !== -1) {
      newLines[dateIdx] = `date: ${extractedDate}`;
    } else {
      newLines.splice(insertIdx, 0, `date: ${extractedDate}`);
    }
  }

  const newFrontmatter = newLines.join('\n');
  const newContent = '---' + newFrontmatter + '---' + body;

  fs.writeFileSync(filepath, newContent, 'utf8');

  const changes = [];
  if (extractedAuthor && !hasAuthor) changes.push(`author: "${extractedAuthor}"`);
  if (extractedDate && !hasDate) changes.push(`date: ${extractedDate}`);

  console.log(`Updated: ${path.relative(docsDir, filepath)}`);
  console.log(`  Added: ${changes.join(', ')}`);
  updated++;
}

console.log('Safe metadata extraction...\n');
walkDir(docsDir);

console.log(`\n=== DONE ===`);
console.log(`Updated: ${updated}`);
console.log(`Skipped: ${skipped}`);
