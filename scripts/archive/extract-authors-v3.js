#!/usr/bin/env node
/**
 * Enhanced author extraction v3 - additional patterns:
 * 1. All patterns from v2
 * 2. Header authors (## FirstName LastName in body)
 * 3. Filename ending with " - AuthorName.md"
 * 4. "written by", "authored by", "posted by" patterns
 * 5. More famous authors and known publications
 * 6. PDF-style author headers (FirstName M. LastName)
 */

const fs = require('fs');
const path = require('path');

const docsDir = path.join(__dirname, '../docs');

let updated = 0;
let skipped = 0;

// Famous authors that might appear in titles or content
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
  // Additional authors
  'thomas piketty': 'Thomas Piketty',
  'mahatma gandhi': 'Mahatma Gandhi',
  'ta-nehisi coates': 'Ta-Nehisi Coates',
  'natasha lennard': 'Natasha Lennard',
  'viktor frankl': 'Viktor E. Frankl',
  'hardy merriman': 'Hardy Merriman',
  'gina barnes': 'Gina L. Barnes',
  'jason schreier': 'Jason Schreier',
  'alexander trocchi': 'Alexander Trocchi',
  'dan evans': 'Dan Evans',
  'naomi klein': 'Naomi Klein',
  'rebecca solnit': 'Rebecca Solnit',
  'silvia federici': 'Silvia Federici',
  'mark fisher': 'Mark Fisher',
  'ruth wilson gilmore': 'Ruth Wilson Gilmore',
  'mariame kaba': 'Mariame Kaba',
  'robin d.g. kelley': 'Robin D.G. Kelley',
  'cornel west': 'Cornel West',
  'adrienne maree brown': 'adrienne maree brown',
  'ibram x. kendi': 'Ibram X. Kendi',
  'keeanga-yamahtta taylor': 'Keeanga-Yamahtta Taylor',
  'kristian williams': 'Kristian Williams',
  'alex vitale': 'Alex S. Vitale',
  // Additional authors from document analysis
  'jeremy brecher': 'Jeremy Brecher',
  'james byrne': 'James Byrne',
  'katy shaw': 'Katy Shaw',
  'james c. scott': 'James C. Scott',
  'scott crow': 'scott crow',
  'uri gordon': 'Uri Gordon',
  'iain mckay': 'Iain McKay',
  'zoe baker': 'Zoe Baker',
  'mark bray': 'Mark Bray',
  'peter gelderloos': 'Peter Gelderloos',
  'chris hedges': 'Chris Hedges',
  'arundhati roy': 'Arundhati Roy',
  'vandana shiva': 'Vandana Shiva',
  'winona laduke': 'Winona LaDuke',
  'leanne betasamosake simpson': 'Leanne Betasamosake Simpson',
  'nick estes': 'Nick Estes',
  'roxanne dunbar-ortiz': 'Roxanne Dunbar-Ortiz',
  'glen sean coulthard': 'Glen Sean Coulthard',
  'nick srnicek': 'Nick Srnicek',
  'alex williams': 'Alex Williams',
  'david harvey': 'David Harvey',
  'kojin karatani': 'Kojin Karatani',
  'slavoj zizek': 'Slavoj Žižek',
  'alain badiou': 'Alain Badiou',
  'jacques ranciere': 'Jacques Rancière',
  'wendy brown': 'Wendy Brown',
  'jodi dean': 'Jodi Dean',
  'paul mason': 'Paul Mason',
  'aaron bastani': 'Aaron Bastani',
  'grace lee boggs': 'Grace Lee Boggs',
  'james boggs': 'James Boggs',
  'clr james': 'C.L.R. James',
  'cedric robinson': 'Cedric J. Robinson',
  'walter rodney': 'Walter Rodney',
  'amilcar cabral': 'Amílcar Cabral',
  'thomas sankara': 'Thomas Sankara',
  'kwame nkrumah': 'Kwame Nkrumah',
  'steve biko': 'Steve Biko',
};

// Known organizations and publications
const ORG_AUTHORS = {
  'iww': 'Industrial Workers of the World',
  'industrial workers of the world': 'Industrial Workers of the World',
  'cnt': 'Confederación Nacional del Trabajo',
  'crimethinc': 'CrimethInc.',
  'libcom': 'libcom.org',
  'libcom.org': 'libcom.org',
  'wikipedia': 'Wikipedia contributors',
  'class war': 'Class War Federation',
  'anarchist library': 'The Anarchist Library',
  "it's going down": "It's Going Down",
  'igd': "It's Going Down",
  'the washington post': 'The Washington Post',
  'washington post': 'The Washington Post',
  'world history encyclopedia': 'World History Encyclopedia',
  'neuroscience news': 'Neuroscience News',
  'archdaily': 'ArchDaily',
  'harvard political review': 'Harvard Political Review',
  'jstor': 'JSTOR',
  'free software foundation': 'Free Software Foundation',
  'global nonviolent action database': 'Global Nonviolent Action Database',
  'housing advocacy organization': 'Housing Advocacy Organization',
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
  'Reader', 'Mode', 'Urban', 'Episode', 'Preview', 'Sample',
  'Compilation', 'Thesis', 'Driven',
];

// Author names that should NOT be extracted (false positives)
const FALSE_POSITIVE_AUTHORS = [
  'Reader Mode',
  'Urban Horticulture',
  'Thesis Driven',
  'Arcoindian I Population',
];

function isValidAuthor(name) {
  if (!name) return false;
  name = name.trim();

  // Must be reasonable length
  if (name.length < 4 || name.length > 60) return false;

  // No numbers (except for middle initials like Jr., III)
  if (/\d{2,}/.test(name)) return false;

  // Check against false positives
  if (FALSE_POSITIVE_AUTHORS.includes(name)) return false;

  // Not a bad word
  for (const word of NOT_AUTHOR_WORDS) {
    if (name.toLowerCase().startsWith(word.toLowerCase() + ' ')) return false;
    if (name.toLowerCase() === word.toLowerCase()) return false;
    if (name.toLowerCase().endsWith(' ' + word.toLowerCase())) return false;
  }

  // Not all lowercase (except known exceptions like "bell hooks")
  if (name === name.toLowerCase() && !FAMOUS_AUTHORS[name.toLowerCase()]) return false;

  // Must have at least one capital letter
  if (!/[A-Z]/.test(name)) return false;

  // Should have at least 2 parts (first and last name) for most cases
  const parts = name.split(/\s+/);
  if (parts.length < 2) {
    // Single word - only accept if it's a known publication/org
    if (!ORG_AUTHORS[name.toLowerCase()]) return false;
  }

  return true;
}

// Extract author from filename patterns
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

  // Pattern: Title - Author Name.md (at end of filename)
  // Match: " - FirstName LastName.md" or " - FirstName M. LastName.md"
  const endDashMatch = filename.match(/\s+-\s+([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\.md$/);
  if (endDashMatch && isValidAuthor(endDashMatch[1])) {
    return endDashMatch[1].trim();
  }

  // Pattern: Title - Author Name.md (anywhere with .md ending)
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
    if (lowerTitle.startsWith(pattern + ' ') || lowerTitle.startsWith(pattern + ':') || lowerTitle.startsWith(pattern + ',')) {
      return authorName;
    }
  }

  // Pattern: "Author Name - Title" or "Author Name: Title"
  const colonMatch = title.match(/^([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+(?:[- ][A-Z][a-z]+)?)\s*[-:]\s*.{10,}/);
  if (colonMatch && isValidAuthor(colonMatch[1])) {
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

  // Check first 20 non-empty lines for author patterns
  for (let i = 0; i < Math.min(20, lines.length); i++) {
    let line = lines[i].replace(/^#+\s*/, '').replace(/^\*+|\*+$/g, '').trim();

    // Pattern: ## FirstName LastName (header with just author name)
    // or ## FirstName M. LastName or # FirstName LastName
    if (lines[i].match(/^#{1,2}\s+[A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\s*$/)) {
      const headerAuthor = lines[i].replace(/^#{1,2}\s+/, '').trim();
      if (isValidAuthor(headerAuthor) && !title.toLowerCase().includes(headerAuthor.toLowerCase())) {
        return headerAuthor;
      }
    }

    // Single name on its own line (likely author)
    if (line.match(/^[A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+(?:[- ][A-Z][a-z]+)?$/) && isValidAuthor(line)) {
      if (!title.toLowerCase().includes(line.toLowerCase())) {
        return line;
      }
    }

    // "By Author Name" pattern
    const byMatch = line.match(/^[Bb]y\s+([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+(?:[- ][A-Z][a-z]+)?)/);
    if (byMatch && isValidAuthor(byMatch[1])) {
      return byMatch[1];
    }

    // "written by Author Name" or "authored by Author Name" pattern
    const writtenByMatch = line.match(/(?:written|authored|posted)\s+by\s+([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+)/i);
    if (writtenByMatch && isValidAuthor(writtenByMatch[1])) {
      return writtenByMatch[1];
    }

    // "Author: Name" pattern
    const authorMatch = line.match(/^[Aa]uthor:\s*([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+)/);
    if (authorMatch && isValidAuthor(authorMatch[1])) {
      return authorMatch[1];
    }

    // Pattern: "Title - Author Name" where title appears in body as header
    // e.g., "## **The dock workers strike... - Jeremy Brecher**"
    const titleAuthorMatch = line.match(/[-–]\s*([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+)\s*\*{0,2}\s*$/);
    if (titleAuthorMatch && isValidAuthor(titleAuthorMatch[1])) {
      return titleAuthorMatch[1];
    }
  }

  // Check for famous authors mentioned prominently
  const searchArea = body.substring(0, 2000).toLowerCase();
  for (const [pattern, authorName] of Object.entries(FAMOUS_AUTHORS)) {
    if (searchArea.startsWith(pattern) || searchArea.includes('by ' + pattern)) {
      return authorName;
    }
  }

  // Check for org authors in title and body
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

  // Final validation
  if (!isValidAuthor(author)) {
    skipped++;
    return;
  }

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

console.log('Enhanced author extraction v3...\n');
walkDir(docsDir);

console.log(`\n=== DONE ===`);
console.log(`Updated: ${updated}`);
console.log(`Skipped: ${skipped}`);
