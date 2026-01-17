#!/usr/bin/env node
/**
 * Extract tags from **Tags:** line in document content
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

  // Check if frontmatter already has non-empty tags
  const tagsMatch = frontmatter.match(/^tags:\s*\n((?:\s+-\s+.+\n?)+)/m);
  if (tagsMatch) {
    // Already has tags, skip
    skipped++;
    return;
  }

  // Look for **Tags:** in body
  const tagsLineMatch = body.match(/^\*\*Tags:\*\*\s*(.+)$/m);
  if (!tagsLineMatch) {
    skipped++;
    return;
  }

  // Parse tags from the line
  const tagsLine = tagsLineMatch[1].trim();
  if (!tagsLine) {
    skipped++;
    return;
  }

  // Split by comma and clean up
  const tags = tagsLine.split(',')
    .map(t => t.trim())
    .filter(t => t.length > 0 && t.length < 60) // Reasonable tag length
    .map(t => t.toLowerCase().replace(/['"]/g, '').replace(/\s+/g, '-')) // Normalize
    .filter(t => !t.includes('(') && !t.includes(')')) // Skip tags with parens
    .slice(0, 15); // Limit to 15 tags

  if (tags.length === 0) {
    skipped++;
    return;
  }

  // Build tags YAML
  const tagsYaml = 'tags:\n' + tags.map(t => `  - ${t}`).join('\n');

  // Update frontmatter
  const lines = frontmatter.split('\n');
  const existingTagsIdx = lines.findIndex(l => l.startsWith('tags:'));

  if (existingTagsIdx !== -1) {
    // Replace empty tags with new tags
    lines[existingTagsIdx] = tagsYaml;
  } else {
    // Add tags after category if present, or at end
    const categoryIdx = lines.findIndex(l => l.startsWith('category:'));
    const insertIdx = categoryIdx !== -1 ? categoryIdx + 1 : lines.length - 1;
    lines.splice(insertIdx, 0, tagsYaml);
  }

  const newFrontmatter = lines.join('\n');
  const newContent = '---' + newFrontmatter + '---' + body;

  fs.writeFileSync(filepath, newContent, 'utf8');

  console.log(`Updated: ${path.relative(docsDir, filepath)} -> ${tags.length} tags`);
  updated++;
}

console.log('Extracting tags from document content...\n');
walkDir(docsDir);

console.log(`\n=== DONE ===`);
console.log(`Updated: ${updated}`);
console.log(`Skipped: ${skipped}`);
