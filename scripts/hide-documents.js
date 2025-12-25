const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const DOCS_DIR = path.join(__dirname, '../docs');

// Documents/directories to hide
const HIDE_PATTERNS = {
  // Hide entire directories
  directories: ['legislation', 'notes'],
  // Hide specific files by pattern (case-insensitive)
  patterns: [
    'meeting',
    'agenda',
    'minutes',
    'bylaws',
    'google docs'
  ]
};

let hidden = 0;

function processFile(fullPath) {
  const content = fs.readFileSync(fullPath, 'utf8');
  let parsed;

  try {
    parsed = matter(content);
  } catch (e) {
    return;
  }

  // Skip if already hidden
  if (parsed.data.hidden === true) {
    return;
  }

  // Add hidden: true
  parsed.data.hidden = true;
  const newContent = matter.stringify(parsed.content, parsed.data);
  fs.writeFileSync(fullPath, newContent);
  hidden++;
  console.log(`Hidden: ${path.relative(DOCS_DIR, fullPath)}`);
}

function processDir(dir) {
  for (const item of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory() && !item.startsWith('.')) {
      // Check if entire directory should be hidden
      if (HIDE_PATTERNS.directories.includes(item.toLowerCase())) {
        // Hide all files in this directory
        hideDirectory(fullPath);
      } else {
        // Recurse into directory
        processDir(fullPath);
      }
    } else if (item.endsWith('.md')) {
      // Check if file matches any hide pattern
      const lower = item.toLowerCase();
      for (const pattern of HIDE_PATTERNS.patterns) {
        if (lower.includes(pattern)) {
          processFile(fullPath);
          break;
        }
      }
    }
  }
}

function hideDirectory(dir) {
  for (const item of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      hideDirectory(fullPath);
    } else if (item.endsWith('.md')) {
      processFile(fullPath);
    }
  }
}

console.log('=== Hiding Meeting Notes and Legislative Documents ===\n');
processDir(DOCS_DIR);
console.log(`\nHidden ${hidden} documents`);
console.log('Run: node scripts/generate-reading-manifest.js to update manifest');
