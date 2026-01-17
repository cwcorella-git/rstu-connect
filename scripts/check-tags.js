#!/usr/bin/env node
/**
 * Check for documents missing tags
 */

const fs = require('fs');
const path = require('path');

const docsDir = path.join(__dirname, '../docs');

let noTags = [];
let emptyTags = [];
let withTags = [];
let total = 0;

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
  const content = fs.readFileSync(filepath, 'utf8');

  if (!content.startsWith('---')) return;

  const endIdx = content.indexOf('---', 3);
  if (endIdx === -1) return;

  const fm = content.substring(3, endIdx);
  total++;

  const relPath = path.relative(docsDir, filepath);

  if (!fm.includes('tags:')) {
    noTags.push(relPath);
    return;
  }

  // Check for actual tag entries (lines like "  - tagname" after tags:)
  const tagsMatch = fm.match(/tags:[\s\S]*?(?=\n[a-z]|\n---|$)/i);
  if (tagsMatch) {
    const tagsSection = tagsMatch[0];
    const tagEntries = tagsSection.match(/^\s+-\s+.+$/gm);
    if (tagEntries && tagEntries.length > 0) {
      withTags.push({ path: relPath, count: tagEntries.length });
      return;
    }
  }

  emptyTags.push(relPath);
}

walkDir(docsDir);

console.log('=== TAG COVERAGE STATS ===');
console.log('Total docs:', total);
console.log('With tags:', withTags.length, `(${Math.round(withTags.length/total*100)}%)`);
console.log('Empty tags field:', emptyTags.length);
console.log('Missing tags field:', noTags.length);

console.log('\n=== Samples without tags ===');
noTags.slice(0, 10).forEach(p => console.log('  ' + p));
if (noTags.length > 10) console.log('  ... and', noTags.length - 10, 'more');

console.log('\n=== Samples with empty tags ===');
emptyTags.slice(0, 10).forEach(p => console.log('  ' + p));
if (emptyTags.length > 10) console.log('  ... and', emptyTags.length - 10, 'more');
