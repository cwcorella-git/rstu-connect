#!/usr/bin/env node
const m = require('../src/data/reading-manifest.json');
let d = 0;
m.documents.forEach(doc => { if (doc.date) d++; });
console.log('=== DATE COVERAGE ===');
console.log('Total:', m.documents.length);
console.log('With date:', d, '(' + Math.round(d/m.documents.length*100) + '%)');
console.log('Without date:', m.documents.length - d);
