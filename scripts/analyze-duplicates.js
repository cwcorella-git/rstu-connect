const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DOCS_DIR = path.join(__dirname, '../docs');

// Calculate MD5 hash of file content
function getFileHash(filepath) {
  const content = fs.readFileSync(filepath, 'utf8');
  return crypto.createHash('md5').update(content).digest('hex');
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
        const category = relativePath.split(path.sep)[0];

        try {
          const hash = getFileHash(fullPath);
          const size = fs.statSync(fullPath).size;

          files.push({
            path: relativePath,
            fullPath,
            filename: entry.name,
            category,
            hash,
            size
          });
        } catch (err) {
          console.error(`Error reading ${fullPath}:`, err.message);
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

// Find duplicates by filename
function findDuplicatesByFilename(files) {
  const nameMap = {};

  for (const file of files) {
    if (!nameMap[file.filename]) {
      nameMap[file.filename] = [];
    }
    nameMap[file.filename].push(file);
  }

  return Object.values(nameMap).filter(group => group.length > 1);
}

// Check if document has proper markdown formatting
function checkFormatting(filepath) {
  const content = fs.readFileSync(filepath, 'utf8');
  const lines = content.split('\n');

  // Check for YAML frontmatter
  const hasFrontmatter = content.startsWith('---');

  // Count markdown elements
  const hasHeaders = lines.some(line => line.match(/^#{1,6}\s/));
  const hasLists = lines.some(line => line.match(/^[-*+]\s/) || line.match(/^\d+\.\s/));
  const hasBold = content.includes('**') || content.includes('__');
  const hasItalic = content.includes('*') || content.includes('_');
  const hasLinks = content.includes('[') && content.includes('](');

  const markdownScore = [hasHeaders, hasLists, hasBold, hasItalic, hasLinks].filter(Boolean).length;

  return {
    hasFrontmatter,
    hasHeaders,
    hasLists,
    hasBold,
    hasItalic,
    hasLinks,
    markdownScore,
    isPlainText: markdownScore === 0 && !hasFrontmatter
  };
}

// Main analysis
console.log('Scanning documents...\n');
const files = scanDocuments();

console.log(`Total documents: ${files.length}\n`);

// Analyze duplicates by content
console.log('=== DUPLICATE CONTENT (Identical Files) ===\n');
const contentDupes = findDuplicatesByContent(files);
let totalContentDupes = 0;

contentDupes.forEach(group => {
  totalContentDupes += group.length - 1; // Keep one, remove others
  console.log(`\n${group[0].filename} (${group.length} copies, ${group[0].size} bytes):`);
  group.forEach(file => {
    console.log(`  - ${file.path}`);
  });
});

console.log(`\n\nTotal duplicate files to remove: ${totalContentDupes}\n`);

// Analyze duplicates by filename (different content)
console.log('\n=== DUPLICATE FILENAMES (Different Content) ===\n');
const filenameDupes = findDuplicatesByFilename(files).filter(group => {
  // Filter out groups where all files are identical
  const hashes = new Set(group.map(f => f.hash));
  return hashes.size > 1;
});

filenameDupes.forEach(group => {
  console.log(`\n${group[0].filename} (${group.length} versions):`);
  group.forEach(file => {
    console.log(`  - ${file.path} (${file.size} bytes, hash: ${file.hash.substring(0, 8)})`);
  });
});

console.log(`\n\nDuplicate filename groups with different content: ${filenameDupes.length}\n`);

// Check for plain text documents
console.log('\n=== PLAIN TEXT DOCUMENTS (No Markdown Formatting) ===\n');
const plainTextDocs = [];

files.slice(0, 100).forEach(file => { // Sample first 100 to avoid long processing
  const formatting = checkFormatting(file.fullPath);
  if (formatting.isPlainText) {
    plainTextDocs.push({ ...file, formatting });
  }
});

plainTextDocs.forEach(doc => {
  console.log(`${doc.path} (${doc.size} bytes)`);
});

console.log(`\n\nPlain text documents found (in sample of 100): ${plainTextDocs.length}\n`);

// Summary
console.log('\n=== SUMMARY ===');
console.log(`Total documents: ${files.length}`);
console.log(`Exact duplicates (can be removed): ${totalContentDupes}`);
console.log(`After cleanup: ${files.length - totalContentDupes} documents`);
console.log(`Duplicate filenames with different content: ${filenameDupes.length} groups`);
console.log(`Plain text documents (sample): ${plainTextDocs.length}`);
