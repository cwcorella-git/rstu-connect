const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const files = [
  'docs/abolition/From Minneapolis to France, Fck the Police! The Revolt Spreads from the US to Paris and Beyond.md',
  'docs/labor/basic-book-on-syndicalism-some-tips-on-how-to-use-it.md',
  'docs/misc/Inside the DNC\'s money problems - POLITICO.md',
  'docs/labor/Conservatives back down on anti-worker law in face of general strike threat. Rank and file resolute.md',
];

for (const file of files) {
  const filepath = path.join('/home/user/Projects/rstu-connect', file);
  if (!fs.existsSync(filepath)) {
    console.log('Not found:', file);
    continue;
  }
  
  try {
    const content = fs.readFileSync(filepath, 'utf8');
    const parsed = matter(content);
    console.log('OK:', file);
  } catch (e) {
    console.log('ERROR:', file);
    console.log('  ', e.message);
    
    // Show the problematic frontmatter
    const content = fs.readFileSync(filepath, 'utf8');
    const endIdx = content.indexOf('---', 3);
    if (endIdx > 0) {
      console.log('  Frontmatter (first 500 chars):');
      console.log(content.substring(0, Math.min(500, endIdx + 3)));
    }
  }
}
