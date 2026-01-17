#!/usr/bin/env node
/**
 * Check for documents missing tags
 */

const fs = require('fs');
const path = require('path');

const docsDir = path.join(__dirname, '../docs');

let noTags = [];
let emptyTags = [];
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
  } else if (/tags:\s*\[\]|tags:\s*$/m.test(fm)) {
    emptyTags.push(relPath);
  }
}

walkDir(docsDir);

console.log('Total docs:', total);
console.log('Missing tags field:', noTags.length);
console.log('Empty tags:', emptyTags.length);
console.log('\n=== Samples without tags ===');
noTags.slice(0, 20).forEach(p => console.log('  ' + p));
if (noTags.length > 20) console.log('  ... and', noTags.length - 20, 'more');
