#!/usr/bin/env node
/**
 * Enhanced author extraction - handles more patterns:
 * 1. Author embedded in filename with underscores (Author_Name_Title.md)
 * 2. Author at start of title (Author Name - Title)
 * 3. First line of body is just an author name
 * 4. Multiple authors separated by commas in filename
 * 5. Known famous authors mentioned in title/content
 */

const fs = require('fs');
const path = require('path');

const docsDir = path.join(__dirname, '../docs');

let updated = 0;
let skipped = 0;

// Famous authors that might appear in titles
const FAMOUS_AUTHORS = {
  'michel foucault': 'Michel Foucault',
  'alexander berkman': 'Alexander Berkman',
  'emma goldman': 'Emma Goldman',
  'peter kropotkin': 'Peter Kropotkin',
  'mikhail bakunin': 'Mikhail Bakunin',
  'errico malatesta': 'Errico Malatesta',
  'noam chomsky': 'Noam Chomsky',
  'angela davis': 'Angela Davis',
  'david graeber': 'David Graeber',
  'murray bookchin': 'Murray Bookchin',
  'rudolf rocker': 'Rudolf Rocker',
  'lucy parsons': 'Lucy Parsons',
  'voltairine de cleyre': 'Voltairine de Cleyre',
  'howard zinn': 'Howard Zinn',
  'rosa luxemburg': 'Rosa Luxemburg',
  'karl marx': 'Karl Marx',
  'friedrich engels': 'Friedrich Engels',
  'antonio gramsci': 'Antonio Gramsci',
  'frantz fanon': 'Frantz Fanon',
  'bell hooks': 'bell hooks',
  'audre lorde': 'Audre Lorde',
  'james baldwin': 'James Baldwin',
  'w.e.b. du bois': 'W.E.B. Du Bois',
  'george orwell': 'George Orwell',
  'ursula le guin': 'Ursula K. Le Guin',
  'ursula k. le guin': 'Ursula K. Le Guin',
  'leo tolstoy': 'Leo Tolstoy',
  'henry david thoreau': 'Henry David Thoreau',
  'albert camus': 'Albert Camus',
  'simone de beauvoir': 'Simone de Beauvoir',
  'jean-paul sartre': 'Jean-Paul Sartre',
  'hannah arendt': 'Hannah Arendt',
  'max stirner': 'Max Stirner',
  'pierre-joseph proudhon': 'Pierre-Joseph Proudhon',
  'nestor makhno': 'Nestor Makhno',
  'buenaventura durruti': 'Buenaventura Durruti',
  'ricardo flores magon': 'Ricardo Flores Magón',
  'sacco and vanzetti': 'Sacco and Vanzetti',
  'joe hill': 'Joe Hill',
  'eugene debs': 'Eugene V. Debs',
  'eugene v. debs': 'Eugene V. Debs',
  'big bill haywood': 'Big Bill Haywood',
  'mother jones': 'Mother Jones',
};

// Known organizations
const ORG_AUTHORS = {
  'iww': 'Industrial Workers of the World',
  'industrial workers of the world': 'Industrial Workers of the World',
  'cnt': 'Confederación Nacional del Trabajo',
  'crimethinc': 'CrimethInc.',
  'libcom': 'libcom.org',
  'wikipedia': 'Wikipedia contributors',
  'class war': 'Class War Federation',
  'anarchist library': 'The Anarchist Library',
  'it\'s going down': "It's Going Down",
  'igd': "It's Going Down",
};

// Words that indicate NOT an author
const NOT_AUTHOR_WORDS = [
  'Wikipedia', 'Unknown', 'Anonymous', 'Various', 'Editor', 'Staff',
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
  'Chapter', 'Volume', 'Part', 'Section', 'Introduction', 'Conclusion',
  'University', 'College', 'Institute', 'Foundation', 'Association',
  'Press', 'Publishing', 'Books', 'Library', 'Archive', 'Document',
  'The', 'And', 'For', 'From', 'With', 'About', 'Article',
  'Prison', 'Police', 'Strike', 'Union', 'Worker', 'Anarchist',
];

function isValidAuthor(name) {
  if (!name) return false;
  name = name.trim();

  // Must be reasonable length
  if (name.length < 4 || name.length > 60) return false;

  // No numbers (except for middle initials like Jr., III)
  if (/\d{2,}/.test(name)) return false;

  // Not a bad word
  for (const word of NOT_AUTHOR_WORDS) {
    if (name.toLowerCase().startsWith(word.toLowerCase() + ' ')) return false;
    if (name.toLowerCase() === word.toLowerCase()) return false;
  }

  // Not all lowercase (except known exceptions like "bell hooks")
  if (name === name.toLowerCase() && !FAMOUS_AUTHORS[name.toLowerCase()]) return false;

  // Must have at least one capital letter
  if (!/[A-Z]/.test(name)) return false;

  return true;
}

// Extract author from filename patterns like "Author_Name_Title.md" or "Title_Author Name_suffix.md"
function extractFromFilename(filename) {
  // Pattern: _FirstName LastName, OtherName_ (multiple authors)
  const multiMatch = filename.match(/_([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+(?:,\s*[A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+)*)_/);
  if (multiMatch && isValidAuthor(multiMatch[1])) {
    return multiMatch[1].trim();
  }

  // Pattern: Author_Name_Title.md (underscored author at start)
  const underscoreMatch = filename.match(/^([A-Z][a-z]+)_([A-Z][a-z]+)_/);
  if (underscoreMatch) {
    const author = underscoreMatch[1] + ' ' + underscoreMatch[2];
    if (isValidAuthor(author)) {
      return author;
    }
  }

  // Pattern: Title - Author Name.md
  const dashMatch = filename.match(/ - ([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+(?:[- ][A-Z][a-z]+)?)(?:\.md|_|$)/);
  if (dashMatch && isValidAuthor(dashMatch[1])) {
    return dashMatch[1].trim();
  }

  return null;
}

// Check if title contains a famous author name at the start
function extractFromTitle(title) {
  const lowerTitle = title.toLowerCase();

  for (const [pattern, authorName] of Object.entries(FAMOUS_AUTHORS)) {
    if (lowerTitle.startsWith(pattern + ' ')) {
      return authorName;
    }
  }

  // Pattern: "Author Name - Title" or "Author Name: Title"
  const colonMatch = title.match(/^([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+(?:[- ][A-Z][a-z]+)?)\s*[-:]\s*.{10,}/);
  if (colonMatch && isValidAuthor(colonMatch[1])) {
    // Make sure it's not a place name or org
    const potential = colonMatch[1];
    if (!potential.includes('University') && !potential.includes('Press')) {
      return potential;
    }
  }

  return null;
}

// Extract author from body content
function extractFromBody(body, title) {
  const lines = body.trim().split('\n').filter(l => l.trim());

  // Check first 5 non-empty lines for author patterns
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    let line = lines[i].replace(/^#+\s*/, '').replace(/^\*+|\*+$/g, '').trim();

    // Single name on its own line (likely author)
    if (line.match(/^[A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+(?:[- ][A-Z][a-z]+)?$/) && isValidAuthor(line)) {
      // Make sure it's not the title
      if (!title.toLowerCase().includes(line.toLowerCase())) {
        return line;
      }
    }

    // "By Author Name" pattern
    const byMatch = line.match(/^[Bb]y\s+([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+(?:[- ][A-Z][a-z]+)?)/);
    if (byMatch && isValidAuthor(byMatch[1])) {
      return byMatch[1];
    }

    // "Author: Name" pattern
    const authorMatch = line.match(/^[Aa]uthor:\s*([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+)/);
    if (authorMatch && isValidAuthor(authorMatch[1])) {
      return authorMatch[1];
    }
  }

  // Check for famous authors mentioned prominently
  const searchArea = body.substring(0, 2000).toLowerCase();
  for (const [pattern, authorName] of Object.entries(FAMOUS_AUTHORS)) {
    // Only match if it's at the very start or after "by"
    if (searchArea.startsWith(pattern) || searchArea.includes('by ' + pattern)) {
      return authorName;
    }
  }

  // Check for org authors
  const lowerTitle = title.toLowerCase();
  const first500 = body.substring(0, 500).toLowerCase();
  for (const [pattern, orgName] of Object.entries(ORG_AUTHORS)) {
    if (lowerTitle.includes(pattern) || first500.includes(pattern)) {
      return orgName;
    }
  }

  return null;
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filepath = path.join(dir, file);
    const stat = fs.statSync(filepath);
    if (stat.isDirectory()) {
      walkDir(filepath);
    } else if (file.endsWith('.md')) {
      processFile(filepath, file);
    }
  }
}

function processFile(filepath, filename) {
  let content = fs.readFileSync(filepath, 'utf8');

  if (!content.startsWith('---')) return;

  const endIdx = content.indexOf('---', 3);
  if (endIdx === -1) return;

  const frontmatter = content.substring(3, endIdx);
  const body = content.substring(endIdx + 3);

  // Check if already has a valid author
  const authorMatch = frontmatter.match(/^author:\s*["']?(.+?)["']?\s*$/m);
  if (authorMatch) {
    const authorVal = authorMatch[1].trim().replace(/['"]/g, '');
    if (authorVal &&
        authorVal !== 'null' &&
        authorVal.toLowerCase() !== 'unknown' &&
        authorVal !== '' &&
        authorVal.length > 3) {
      skipped++;
      return;
    }
  }

  // Get title for context
  const titleMatch = frontmatter.match(/^title:\s*["']?(.+?)["']?\s*$/m);
  const title = titleMatch ? titleMatch[1].replace(/['"]/g, '') : '';

  // Try extraction methods in order of reliability
  let author = null;

  // 1. Try filename patterns
  author = extractFromFilename(filename);

  // 2. Try title patterns (famous authors)
  if (!author) {
    author = extractFromTitle(title);
  }

  // 3. Try body content
  if (!author) {
    author = extractFromBody(body, title);
  }

  if (!author) {
    skipped++;
    return;
  }

  // Clean up author name
  author = author.trim();

  // Update frontmatter
  const lines = frontmatter.split('\n');
  const existingAuthorIdx = lines.findIndex(l => l.startsWith('author:'));
  const escapedAuthor = author.replace(/"/g, '\\"');

  if (existingAuthorIdx !== -1) {
    lines[existingAuthorIdx] = `author: "${escapedAuthor}"`;
  } else {
    const titleIdx = lines.findIndex(l => l.startsWith('title:'));
    const insertIdx = titleIdx !== -1 ? titleIdx + 1 : 1;
    lines.splice(insertIdx, 0, `author: "${escapedAuthor}"`);
  }

  const newFrontmatter = lines.join('\n');
  const newContent = '---' + newFrontmatter + '---' + body;

  fs.writeFileSync(filepath, newContent, 'utf8');

  console.log(`Updated: ${path.relative(docsDir, filepath)} -> "${author}"`);
  updated++;
}

console.log('Enhanced author extraction v2...\n');
walkDir(docsDir);

console.log(`\n=== DONE ===`);
console.log(`Updated: ${updated}`);
console.log(`Skipped: ${skipped}`);
