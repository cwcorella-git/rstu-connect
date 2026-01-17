const fs = require('fs');
const path = require('path');

const docsDir = '/home/user/Projects/rstu-connect/docs';
let fixed = 0;

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
  
  let frontmatter = content.substring(3, endIdx);
  const body = content.substring(endIdx + 3);
  let changed = false;
  
  // Fix 1: Invalid escape sequences in quoted strings
  // Replace \c, \f, etc with just the letter (or remove the backslash)
  const invalidEscapes = /\\([^"'\\nrtbfuU0-9x])/g;
  if (invalidEscapes.test(frontmatter)) {
    frontmatter = frontmatter.replace(invalidEscapes, '$1');
    changed = true;
  }
  
  // Fix 2: Multiline title pattern with author in between
  // Pattern: "title: >-\nauthor: ...\n  title continuation"
  const multilineWithAuthor = /^title:\s*>-\s*\nauthor:\s*(".+?"|\S+)\s*\n(\s+.+)$/m;
  const match = frontmatter.match(multilineWithAuthor);
  if (match) {
    const lines = frontmatter.split('\n');
    let titleIdx = -1;
    let authorLine = null;
    let titleLines = [];
    let afterTitleIdx = -1;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].match(/^title:\s*>-/)) {
        titleIdx = i;
        // Collect until we hit category or another key
        for (let j = i + 1; j < lines.length; j++) {
          const nextLine = lines[j];
          if (nextLine.match(/^author:/)) {
            authorLine = nextLine;
            continue;
          }
          if (nextLine.match(/^category:/)) {
            afterTitleIdx = j;
            break;
          }
          if (nextLine.match(/^\s+/)) {
            titleLines.push(nextLine.trim());
          }
        }
        break;
      }
    }
    
    if (titleLines.length > 0 && afterTitleIdx > 0) {
      const fullTitle = titleLines.join(' ').replace(/\s+/g, ' ').trim();
      const escapedTitle = fullTitle.replace(/"/g, '\\"');
      lines[titleIdx] = `title: "${escapedTitle}"`;
      if (authorLine) {
        lines[titleIdx + 1] = authorLine;
        // Remove extra lines
        lines.splice(titleIdx + 2, afterTitleIdx - titleIdx - 2);
      } else {
        lines.splice(titleIdx + 1, afterTitleIdx - titleIdx - 1);
      }
      frontmatter = lines.join('\n');
      changed = true;
    }
  }
  
  if (changed) {
    const newContent = '---' + frontmatter + '---' + body;
    fs.writeFileSync(filepath, newContent, 'utf8');
    console.log('Fixed:', path.basename(filepath));
    fixed++;
  }
}

walkDir(docsDir);
console.log('\nTotal fixed:', fixed);
