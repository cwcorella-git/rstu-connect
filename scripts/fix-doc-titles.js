#!/usr/bin/env node
/**
 * Fix obvious title issues in markdown frontmatter
 */

const fs = require('fs');
const path = require('path');

const docsDir = path.join(__dirname, '../docs');

let fixed = 0;
let skipped = 0;

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

  // Check if file has frontmatter
  if (!content.startsWith('---')) {
    return;
  }

  const endIdx = content.indexOf('---', 3);
  if (endIdx === -1) return;

  const frontmatter = content.substring(3, endIdx);
  const body = content.substring(endIdx + 3);

  // Parse frontmatter
  const lines = frontmatter.split('\n');
  let titleLine = lines.find(l => l.startsWith('title:'));
  if (!titleLine) return;

  // Extract title value
  let title = titleLine.substring(6).trim();
  // Remove quotes if present
  if ((title.startsWith('"') && title.endsWith('"')) ||
      (title.startsWith("'") && title.endsWith("'"))) {
    title = title.slice(1, -1);
  }

  let newTitle = title;
  let changed = false;

  // Fix ## prefix
  if (newTitle.startsWith('## ')) {
    newTitle = newTitle.substring(3).trim();
    changed = true;
  } else if (newTitle.startsWith('# ')) {
    newTitle = newTitle.substring(2).trim();
    changed = true;
  }

  // Fix — or - prefix (but not if it's part of the title like "—Geo Maher")
  if (/^[—–\-]\s*/.test(newTitle) && !newTitle.includes(':')) {
    newTitle = newTitle.replace(/^[—–\-]\s*/, '').trim();
    changed = true;
  }

  // Fix en.wikipedia.org or en.m.wikipedia.org titles - try to extract from filename
  if (newTitle === 'en.wikipedia.org' || newTitle === 'en.m.wikipedia.org') {
    const basename = path.basename(filepath, '.md');
    // Try to make a better title from filename
    newTitle = basename
      .replace(/^Article_/i, '')
      .replace(/[-_]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    // Capitalize first letter of each word
    newTitle = newTitle.replace(/\b\w/g, c => c.toUpperCase());
    changed = true;
  }

  // Fix titles that are just URLs
  if (newTitle.startsWith('http://') || newTitle.startsWith('https://') || newTitle.startsWith('blog.')) {
    const basename = path.basename(filepath, '.md');
    newTitle = basename
      .replace(/^Article_/i, '')
      .replace(/[-_]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    newTitle = newTitle.replace(/\b\w/g, c => c.toUpperCase());
    changed = true;
  }

  // Capitalize first letter if lowercase (but not if it's a known lowercase start like "iPhone")
  if (/^[a-z]/.test(newTitle) && !/^(i[A-Z]|e[A-Z])/.test(newTitle)) {
    newTitle = newTitle.charAt(0).toUpperCase() + newTitle.slice(1);
    changed = true;
  }

  if (changed && newTitle !== title && newTitle.length > 3) {
    // Update frontmatter
    const newLines = lines.map(l => {
      if (l.startsWith('title:')) {
        // Escape quotes in title
        const escapedTitle = newTitle.replace(/"/g, '\\"');
        return `title: "${escapedTitle}"`;
      }
      return l;
    });

    const newFrontmatter = newLines.join('\n');
    const newContent = '---' + newFrontmatter + '---' + body;

    fs.writeFileSync(filepath, newContent, 'utf8');
    console.log(`Fixed: "${title}" -> "${newTitle}"`);
    console.log(`  File: ${path.relative(docsDir, filepath)}`);
    fixed++;
  } else {
    skipped++;
  }
}

console.log('Scanning docs directory...\n');
walkDir(docsDir);

console.log(`\n=== DONE ===`);
console.log(`Fixed: ${fixed}`);
console.log(`Skipped: ${skipped}`);
