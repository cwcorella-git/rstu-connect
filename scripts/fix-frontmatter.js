const fs = require('fs');
const path = require('path');

const DOCS_DIR = path.join(__dirname, '../docs');

// Fix malformed frontmatter in markdown files
function fixFrontmatter(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');

  // Check if file has frontmatter
  if (!content.startsWith('---')) {
    return false;
  }

  const lines = content.split('\n');
  if (lines.length < 2) return false;

  // Find the closing ---
  let closingIndex = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      closingIndex = i;
      break;
    }
  }

  if (closingIndex === -1) return false;

  // Get the frontmatter content
  const frontmatterLine = lines.slice(1, closingIndex).join('\n').trim();

  // Check if it's all on one line (malformed)
  // Example: "author: Charles H date: '1880' title: An Appeal to the Young"
  if (frontmatterLine.includes(' date:') ||
      frontmatterLine.includes(' title:') ||
      frontmatterLine.includes(' author:') ||
      frontmatterLine.includes(' slug:')) {

    console.log(`Fixing: ${path.basename(filePath)}`);

    // Parse the inline frontmatter
    const frontmatter = {};

    // Split by known keys
    const parts = frontmatterLine.split(/\s+(?=(?:author|date|title|slug|reconversion_status)[:=])/);

    for (const part of parts) {
      const match = part.match(/^(\w+):\s*(.+)$/);
      if (match) {
        const [, key, value] = match;
        frontmatter[key] = value.replace(/^['"]|['"]$/g, ''); // Remove quotes
      }
    }

    // Reconstruct proper YAML
    let newFrontmatter = '---\n';
    for (const [key, value] of Object.entries(frontmatter)) {
      // Quote values if they contain special characters or spaces
      const needsQuotes = /[:\[\]{}#&*!|>'"@`]/.test(value) || /\s/.test(value);
      newFrontmatter += `${key}: ${needsQuotes ? `"${value}"` : value}\n`;
    }
    newFrontmatter += '---\n';

    // Reconstruct file
    const restOfContent = lines.slice(closingIndex + 1).join('\n');
    const newContent = newFrontmatter + restOfContent;

    fs.writeFileSync(filePath, newContent, 'utf8');
    return true;
  }

  return false;
}

// Recursively process all markdown files
function processDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let fixed = 0;

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      fixed += processDirectory(fullPath);
    } else if (entry.name.endsWith('.md')) {
      if (fixFrontmatter(fullPath)) {
        fixed++;
      }
    }
  }

  return fixed;
}

console.log('Fixing malformed YAML frontmatter...\n');
const fixed = processDirectory(DOCS_DIR);
console.log(`\n✅ Fixed ${fixed} files with malformed frontmatter`);
