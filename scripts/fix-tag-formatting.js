#!/usr/bin/env node
/**
 * Fix malformed tag formatting in frontmatter
 * Remove orphan tag lines (- tag without proper tags: parent)
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

  if (!content.startsWith('---')) return;

  const endIdx = content.indexOf('---', 3);
  if (endIdx === -1) return;

  const frontmatter = content.substring(3, endIdx);
  const body = content.substring(endIdx + 3);

  // Check for orphan tag lines (lines starting with "- " that aren't after tags:)
  const lines = frontmatter.split('\n');
  const newLines = [];
  let inTags = false;
  let tagsCollected = [];
  let needsFix = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim().startsWith('tags:')) {
      inTags = true;
      newLines.push(line);
      continue;
    }

    if (inTags) {
      // Check if this is a tag entry (indented with -)
      if (/^\s+-\s+/.test(line)) {
        const tag = line.replace(/^\s+-\s+/, '').trim();
        if (tag && !tagsCollected.includes(tag)) {
          tagsCollected.push(tag);
        }
        continue; // Don't add yet, we'll consolidate
      } else if (line.trim().startsWith('-') && !line.trim().startsWith('---')) {
        // Orphan tag line (not properly indented)
        const tag = line.replace(/^-\s*/, '').trim();
        if (tag && !tagsCollected.includes(tag)) {
          tagsCollected.push(tag);
          needsFix = true;
        }
        continue;
      } else {
        // End of tags section - write collected tags
        inTags = false;
        for (const tag of tagsCollected) {
          newLines.push(`  - ${tag}`);
        }
        tagsCollected = [];
        newLines.push(line);
      }
    } else {
      // Check for orphan lines at top level
      if (line.trim().startsWith('-') && !line.trim().startsWith('---') && !/^\s+-/.test(line)) {
        needsFix = true;
        continue; // Skip orphan tag lines
      }
      newLines.push(line);
    }
  }

  // Handle case where tags section was at the end
  if (inTags && tagsCollected.length > 0) {
    for (const tag of tagsCollected) {
      newLines.push(`  - ${tag}`);
    }
  }

  if (!needsFix) {
    skipped++;
    return;
  }

  const newFrontmatter = newLines.join('\n');
  const newContent = '---' + newFrontmatter + '---' + body;

  fs.writeFileSync(filepath, newContent, 'utf8');
  console.log(`Fixed: ${path.relative(docsDir, filepath)}`);
  fixed++;
}

console.log('Fixing tag formatting...\n');
walkDir(docsDir);

console.log(`\n=== DONE ===`);
console.log(`Fixed: ${fixed}`);
console.log(`Skipped: ${skipped}`);
