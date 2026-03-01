const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(
  path.join(__dirname, '../src/contexts/LanguageContext.tsx'),
  'utf8'
);

// Find each locale's keys by looking for patterns like:
// en: {
//   'key': 'value',
// }

const locales = ['en', 'es', 'tl', 'zh', 'vi'];
const keysByLocale = {};

for (const locale of locales) {
  // Find the start of this locale's object
  const startPattern = new RegExp(`^\\s*${locale}:\\s*\\{`, 'm');
  const startMatch = startPattern.exec(content);

  if (!startMatch) {
    console.log(`Could not find locale: ${locale}`);
    continue;
  }

  const startIndex = startMatch.index + startMatch[0].length;

  // Find all keys in this section until we hit the next locale or end
  // We need to find the matching closing brace
  let braceCount = 1;
  let endIndex = startIndex;

  for (let i = startIndex; i < content.length && braceCount > 0; i++) {
    if (content[i] === '{') braceCount++;
    if (content[i] === '}') braceCount--;
    endIndex = i;
  }

  const localeContent = content.substring(startIndex, endIndex);

  // Extract all keys (patterns like 'some.key':)
  const keyRegex = /'([^']+)':\s*['"]/g;
  const keys = new Set();
  let match;

  while ((match = keyRegex.exec(localeContent)) !== null) {
    keys.add(match[1]);
  }

  keysByLocale[locale] = keys;
}

// Report
const enKeys = keysByLocale['en'];
console.log(`English has ${enKeys.size} translation keys\n`);

// Group missing keys by prefix for cleaner output
function groupByPrefix(keys) {
  const groups = {};
  for (const key of keys) {
    const prefix = key.split('.').slice(0, 2).join('.');
    if (!groups[prefix]) groups[prefix] = [];
    groups[prefix].push(key);
  }
  return groups;
}

for (const locale of ['es', 'tl', 'zh', 'vi']) {
  const localeKeys = keysByLocale[locale] || new Set();
  const missing = [...enKeys].filter(k => !localeKeys.has(k));

  console.log(`\n${'='.repeat(50)}`);
  console.log(`Missing in ${locale.toUpperCase()}: ${missing.length} keys`);
  console.log('='.repeat(50));

  if (missing.length === 0) {
    console.log('  (none - fully translated!)');
    continue;
  }

  const grouped = groupByPrefix(missing);
  const sortedPrefixes = Object.keys(grouped).sort();

  for (const prefix of sortedPrefixes) {
    console.log(`\n  ${prefix}.*`);
    for (const key of grouped[prefix].sort()) {
      console.log(`    - ${key}`);
    }
  }
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('SUMMARY');
console.log('='.repeat(50));
for (const locale of locales) {
  const count = keysByLocale[locale]?.size || 0;
  const missing = enKeys.size - count;
  const pct = ((count / enKeys.size) * 100).toFixed(1);
  console.log(`  ${locale.toUpperCase()}: ${count}/${enKeys.size} keys (${pct}%) - ${missing} missing`);
}
