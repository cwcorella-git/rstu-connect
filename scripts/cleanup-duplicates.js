const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DOCS_DIR = path.join(__dirname, '../docs');

// Calculate MD5 hash of file content
function getFileHash(filepath) {
  try {
    const content = fs.readFileSync(filepath, 'utf8');
    return crypto.createHash('md5').update(content).digest('hex');
  } catch (err) {
    console.error(`Error reading ${filepath}:`, err.message);
    return null;
  }
}

// Scan all markdown files
function scanDocuments() {
  const files = [];

  function walkDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        walkDir(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.md') && entry.name !== 'README.md') {
        const relativePath = path.relative(DOCS_DIR, fullPath);
        const hash = getFileHash(fullPath);

        if (hash) {
          files.push({
            path: relativePath,
            fullPath,
            filename: entry.name,
            hash
          });
        }
      }
    }
  }

  walkDir(DOCS_DIR);
  return files;
}

// Find duplicates by content hash
function findDuplicatesByContent(files) {
  const hashMap = {};

  for (const file of files) {
    if (!hashMap[file.hash]) {
      hashMap[file.hash] = [];
    }
    hashMap[file.hash].push(file);
  }

  return Object.values(hashMap).filter(group => group.length > 1);
}

// Decide which file to keep (prefer shorter paths, avoid nested docs/docs/)
function selectFileToKeep(group) {
  // Filter out files in nested docs/docs/ folder
  const nonNestedDocs = group.filter(f => !f.path.startsWith('docs/'));

  if (nonNestedDocs.length > 0) {
    // Keep the file with the shortest path
    nonNestedDocs.sort((a, b) => a.path.length - b.path.length);
    return nonNestedDocs[0];
  }

  // If all are in nested docs/, keep the shortest path
  group.sort((a, b) => a.path.length - b.path.length);
  return group[0];
}

// Main cleanup
console.log('Scanning for duplicates...\n');
const files = scanDocuments();
console.log(`Total files found: ${files.length}\n`);

const duplicateGroups = findDuplicatesByContent(files);
console.log(`Duplicate groups found: ${duplicateGroups.length}\n`);

let removedCount = 0;
let errorCount = 0;

console.log('Starting cleanup...\n');

duplicateGroups.forEach(group => {
  const keep = selectFileToKeep(group);
  const toRemove = group.filter(f => f.fullPath !== keep.fullPath);

  console.log(`\nKeeping: ${keep.path}`);

  toRemove.forEach(file => {
    console.log(`  Removing: ${file.path}`);
    try {
      fs.unlinkSync(file.fullPath);
      removedCount++;
    } catch (err) {
      console.error(`  ERROR: Could not remove ${file.path}: ${err.message}`);
      errorCount++;
    }
  });
});

// Remove nested docs/docs/ folder if it exists and is empty
const nestedDocsPath = path.join(DOCS_DIR, 'docs');
if (fs.existsSync(nestedDocsPath)) {
  console.log('\n\nChecking nested docs/docs/ folder...');

  function isEmptyDir(dir) {
    try {
      const entries = fs.readdirSync(dir);
      if (entries.length === 0) return true;

      // Check if all entries are empty directories
      for (const entry of entries) {
        const fullPath = path.join(dir, entry);
        const stat = fs.statSync(fullPath);
        if (stat.isFile()) return false;
        if (stat.isDirectory() && !isEmptyDir(fullPath)) return false;
      }
      return true;
    } catch (err) {
      return false;
    }
  }

  function removeEmptyDirs(dir) {
    const entries = fs.readdirSync(dir);

    for (const entry of entries) {
      const fullPath = path.join(dir, entry);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        removeEmptyDirs(fullPath);

        // Check if directory is now empty
        if (isEmptyDir(fullPath)) {
          console.log(`  Removing empty directory: ${path.relative(DOCS_DIR, fullPath)}`);
          fs.rmdirSync(fullPath);
        }
      }
    }
  }

  removeEmptyDirs(nestedDocsPath);

  if (isEmptyDir(nestedDocsPath)) {
    console.log(`  Removing empty nested docs/ folder`);
    fs.rmdirSync(nestedDocsPath);
  }
}

console.log('\n\n=== CLEANUP SUMMARY ===');
console.log(`Files removed: ${removedCount}`);
console.log(`Errors: ${errorCount}`);
console.log(`Remaining files: ${files.length - removedCount}`);
console.log('\nCleanup complete!');
