const manifest = require('../src/data/reading-manifest.json');

// Check for duplicate titles
const titleMap = {};
const duplicates = [];

for (const doc of manifest.documents) {
  const normalizedTitle = doc.title.toLowerCase().trim().replace(/\s+/g, ' ');

  if (titleMap[normalizedTitle]) {
    duplicates.push({
      title: doc.title,
      doc1: titleMap[normalizedTitle],
      doc2: { id: doc.id, category: doc.category, filename: doc.filename }
    });
  } else {
    titleMap[normalizedTitle] = { id: doc.id, category: doc.category, filename: doc.filename };
  }
}

// Check for similar titles (fuzzy matching)
const titles = Object.keys(titleMap);
const similarPairs = [];

function similarity(s1, s2) {
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  if (longer.length === 0) return 1.0;
  const costs = [];
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) costs[j] = j;
      else if (j > 0) {
        let newValue = costs[j - 1];
        if (s1.charAt(i - 1) !== s2.charAt(j - 1))
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  return (longer.length - costs[s2.length]) / longer.length;
}

// Only check first 50 chars for similarity to speed up
for (let i = 0; i < titles.length; i++) {
  for (let j = i + 1; j < titles.length; j++) {
    const t1 = titles[i].slice(0, 50);
    const t2 = titles[j].slice(0, 50);
    const sim = similarity(t1, t2);
    if (sim > 0.85 && t1 !== t2) {
      similarPairs.push({
        similarity: (sim * 100).toFixed(1) + '%',
        doc1: titleMap[titles[i]],
        doc2: titleMap[titles[j]],
        title1: titles[i].slice(0, 60),
        title2: titles[j].slice(0, 60)
      });
    }
  }
}

console.log('=== Exact Duplicates: ' + duplicates.length + ' ===');
duplicates.forEach(d => {
  console.log('\nTitle: ' + d.title.slice(0, 60));
  console.log('  1: [' + d.doc1.category + '] ' + d.doc1.filename.slice(0, 50));
  console.log('  2: [' + d.doc2.category + '] ' + d.doc2.filename.slice(0, 50));
});

console.log('\n=== Similar Titles (>85%): ' + similarPairs.length + ' ===');
similarPairs.slice(0, 20).forEach(p => {
  console.log('\n' + p.similarity + ' similar:');
  console.log('  1: [' + p.doc1.category + '] ' + p.title1);
  console.log('  2: [' + p.doc2.category + '] ' + p.title2);
});

if (similarPairs.length > 20) {
  console.log('\n... and ' + (similarPairs.length - 20) + ' more similar pairs');
}
