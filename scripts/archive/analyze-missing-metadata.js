const m = require('../src/data/reading-manifest.json');

const noAuthor = m.documents.filter(d => !d.author);
const noTags = m.documents.filter(d => !d.tags || d.tags.length === 0);

console.log('=== Missing Authors: ' + noAuthor.length + ' ===');
const byCat = {};
noAuthor.forEach(d => { byCat[d.category] = (byCat[d.category] || 0) + 1; });
Object.entries(byCat).sort((a,b) => b[1] - a[1]).forEach(([c, n]) => console.log('  ' + c + ': ' + n));

console.log('\n=== Missing Tags: ' + noTags.length + ' ===');
const tagsByCat = {};
noTags.forEach(d => { tagsByCat[d.category] = (tagsByCat[d.category] || 0) + 1; });
Object.entries(tagsByCat).sort((a,b) => b[1] - a[1]).forEach(([c, n]) => console.log('  ' + c + ': ' + n));

console.log('\n=== Sample Missing Author ===');
noAuthor.slice(0, 20).forEach(d => console.log('  [' + d.category + '] ' + d.filename.slice(0,60)));

console.log('\n=== Sample Missing Tags ===');
noTags.slice(0, 20).forEach(d => console.log('  [' + d.category + '] ' + d.filename.slice(0,60)));
