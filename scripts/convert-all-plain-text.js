const fs = require('fs');
const path = require('path');

const DOCS_DIR = path.join(__dirname, '../docs');

// Extract title from filename or first line
function extractTitle(content, filename) {
  // Clean up filename
  let title = filename
    .replace(/\.md$/, '')
    .replace(/^Article_/, '')
    .replace(/^01_Political_Theory_Article_/, '')
    .replace(/^01_Political_Theory_Articles_/, '')
    .replace(/^05_Architecture_Urban_Articles_/, '')
    .replace(/^08_Economics_Social_Article_/, '')
    .replace(/^11_Art_Culture_Article(s?)_/, '')
    .replace(/^13_Fiction_Books_Article_/, '')
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Capitalize words
  title = title.split(' ').map(word => {
    if (word.length === 0) return '';
    if (word.toLowerCase() === 'and' || word.toLowerCase() === 'the' ||
        word.toLowerCase() === 'of' || word.toLowerCase() === 'in' ||
        word.toLowerCase() === 'a' || word.toLowerCase() === 'an') {
      return word.toLowerCase();
    }
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join(' ');

  // Capitalize first word
  if (title.length > 0) {
    title = title.charAt(0).toUpperCase() + title.slice(1);
  }

  return title || 'Untitled Document';
}

// Convert document to proper markdown
function convertDocument(filepath) {
  const content = fs.readFileSync(filepath, 'utf8');
  const filename = path.basename(filepath);

  // Check if already has frontmatter
  if (content.trim().startsWith('---')) {
    return { converted: false, reason: 'Already has frontmatter' };
  }

  const title = extractTitle(content, filename);
  const year = new Date().getFullYear();

  // Build proper markdown
  const newContent = `---
title: "${title}"
date: ${year}
---

# ${title}

${content.trim()}
`;

  fs.writeFileSync(filepath, newContent, 'utf8');
  return { converted: true, title };
}

// Scan and convert all documents
function processDocuments() {
  let converted = 0;
  let skipped = 0;
  let errors = 0;

  function walkDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        walkDir(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.md') && entry.name !== 'README.md') {
        try {
          const result = convertDocument(fullPath);
          if (result.converted) {
            const relativePath = path.relative(DOCS_DIR, fullPath);
            console.log(`✓ ${relativePath}`);
            converted++;
          } else {
            skipped++;
          }
        } catch (err) {
          const relativePath = path.relative(DOCS_DIR, fullPath);
          console.error(`✗ ${relativePath}: ${err.message}`);
          errors++;
        }
      }
    }
  }

  console.log('Converting all plain text documents...\n');
  walkDir(DOCS_DIR);

  console.log('\n=== CONVERSION COMPLETE ===');
  console.log(`Converted: ${converted}`);
  console.log(`Skipped (already formatted): ${skipped}`);
  console.log(`Errors: ${errors}`);
}

processDocuments();
