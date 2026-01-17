#!/usr/bin/env node
/**
 * Aggressive date extraction - any year mention in content
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

  // Check if already has date
  const dateMatch = frontmatter.match(/^date:\s*["']?(.+?)["']?\s*$/m);
  if (dateMatch && /\d{4}/.test(dateMatch[1])) {
    skipped++;
    return;
  }

  // Look for ANY year in content (broader search)
  const searchArea = body.split('\n').slice(0, 200).join('\n');

  let year = null;

  // 1. Copyright year
  const copyrightMatch = searchArea.match(/(?:©|copyright)\s*(\d{4})/i);
  if (copyrightMatch) {
    const y = parseInt(copyrightMatch[1]);
    if (y >= 1850 && y <= 2026) year = y;
  }

  // 2. Published/Written year
  if (!year) {
    const pubMatch = searchArea.match(/(?:published|written|printed)\s+(?:in\s+)?(\d{4})/i);
    if (pubMatch) {
      const y = parseInt(pubMatch[1]);
      if (y >= 1850 && y <= 2026) year = y;
    }
  }

  // 3. Year in parentheses
  if (!year) {
    const parenMatch = searchArea.match(/\((\d{4})\)/);
    if (parenMatch) {
      const y = parseInt(parenMatch[1]);
      if (y >= 1850 && y <= 2026) year = y;
    }
  }

  // 4. Year in brackets
  if (!year) {
    const bracketMatch = searchArea.match(/\[(\d{4})\]/);
    if (bracketMatch) {
      const y = parseInt(bracketMatch[1]);
      if (y >= 1850 && y <= 2026) year = y;
    }
  }

  // 5. First standalone year mention (1900-2026)
  if (!year) {
    const yearMatch = searchArea.match(/\b(19\d{2}|20[0-2]\d)\b/);
    if (yearMatch) {
      const y = parseInt(yearMatch[1]);
      if (y >= 1900 && y <= 2026) year = y;
    }
  }

  if (!year) {
    skipped++;
    return;
  }

  // Update frontmatter
  const lines = frontmatter.split('\n');
  const existingDateIdx = lines.findIndex(l => l.startsWith('date:'));

  if (existingDateIdx !== -1) {
    lines[existingDateIdx] = 'date: ' + year;
  } else {
    const authorIdx = lines.findIndex(l => l.startsWith('author:'));
    const titleIdx = lines.findIndex(l => l.startsWith('title:'));
    const insertIdx = authorIdx !== -1 ? authorIdx + 1 : (titleIdx !== -1 ? titleIdx + 1 : 1);
    lines.splice(insertIdx, 0, 'date: ' + year);
  }

  const newFrontmatter = lines.join('\n');
  const newContent = '---' + newFrontmatter + '---' + body;

  fs.writeFileSync(filepath, newContent, 'utf8');

  console.log('Updated: ' + path.relative(docsDir, filepath) + ' -> ' + year);
  updated++;
}

console.log('Aggressive date extraction...\n');
walkDir(docsDir);

console.log('\n=== DONE ===');
console.log('Updated: ' + updated);
console.log('Skipped: ' + skipped);
