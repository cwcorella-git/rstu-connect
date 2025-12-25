const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const DOCS_DIR = path.join(__dirname, '../docs');

// Date extraction patterns
const YEAR_PATTERNS = [
  // Year in parentheses: (2020), (1919)
  /\((\d{4})\)/,
  // Year after dash in filename: something-2024.md
  /-(\d{4})(?:\.md)?$/,
  // Year at start: 2024-something
  /^(\d{4})-/,
  // "in YEAR", "from YEAR", "since YEAR"
  /\b(?:in|from|since|circa|c\.?)\s+(\d{4})\b/i,
  // Published/Written/Dated YEAR
  /\b(?:published|written|dated|copyright|©)\s*(?:in\s+)?(\d{4})\b/i,
  // Month Day, Year or Month Year
  /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+(?:\d{1,2},?\s+)?(\d{4})\b/i,
  // DD/MM/YYYY or MM/DD/YYYY
  /\b\d{1,2}\/\d{1,2}\/(\d{4})\b/,
  // YYYY-MM-DD format
  /\b(\d{4})-\d{2}-\d{2}\b/,
  // Year standalone in content (4 digits, 1800-2025 range)
  /\b((?:18|19|20)\d{2})\b/
];

// Special patterns for specific document types
const SPECIAL_PATTERNS = {
  // Meeting notes: "1-22-25" -> 2025, "11-15-23" -> 2023
  meetingNote: /\b(\d{1,2})-(\d{1,2})-(\d{2})\b/,
  // Wikipedia articles often have "(Retrieved Month Day, Year)"
  wikipedia: /Retrieved\s+(?:\w+\s+\d+,?\s+)?(\d{4})/i,
  // News articles: "Updated Month Day, Year"
  news: /(?:Updated|Published|Posted)\s+(?:\w+\s+\d+,?\s+)?(\d{4})/i,
  // Legal docs: "83rd Session (2025)"
  legislative: /\d+(?:st|nd|rd|th)\s+Session\s*\((\d{4})\)/i,
  // Copyright statements
  copyright: /(?:©|Copyright)\s*(\d{4})/i
};

function extractDateFromContent(content, filename) {
  const lines = content.split('\n');
  const first100Lines = lines.slice(0, 100).join('\n');
  const last20Lines = lines.slice(-20).join('\n');

  // Check special patterns first (more specific = higher confidence)

  // Meeting notes pattern from filename
  const meetingMatch = filename.match(SPECIAL_PATTERNS.meetingNote);
  if (meetingMatch) {
    const twoDigitYear = parseInt(meetingMatch[3]);
    const year = twoDigitYear > 50 ? 1900 + twoDigitYear : 2000 + twoDigitYear;
    if (year >= 1990 && year <= 2025) {
      return { date: year, method: 'meeting_note_filename' };
    }
  }

  // Legislative session
  const legMatch = first100Lines.match(SPECIAL_PATTERNS.legislative);
  if (legMatch) {
    const year = parseInt(legMatch[1]);
    if (year >= 1990 && year <= 2025) {
      return { date: year, method: 'legislative_session' };
    }
  }

  // Copyright in footer/header
  for (const text of [first100Lines, last20Lines]) {
    const copyMatch = text.match(SPECIAL_PATTERNS.copyright);
    if (copyMatch) {
      const year = parseInt(copyMatch[1]);
      if (year >= 1800 && year <= 2025) {
        return { date: year, method: 'copyright' };
      }
    }
  }

  // Wikipedia/news retrieval date
  const wikiMatch = content.match(SPECIAL_PATTERNS.wikipedia);
  if (wikiMatch) {
    return { date: parseInt(wikiMatch[1]), method: 'wikipedia_retrieval' };
  }

  const newsMatch = content.match(SPECIAL_PATTERNS.news);
  if (newsMatch) {
    return { date: parseInt(newsMatch[1]), method: 'news_timestamp' };
  }

  // Year in filename
  for (const pattern of YEAR_PATTERNS.slice(0, 3)) {
    const match = filename.match(pattern);
    if (match) {
      const year = parseInt(match[1]);
      if (year >= 1800 && year <= 2025) {
        return { date: year, method: 'filename_year' };
      }
    }
  }

  // Check content patterns
  for (const pattern of YEAR_PATTERNS.slice(3, -1)) {
    const match = first100Lines.match(pattern);
    if (match) {
      const year = parseInt(match[1]);
      if (year >= 1800 && year <= 2025) {
        return { date: year, method: 'content_pattern' };
      }
    }
  }

  // Last resort: find most recent reasonable year mentioned
  const allYears = [];
  const yearRegex = /\b((?:18|19|20)\d{2})\b/g;
  let m;
  while ((m = yearRegex.exec(content)) !== null) {
    const year = parseInt(m[1]);
    if (year >= 1800 && year <= 2025) {
      allYears.push(year);
    }
  }

  if (allYears.length > 0) {
    // For historical docs, use earliest; for news/articles, use latest
    const isHistorical = filename.toLowerCase().includes('history') ||
                         filename.toLowerCase().includes('1800') ||
                         filename.toLowerCase().includes('1900');
    const year = isHistorical ? Math.min(...allYears) : Math.max(...allYears);
    return { date: year, method: 'content_year_scan' };
  }

  // Default to 2025 for RSTU organizational docs
  if (filename.includes('RSTU') || filename.includes('rstu') ||
      filename.includes('Reno') || filename.includes('reno') ||
      filename.includes('Google Docs') || filename.includes('meeting')) {
    return { date: 2025, method: 'organizational_default' };
  }

  return null;
}

function processDocuments() {
  const results = [];
  let processed = 0;
  let extracted = 0;

  function processDir(dir) {
    for (const item of fs.readdirSync(dir)) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory() && !item.startsWith('.')) {
        processDir(fullPath);
      } else if (item.endsWith('.md')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        let parsed;
        try {
          parsed = matter(content);
        } catch (e) {
          continue;
        }

        // Skip if already has date
        if (parsed.data.date) {
          continue;
        }

        processed++;

        const result = extractDateFromContent(parsed.content, item);
        if (result) {
          extracted++;

          // Apply the date
          parsed.data.date = result.date;
          const newContent = matter.stringify(parsed.content, parsed.data);
          fs.writeFileSync(fullPath, newContent);

          results.push({
            file: item.slice(0, 50),
            date: result.date,
            method: result.method
          });

          console.log(`[${result.method}] ${item.slice(0, 40)}: ${result.date}`);
        }
      }
    }
  }

  processDir(DOCS_DIR);

  return { processed, extracted, results };
}

console.log('=== Aggressive Date Extraction ===\n');
const { processed, extracted, results } = processDocuments();

console.log('\n=== Summary ===');
console.log(`Processed: ${processed} docs without dates`);
console.log(`Extracted: ${extracted} dates`);

// Count by method
const byMethod = {};
for (const r of results) {
  byMethod[r.method] = (byMethod[r.method] || 0) + 1;
}
console.log('\nBy method:');
for (const [method, count] of Object.entries(byMethod).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${method}: ${count}`);
}
