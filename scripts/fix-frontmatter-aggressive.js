const fs = require('fs');
const path = require('path');

const DOCS_DIR = path.join(__dirname, '../docs');

// Fix malformed frontmatter aggressively
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

  //  Check if frontmatter looks malformed
  const hasMixedQuotes = (frontmatterRaw.match(/['"]/) &&
                          (frontmatterRaw.includes(`"'`) || frontmatterRaw.includes(`'"`)));
  const hasUnclosedQuotes = /^[^:]+:\s*["'][^"'\n]*["'][^"'\n]+/m.test(frontmatterRaw);

  if (!hasMixedQuotes && !hasUnclosedQuotes) {
    return { fixed: false, reason: 'Looks OK' };
  }

  // Parse frontmatter line by line and fix issues
  const lines = frontmatterRaw.split('\n');
  const metadata = {};

  for (let line of lines) {
    line = line.trim();
    if (!line || !line.includes(':')) continue;

    const colonIndex = line.indexOf(':');
    const key = line.substring(0, colonIndex).trim();
    let value = line.substring(colonIndex + 1).trim();

    // Check for multiple key:value pairs on same line
    // Example: date: "2015' source_url: https://...
    const extraColonMatch = value.match(/^["']([^"']+)["']\s+(\w+):\s*(.+)$/);
    if (extraColonMatch) {
      // Split into two entries
      metadata[key] = extraColonMatch[1];
      metadata[extraColonMatch[2]] = extraColonMatch[3];
      continue;
    }

    // Remove mismatched/unclosed quotes
    value = value.replace(/^["']+/, '').replace(/["']+$/, '');

    metadata[key] = value;
  }

  // Rebuild clean frontmatter
  let newFrontmatter = '---\n';
  for (const [key, value] of Object.entries(metadata)) {
    // Escape double quotes in value
    const escapedValue = String(value).replace(/"/g, '\\"');

    // Quote the value if it contains special characters
    if (/[:\[\]{}#&*!|>'"@`]/.test(value) || /\s/.test(value)) {
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

  console.log('Aggressively fixing malformed frontmatter...\n');
  walkDir(DOCS_DIR);

  console.log('\n=== FIX COMPLETE ===');
  console.log(`Fixed: ${fixed}`);
  console.log(`Skipped (looks OK): ${skipped}`);
  console.log(`Errors: ${errors}`);
}

processDocuments();
