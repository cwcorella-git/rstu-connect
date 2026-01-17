#!/usr/bin/env node
/**
 * Extract more dates from filename, title, and content patterns
 */

const fs = require('fs');
const path = require('path');

const docsDir = path.join(__dirname, '../docs');

let updated = 0;
let skipped = 0;

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

function extractYear(text) {
  // Look for 4-digit years between 1850 and 2026
  const match = text.match(/\b(18[5-9]\d|19\d{2}|20[0-2]\d)\b/);
  if (match) {
    const year = parseInt(match[1]);
    if (year >= 1850 && year <= 2026) {
      return year;
    }
  }
  return null;
}

function processFile(filepath, filename) {
  let content = fs.readFileSync(filepath, 'utf8');

  if (!content.startsWith('---')) return;

  const endIdx = content.indexOf('---', 3);
  if (endIdx === -1) return;

  const frontmatter = content.substring(3, endIdx);
  const body = content.substring(endIdx + 3);

  // Check if already has valid date
  const dateMatch = frontmatter.match(/^date:\s*["']?(.+?)["']?\s*$/m);
  if (dateMatch) {
    const dateVal = dateMatch[1].trim();
    if (dateVal && /\d{4}/.test(dateVal)) {
      skipped++;
      return;
    }
  }

  const titleMatch = frontmatter.match(/^title:\s*["']?(.+?)["']?\s*$/m);
  const title = titleMatch ? titleMatch[1] : '';

  let year = null;

  // 1. Try filename
  year = extractYear(filename);

  // 2. Try title
  if (!year) {
    year = extractYear(title);
  }

  // 3. Try content (first 150 lines for better coverage)
  if (!year) {
    const searchArea = body.split('\n').slice(0, 150).join('\n');
    year = extractYear(searchArea);
  }

  if (!year) {
    skipped++;
    return;
  }

  // Update frontmatter
  const lines = frontmatter.split('\n');
  const existingDateIdx = lines.findIndex(l => l.startsWith('date:'));

  if (existingDateIdx !== -1) {
    lines[existingDateIdx] = `date: ${year}`;
  } else {
    const authorIdx = lines.findIndex(l => l.startsWith('author:'));
    const titleIdx = lines.findIndex(l => l.startsWith('title:'));
    const insertIdx = authorIdx !== -1 ? authorIdx + 1 : (titleIdx !== -1 ? titleIdx + 1 : 1);
    lines.splice(insertIdx, 0, `date: ${year}`);
  }

  const newFrontmatter = lines.join('\n');
  const newContent = '---' + newFrontmatter + '---' + body;

  fs.writeFileSync(filepath, newContent, 'utf8');

  console.log(`Updated: ${path.relative(docsDir, filepath)} -> ${year}`);
  updated++;
}

console.log('Extracting more dates...\n');
walkDir(docsDir);

console.log(`\n=== DONE ===`);
console.log(`Updated: ${updated}`);
console.log(`Skipped: ${skipped}`);
