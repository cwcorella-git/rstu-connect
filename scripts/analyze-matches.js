const fs = require('fs');
const path = require('path');

const matchesPath = path.join(__dirname, '../data/anarchist-matches.json');
const matches = JSON.parse(fs.readFileSync(matchesPath, 'utf-8'));

console.log('=== METADATA ENRICHMENT ANALYSIS ===\n');

console.log(`Total matches found: ${matches.length}`);

const missingAuthorsCanFill = matches.filter(d => !d.rstu_author && d.anarchist_author);
const missingDatesCanFill = matches.filter(d => !d.rstu_date && d.anarchist_publication_date);
const missingBothCanFillBoth = matches.filter(d => !d.rstu_author && !d.rstu_date && d.anarchist_author && d.anarchist_publication_date);

console.log(`\nMissing authors we can fill: ${missingAuthorsCanFill.length}`);
console.log(`Missing dates we can fill: ${missingDatesCanFill.length}`);
console.log(`Missing both that we can fill both: ${missingBothCanFillBoth.length}`);

console.log('\n=== SAMPLE MATCHES ===\n');
matches.slice(0, 5).forEach(match => {
  console.log(`RSTU: "${match.rstu_title}"`);
  console.log(`  Author: ${match.rstu_author || '(missing)'} -> ${match.anarchist_author || '(none)'}`);
  console.log(`  Date: ${match.rstu_date || '(missing)'} -> ${match.anarchist_publication_date || '(none)'}`);
  console.log(`  Anarchist: "${match.anarchist_title}"`);
  console.log('');
});

console.log('\n=== DOCUMENTS WITH FILLABLE METADATA ===\n');
const fillable = matches.filter(d => (!d.rstu_author && d.anarchist_author) || (!d.rstu_date && d.anarchist_publication_date));
console.log(`Total fillable: ${fillable.length}\n`);

fillable.forEach(doc => {
  const updates = [];
  if (!doc.rstu_author && doc.anarchist_author) {
    updates.push(`author: "${doc.anarchist_author}"`);
  }
  if (!doc.rstu_date && doc.anarchist_publication_date) {
    updates.push(`date: "${doc.anarchist_publication_date}"`);
  }
  console.log(`${doc.rstu_id}`);
  console.log(`  Title: "${doc.rstu_title}"`);
  console.log(`  Can add: ${updates.join(', ')}`);
  console.log('');
});
