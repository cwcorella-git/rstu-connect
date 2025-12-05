const fs = require('fs');
const path = require('path');

const DOCS_DIR = path.join(__dirname, '../docs');

// Extract title from first line or filename
function extractTitle(content, filename) {
  const lines = content.trim().split('\n');
  const firstLine = lines[0].trim();

  // If first line looks like a title (short, no period at end)
  if (firstLine.length < 100 && !firstLine.endsWith('.')) {
    return firstLine.replace(/^#+\s*/, ''); // Remove any existing # markers
  }

  // Use filename as title
  return filename
    .replace(/\.md$/, '')
    .replace(/^Article_/, '')
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Check if document needs conversion
function needsConversion(content) {
  // Already has frontmatter
  if (content.trim().startsWith('---')) {
    return false;
  }

  // Count markdown elements
  const lines = content.split('\n');
  const hasHeaders = lines.some(line => line.match(/^#{1,6}\s/));
  const hasFrontmatter = content.startsWith('---');

  // Needs conversion if it has no frontmatter and no headers
  return !hasFrontmatter && !hasHeaders;
}

// Convert plain text to markdown
function convertToMarkdown(content, filename) {
  if (!needsConversion(content)) {
    return { converted: false, content };
  }

  const lines = content.trim().split('\n');
  const title = extractTitle(content, filename);

  // Generate YAML frontmatter
  const frontmatter = `---
title: "${title}"
date: ${new Date().getFullYear()}
---

# ${title}

`;

  // Remove first line if it was used as title
  const firstLine = lines[0].trim();
  let bodyContent = content.trim();

  if (firstLine.length < 100 && !firstLine.endsWith('.')) {
    // First line was the title, remove it
    bodyContent = lines.slice(1).join('\n').trim();
  }

  return {
    converted: true,
    content: frontmatter + bodyContent
  };
}

// Scan and convert documents
function processDocuments() {
  let totalProcessed = 0;
  let converted = 0;
  let errors = 0;

  function walkDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        walkDir(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.md') && entry.name !== 'README.md') {
        totalProcessed++;

        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          const result = convertToMarkdown(content, entry.name);

          if (result.converted) {
            const relativePath = path.relative(DOCS_DIR, fullPath);
            console.log(`Converting: ${relativePath}`);

            // Write converted content
            fs.writeFileSync(fullPath, result.content, 'utf8');
            converted++;
          }
        } catch (err) {
          console.error(`Error processing ${entry.name}:`, err.message);
          errors++;
        }
      }
    }
  }

  console.log('Scanning for plain text documents...\n');
  walkDir(DOCS_DIR);

  console.log('\n=== CONVERSION SUMMARY ===');
  console.log(`Total documents processed: ${totalProcessed}`);
  console.log(`Converted to markdown: ${converted}`);
  console.log(`Errors: ${errors}`);
  console.log(`Already formatted: ${totalProcessed - converted - errors}`);
}

processDocuments();
