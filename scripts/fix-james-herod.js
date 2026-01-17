#!/usr/bin/env node
/**
 * Fix James Herod documents where author was used as title
 */

const fs = require('fs');
const path = require('path');

const docsDir = path.join(__dirname, '../docs');

// Files to fix (from manifest)
const filesToFix = [
  'Defeating Capitalists Quickly to Save the Earth.md',
  'Interview about Liberated Guardian.md',
  'Is Greed All that\'s Wrong With Capitalism_.md',
  'Majority Rule.md',
  'Making Decisions Amongst Assemblies.md',
  'Money_ An Introductory Bibliography.md',
  'The Conference on Money.md',
  'The Lucy Parsons Center.md',
  'Review_ Lebowitz, The Socialist Alternative.md',
  'A Brief Critique of Anarcho-Syndicalism.md',
  'Notes on Building a Movement for Direct Democracy.md',
  'A Great Plains Association for Anarchy_.md',
  'Breaking Out of the Cage and Destroying Our Jailers.md',
  'Abolish the Stock Market.md',
  'Seeing the Inadequacies of the Strategy Proposals of the Anarchist Communist Federation (UK).md',
];

function findFile(filename) {
  function search(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filepath = path.join(dir, file);
      const stat = fs.statSync(filepath);
      if (stat.isDirectory()) {
        const found = search(filepath);
        if (found) return found;
      } else if (file === filename) {
        return filepath;
      }
    }
    return null;
  }
  return search(docsDir);
}

function fixFile(filepath) {
  let content = fs.readFileSync(filepath, 'utf8');

  if (!content.startsWith('---')) return false;

  const endIdx = content.indexOf('---', 3);
  if (endIdx === -1) return false;

  const frontmatter = content.substring(3, endIdx);
  const body = content.substring(endIdx + 3);

  // Check if title is "James Herod"
  if (!frontmatter.includes('title: "James Herod"') &&
      !frontmatter.includes("title: 'James Herod'") &&
      !frontmatter.includes('title: James Herod')) {
    return false;
  }

  // Extract real title from body - look for ## Title pattern
  const lines = body.split('\n');
  let realTitle = null;
  let realDate = null;

  for (let i = 0; i < Math.min(lines.length, 20); i++) {
    const line = lines[i].trim();

    // Skip "## James Herod" line
    if (line === '## James Herod' || line === '# James Herod') continue;

    // Look for title (## Something)
    if (!realTitle && line.startsWith('## ') && !line.includes('James Herod')) {
      realTitle = line.replace(/^##\s*/, '').trim();
    }

    // Look for date patterns
    if (!realDate) {
      const dateMatch = line.match(/^##?\s*((?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}|\d{4})$/i);
      if (dateMatch) {
        realDate = dateMatch[1];
      }
    }
  }

  // If no title found in body, use filename
  if (!realTitle) {
    realTitle = path.basename(filepath, '.md')
      .replace(/_/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Update frontmatter
  let newFrontmatter = frontmatter
    .replace(/title:\s*["']?James Herod["']?/, `title: "${realTitle.replace(/"/g, '\\"')}"`)
    .replace(/author:\s*null/, 'author: "James Herod"');

  // Add author if not present
  if (!newFrontmatter.includes('author:')) {
    newFrontmatter = newFrontmatter.replace(
      /title:\s*"[^"]+"/,
      match => `${match}\nauthor: "James Herod"`
    );
  }

  // Add date if found and not present
  if (realDate && !newFrontmatter.includes('date:')) {
    // Extract just year if full date
    const yearMatch = realDate.match(/(\d{4})/);
    if (yearMatch) {
      newFrontmatter = newFrontmatter.replace(
        /author:\s*"[^"]+"/,
        match => `${match}\ndate: ${yearMatch[1]}`
      );
    }
  }

  const newContent = '---' + newFrontmatter + '---' + body;
  fs.writeFileSync(filepath, newContent, 'utf8');

  console.log(`Fixed: ${path.basename(filepath)}`);
  console.log(`  Title: "${realTitle}"`);
  console.log(`  Author: James Herod`);
  if (realDate) console.log(`  Date: ${realDate}`);

  return true;
}

console.log('Fixing James Herod documents...\n');

let fixed = 0;
for (const filename of filesToFix) {
  const filepath = findFile(filename);
  if (filepath) {
    if (fixFile(filepath)) {
      fixed++;
    }
  } else {
    console.log(`Not found: ${filename}`);
  }
}

console.log(`\nFixed ${fixed} documents`);
