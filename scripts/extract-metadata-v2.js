#!/usr/bin/env node
/**
 * More aggressive metadata extraction from document content
 */

const fs = require('fs');
const path = require('path');

const docsDir = path.join(__dirname, '../docs');

let updated = 0;
let skipped = 0;

// Expanded author patterns
const authorPatterns = [
  /^#+\s*[Bb]y\s+(.+)$/m,
  /^[Bb]y\s+([A-Z][a-zA-Z]+(?:\s+[A-Z]\.?\s*)?(?:[A-Z][a-zA-Z]+)?(?:\s+[A-Z][a-zA-Z]+)?)(?:\s*[-,]|$)/m,
  /^[Aa]uthor:?\s*(.+)$/m,
  /^[Ww]ritten\s+[Bb]y\s+(.+)$/m,
  /^[Ff]rom\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)+)\s*$/m,
  /\n[Bb]y\s+([A-Z][a-zA-Z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-zA-Z]+)/m,
  /^Source:\s*.*?[Bb]y\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)+)/m,
  /^\*\*([A-Z][a-zA-Z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-zA-Z]+)\*\*$/m,
  // Name at very start of document (after headers)
  /^#+\s*([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+)\s*$/m,
];

// Expanded date patterns
const datePatterns = [
  /\((\d{4})\)/,
  /^#+\s*(\d{4})$/m,
  /[Dd]ate:?\s*(\d{4})/,
  /[Pp]ublished\s+(?:in\s+)?(\d{4})/i,
  /©\s*(\d{4})/,
  /[Ff]irst\s+(?:[Pp]rinting|[Ee]dition|[Pp]ublished)\s+.*?(\d{4})/i,
  /(\d{4})\s+[Ee]dition/,
  /[A-Z][a-z]+\s+(\d{4})(?:\s|$|\.)/,  // Month Year
  /,\s*(\d{4})(?:\s|$|\.)/,  // comma Year
  /_(\d{4})[-_\.]/,  // in filename-style patterns
  /^(\d{4})[-\/]/m,  // Year at start
  /\b(19\d{2}|20[0-2]\d)\b/,  // Any year 1900-2029
];

// Known author names to look for
const knownAuthors = [
  'Murray Bookchin', 'Noam Chomsky', 'Emma Goldman', 'Peter Kropotkin',
  'Mikhail Bakunin', 'David Graeber', 'Howard Zinn', 'bell hooks',
  'Angela Davis', 'Frantz Fanon', 'Paulo Freire', 'Antonio Gramsci',
  'Rosa Luxemburg', 'Karl Marx', 'Friedrich Engels', 'Leon Trotsky',
  'Saul Alinsky', 'James Baldwin', 'Audre Lorde', 'Ursula Le Guin',
  'Henry David Thoreau', 'Ralph Waldo Emerson', 'Martin Luther King',
  'Malcolm X', 'Stokely Carmichael', 'Huey Newton', 'Fred Hampton',
  'Lucy Parsons', 'Eugene Debs', 'Big Bill Haywood', 'Mother Jones',
  'Voltairine de Cleyre', 'Alexander Berkman', 'Errico Malatesta',
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
  let hasAuthor = lines.some(l => {
    if (!l.startsWith('author:')) return false;
    const val = l.substring(7).trim().replace(/["']/g, '');
    return val && val !== 'null' && val !== 'Unknown' && val.length > 2;
  });
  let hasDate = lines.some(l => {
    if (!l.startsWith('date:')) return false;
    const val = l.substring(5).trim().replace(/["']/g, '');
    return val && val !== 'null' && val !== 'Unknown' && /\d{4}/.test(val);
  });

  if (hasAuthor && hasDate) {
    skipped++;
    return;
  }

  let extractedAuthor = null;
  let extractedDate = null;

  // Also check filename for clues
  const filename = path.basename(filepath, '.md');

  // Search in first 150 lines of body for metadata
  const searchArea = body.split('\n').slice(0, 150).join('\n');

  // Extract author
  if (!hasAuthor) {
    // First check for known authors
    for (const author of knownAuthors) {
      if (searchArea.includes(author) || filename.toLowerCase().includes(author.toLowerCase().split(' ')[1])) {
        extractedAuthor = author;
        break;
      }
    }

    // Then try patterns
    if (!extractedAuthor) {
      for (const pattern of authorPatterns) {
        const match = searchArea.match(pattern);
        if (match && match[1]) {
          let author = match[1].trim();
          // Clean up author
          author = author.replace(/[#*_\[\]]/g, '').trim();
          author = author.replace(/\s+/g, ' ');
          // Skip if it looks like a title, URL, or nonsense
          if (author.length > 4 && author.length < 80 &&
              !author.includes('http') &&
              !author.includes('Date:') &&
              !author.includes('Source:') &&
              !/^\d+$/.test(author) &&
              /^[A-Z]/.test(author) &&
              (author.includes(' ') || author.length < 20)) {
            extractedAuthor = author;
            break;
          }
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

    // Also check filename
    if (!extractedDate) {
      const filenameMatch = filename.match(/(19\d{2}|20[0-2]\d)/);
      if (filenameMatch) {
        extractedDate = filenameMatch[1];
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
      // Replace existing null/Unknown author
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

console.log('Extracting metadata (v2)...\n');
walkDir(docsDir);

console.log(`\n=== DONE ===`);
console.log(`Updated: ${updated}`);
console.log(`Skipped: ${skipped}`);
