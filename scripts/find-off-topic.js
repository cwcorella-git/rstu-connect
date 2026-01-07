#!/usr/bin/env node
/**
 * Identify potentially off-topic documents in the reading library
 * RSTU Connect focus: tenant organizing, labor, anarchism, social justice, housing
 */

const fs = require('fs');
const path = require('path');
const manifest = require('../src/data/reading-manifest.json');

// Off-topic patterns - documents matching these are likely not relevant
const OFF_TOPIC_PATTERNS = {
  // Ancient philosophy/self-help (unless connected to anarchism)
  philosophy: [
    /seneca.*guide/i,
    /epictetus.*guide/i,
    /how\s*to\s*(die|give|keep|have\s*a\s*life)/i,
    /stoic(?!.*anarchi)/i,
    /marcus\s*aurelius/i,
    /enchiridion/i,
  ],

  // Random Wikipedia articles unrelated to organizing
  wikipedia: [
    /ptolemy.*wikipedia/i,
    /roman\s*(consul|citizenship).*wikipedia/i,
    /judea.*wikipedia/i,
    /kinesiology.*wikipedia/i,
    /kudzu.*wikipedia/i,
    /gravity\s*battery.*wikipedia/i,
    /meta-emotion.*wikipedia/i,
  ],

  // Game development / design (unless about gamification of organizing)
  gamedev: [
    /game\s*design/i,
    /game\s*development/i,
    /video\s*game/i,
    /godot/i,
    /unity\s*(engine|3d|render)/i,
    /unreal\s*engine/i,
    /shader/i,
    /bioshock/i,
    /doom\s*bible/i,
    /arcana\s*project/i,
    /finch.*concept/i,
    /game\s*document/i,
    /GDD/i,
    /level\s*design/i,
    /game\s*mechanics/i,
    /game\s*dynamics/i,
    /narrativism/i,
    /ludonarrative/i,
    /player\s*agency/i,
    /cityville/i,
    /zynga/i,
    /social\s*games(?!.*organizing)/i,
  ],

  // AI/ML research papers (unless about surveillance, labor impacts)
  aiml: [
    /^[0-9]{4}\.[0-9]{4,5}/,  // ArXiv paper IDs
    /transformer\s*architecture/i,
    /neural\s*network(?!.*surveillance)/i,
    /deep\s*learning(?!.*surveillance)/i,
    /machine\s*learning(?!.*labor|surveillance)/i,
    /GPT-[0-9]/i,
    /chatgpt(?!.*labor|worker)/i,
    /langchain/i,
    /pytorch/i,
    /tensorflow/i,
    /llama\s*model/i,
    /fine.?tuning/i,
    /RLHF/i,
    /token\s*consumption/i,
    /benchmark.*model/i,
  ],

  // Random technical docs
  technical: [
    /3d\s*print(?!.*protest|activist)/i,
    /jupyter\s*notebook/i,
    /c#\s*scripting/i,
    /render\s*pipeline/i,
    /animation\s*tree/i,
    /shader\s*tutorial/i,
    /hydroponic/i,
    /deep\s*water\s*culture/i,
    /permaculture(?!.*community)/i,
  ],

  // Academic papers unrelated to organizing
  academic: [
    /neuromorphic/i,
    /quantum\s*computing/i,
    /alloy\s*design/i,
    /metallurgy/i,
    /molecular/i,
    /photosynthesis/i,
    /spectroscopy/i,
  ],

  // Architecture/design (unless housing-related)
  architecture: [
    /adjaye.*campus/i,
    /larsen.*design/i,
    /archday(?!.*housing|tenant)/i,
    /pavilion\s*design/i,
    /business\s*school.*design/i,
  ],

  // Random lifestyle/entertainment
  lifestyle: [
    /workout/i,
    /fitness(?!.*labor)/i,
    /astrology/i,
    /horoscope/i,
    /meditation(?!.*activist|burnout)/i,
  ],

  // Fiction/entertainment (unless relevant social commentary)
  fiction: [
    /prayer.*crown.*shy/i,
    /monk\s*and\s*robot/i,
  ],
};

// Exceptions - documents that match off-topic patterns but ARE relevant
const EXCEPTIONS = [
  /energy\s*democracy/i,
  /community.*power/i,
  /environmental\s*justice/i,
  /labor.*game/i,
  /gig\s*economy/i,
  /platform\s*capitalism/i,
  /surveillance/i,
  /ai.*labor/i,
  /automation.*worker/i,
  /algorithmic.*management/i,
  /worker.*algorithm/i,
  /union/i,
  /strike/i,
  /tenant/i,
  /rent/i,
  /housing/i,
  /eviction/i,
  /organizing/i,
  /anarchi/i,
  /mutual\s*aid/i,
  /solidarity/i,
  /antifascis/i,
  /abolition/i,
  /police/i,
  /prison/i,
  /iww/i,
  /wobbl/i,
];

function isException(title, filename) {
  const combined = `${title} ${filename}`.toLowerCase();
  return EXCEPTIONS.some(pattern => pattern.test(combined));
}

function findOffTopicCategory(title, filename) {
  const combined = `${title} ${filename}`;

  for (const [category, patterns] of Object.entries(OFF_TOPIC_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(combined)) {
        return category;
      }
    }
  }
  return null;
}

// Analyze documents
const offTopicDocs = [];
const exceptions = [];

for (const doc of manifest.documents) {
  const category = findOffTopicCategory(doc.title, doc.filename);

  if (category) {
    if (isException(doc.title, doc.filename)) {
      exceptions.push({
        title: doc.title,
        filename: doc.filename,
        category: doc.category,
        matchedCategory: category,
        reason: 'Exception - contains relevant keywords'
      });
    } else {
      // Construct filepath
      const categoryFolder = doc.category.toLowerCase().replace(/\s+/g, '-');
      offTopicDocs.push({
        title: doc.title.substring(0, 80),
        filename: doc.filename,
        category: doc.category,
        offTopicType: category,
        filepath: `docs/${categoryFolder}/${doc.filename}`
      });
    }
  }
}

// Sort by off-topic type
offTopicDocs.sort((a, b) => {
  if (a.offTopicType !== b.offTopicType) return a.offTopicType.localeCompare(b.offTopicType);
  return a.title.localeCompare(b.title);
});

console.log('=== OFF-TOPIC DOCUMENT ANALYSIS ===\n');
console.log(`Total documents: ${manifest.documents.length}`);
console.log(`Potentially off-topic: ${offTopicDocs.length}`);
console.log(`Exceptions (kept): ${exceptions.length}\n`);

// Group by type
const byType = {};
for (const doc of offTopicDocs) {
  if (!byType[doc.offTopicType]) byType[doc.offTopicType] = [];
  byType[doc.offTopicType].push(doc);
}

console.log('=== BY CATEGORY ===\n');
for (const [type, docs] of Object.entries(byType)) {
  console.log(`${type.toUpperCase()} (${docs.length}):`);
  docs.forEach(d => {
    console.log(`  - ${d.title.substring(0, 60)}...`);
    console.log(`    ${d.filepath}`);
  });
  console.log('');
}

// Save deletion list
const deletionList = offTopicDocs.map(d => d.filepath);
fs.writeFileSync('off-topic-to-delete.txt', deletionList.join('\n'));
console.log(`\nDeletion list saved to: off-topic-to-delete.txt`);

// Save detailed report
fs.writeFileSync('off-topic-report.json', JSON.stringify({
  summary: {
    totalDocuments: manifest.documents.length,
    offTopicCount: offTopicDocs.length,
    exceptionsCount: exceptions.length,
  },
  byCategory: byType,
  offTopicDocs,
  exceptions
}, null, 2));
console.log('Detailed report saved to: off-topic-report.json');
