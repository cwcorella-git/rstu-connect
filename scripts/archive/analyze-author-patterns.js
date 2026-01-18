#!/usr/bin/env node
/**
 * Analyze author patterns in documents without authors
 */

const fs = require('fs');
const path = require('path');

const docsDir = path.join(__dirname, '../docs');

const samples = [];

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

  // Skip if already has a valid author
  const authorMatch = fm.match(/^author:\s*(.+)$/m);
  if (authorMatch) {
    const authorVal = authorMatch[1].trim().replace(/['"]/g, '');
    if (authorVal && authorVal !== 'null' && authorVal.toLowerCase() !== 'unknown' && authorVal.length > 3) {
      return;
    }
  }

  // Get first 30 lines of body
  const body = content.substring(endIdx + 3);
  const first30 = body.split('\n').slice(0, 30).join('\n');

  samples.push({
    path: path.relative(docsDir, filepath),
    preview: first30.slice(0, 500)
  });
}

walkDir(docsDir);

console.log(`Found ${samples.length} documents without authors\n`);
console.log('Sample previews:\n');

// Show random 10 samples
const randomSamples = samples.sort(() => Math.random() - 0.5).slice(0, 10);
for (const s of randomSamples) {
  console.log('='.repeat(60));
  console.log('File:', s.path);
  console.log('-'.repeat(60));
  console.log(s.preview);
  console.log('\n');
}
