const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const DOCS_DIR = path.join(__dirname, '../docs');

// Fix malformed frontmatter
function fixFrontmatter(filepath) {
  const content = fs.readFileSync(filepath, 'utf8');

  if (!content.trim().startsWith('---')) {
    return { fixed: false, reason: 'No frontmatter' };
  }

  // Find frontmatter block
  const secondDash = content.indexOf('---', 3);
  if (secondDash === -1) {
    return { fixed: false, reason: 'Unclosed frontmatter block' };
  }

  const frontmatterRaw = content.substring(3, secondDash).trim();
  const body = content.substring(secondDash + 3).trim();

  // Try to parse as YAML
  try {
    const parsed = yaml.load(frontmatterRaw);
    // If it parses successfully, it's fine
    return { fixed: false, reason: 'Already valid YAML' };
  } catch (err) {
    // YAML parsing failed - try to fix it
  }

  // Extract key-value pairs manually
  const lines = frontmatterRaw.split('\n');
  const metadata = {};

  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;

    const key = line.substring(0, colonIndex).trim();
    let value = line.substring(colonIndex + 1).trim();

    // Remove surrounding quotes if they exist
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    // Remove any stray quotes
    value = value.replace(/^["']+/, '').replace(/["']+$/, '');

    metadata[key] = value;
  }

  // Rebuild valid YAML frontmatter
  let newFrontmatter = '---\n';
  for (const [key, value] of Object.entries(metadata)) {
    // Escape quotes in value
    const escapedValue = value.replace(/"/g, '\\"');

    // Always quote string values to be safe
    if (typeof value === 'string') {
      newFrontmatter += `${key}: "${escapedValue}"\n`;
    } else {
      newFrontmatter += `${key}: ${value}\n`;
    }
  }
  newFrontmatter += '---\n\n';

  const newContent = newFrontmatter + body;

  fs.writeFileSync(filepath, newContent, 'utf8');
  return { fixed: true, metadata };
}

// Scan and fix all documents
function processDocuments() {
  let fixed = 0;
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
          const result = fixFrontmatter(fullPath);
          if (result.fixed) {
            const relativePath = path.relative(DOCS_DIR, fullPath);
            console.log(`✓ ${relativePath}`);
            fixed++;
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

  console.log('Fixing malformed frontmatter...\n');
  walkDir(DOCS_DIR);

  console.log('\n=== FIX COMPLETE ===');
  console.log(`Fixed: ${fixed}`);
  console.log(`Skipped (already valid): ${skipped}`);
  console.log(`Errors: ${errors}`);
}

processDocuments();
