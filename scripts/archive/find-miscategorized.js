#!/usr/bin/env node
/**
 * Find miscategorized documents in the reading library
 */

const fs = require('fs');
const path = require('path');
const manifest = require('../src/data/reading-manifest.json');

// Category detection rules - keywords that strongly suggest a category
const CATEGORY_RULES = {
  'abolition': {
    keywords: [/\bpolice\b/i, /\bcop\b/i, /\bcops\b/i, /\bprison\b/i, /\bjail\b/i, /\bincarcerat/i, /\babolitio/i, /\bdefund/i, /\bcarceral/i],
    exclude: [/police.*state/i]  // "police state" might be general theory
  },
  'labor': {
    keywords: [/\bunion\b/i, /\bstrike\b/i, /\bworker/i, /\bwage/i, /\biww\b/i, /\bwobbl/i, /\bafl-cio/i, /\bsyndicalis/i, /\blabor\b/i, /\blabour\b/i, /\bemploy/i, /\bworkplace/i, /\bdeliveroo/i, /\bgig\s*economy/i, /\brailroad\s*worker/i, /\bteacher.*strike/i],
    exclude: []
  },
  'housing': {
    keywords: [/\btenant/i, /\brenter/i, /\blandlord/i, /\beviction/i, /\bhousing\b/i, /\brent\s*(strike|control|increase)/i, /\bhomeless/i, /\bgentrific/i, /\bdwelling/i],
    exclude: []
  },
  'feminist-theory': {
    keywords: [/\bfeminis/i, /\bwomen'?s?\b/i, /\bgender\b/i, /\bpatriarch/i, /\breproduct/i, /\babortion/i, /\bqueer\b/i, /\blgbt/i, /\btrans\s*(rights|people|woman|man)/i, /\banarch[ao]-feminis/i],
    exclude: [/women.*iww/i, /women.*strike/i]  // These might be labor
  },
  'environmental-justice': {
    keywords: [/\bclimate/i, /\benvironment/i, /\becolog/i, /\bgreen\s*new\s*deal/i, /\bpipeline/i, /\bstanding\s*rock/i, /\bfossil\s*fuel/i, /\brenewable/i, /\bextraction/i, /\bjust\s*transition/i],
    exclude: []
  },
  'organizing': {
    keywords: [/\borganiz(e|ing|er)/i, /\bmutual\s*aid\b/i, /\bsolidarity\s*network/i, /\bdirect\s*action\b/i, /\bcommunity\s*organiz/i, /\bcanvass/i, /\boutreach/i, /\bhow\s*to\s*organiz/i],
    exclude: [/labor.*organiz/i, /union.*organiz/i, /tenant.*organiz/i]  // More specific categories
  },
  'theory': {
    keywords: [/\banarchi/i, /\bmarxi/i, /\bcommunis/i, /\bsocialis/i, /\blibertarian\s*socialis/i, /\bkapital/i, /\bdialect/i, /\bpraxis/i, /\bideolog/i],
    exclude: [/anarcha-feminis/i]  // Goes to feminist-theory
  },
  'anti-war-peace': {
    keywords: [/\banti-war\b/i, /\bantiwar\b/i, /\bpeace\s*movement/i, /\bpacifi/i, /\bconscientious\s*objector/i, /\bwar\s*resist/i, /\bmilitari/i, /\bimperialis/i],
    exclude: [/class\s*war/i]  // "Class War" is a publication
  },
  'indigenous-solidarity': {
    keywords: [/\bindigenous/i, /\bnative\s*american/i, /\bfirst\s*nation/i, /\btribal/i, /\bdecoloni/i, /\bland\s*back/i],
    exclude: []
  },
  'disability-justice': {
    keywords: [/\bdisabil/i, /\bableism/i, /\baccessib/i, /\bchronic\s*illness/i, /\bneurodiver/i],
    exclude: []
  },
  'legislation': {
    keywords: [/\bassembly\s*bill/i, /\bsenate\s*bill/i, /\bab\s*\d+/i, /\bsb\s*\d+/i, /\blegislat/i, /\bveto/i, /\bpolicy\s*analysis/i],
    exclude: []
  },
  'international-solidarity': {
    keywords: [/\bukraine/i, /\brussia/i, /\bpalestine/i, /\bisrael/i, /\bmexico/i, /\bzapatista/i, /\bkurdish/i, /\brojava/i, /\bspanish\s*civil\s*war/i, /\bcatalonia/i],
    exclude: []
  },
  'food-justice': {
    keywords: [/\bfood\s*(justice|security|sovereignty)/i, /\bhunger/i, /\bagricultur/i, /\bfarm\s*worker/i, /\bseed\s*keeper/i],
    exclude: []
  },
  'youth-student-organizing': {
    keywords: [/\bstudent/i, /\byouth/i, /\bcampus/i, /\buniversity\s*(protest|strike|organiz)/i, /\bhigh\s*school/i, /\bcollege\s*(protest|strike)/i],
    exclude: []
  },
  'technology-digital-justice': {
    keywords: [/\bsurveillance/i, /\bprivacy/i, /\bdigital\s*rights/i, /\binternet\s*freedom/i, /\bplatform\s*capitalism/i, /\btech\s*worker/i, /\balgorithm/i],
    exclude: []
  },
  'economic-alternatives': {
    keywords: [/\bcooperativ/i, /\bco-op\b/i, /\bcoop\b/i, /\bworker.?owned/i, /\bcommons\b/i, /\bdebt\s*(abolition|strike|resist)/i, /\bcommunal/i],
    exclude: []
  }
};

// Suggest best category based on title
function suggestCategory(title, filename) {
  const text = `${title} ${filename}`.toLowerCase();
  const scores = {};

  for (const [category, rules] of Object.entries(CATEGORY_RULES)) {
    let score = 0;

    // Check exclusions first
    const excluded = rules.exclude?.some(pattern => pattern.test(text));
    if (excluded) continue;

    // Count keyword matches
    for (const pattern of rules.keywords) {
      if (pattern.test(text)) {
        score += 1;
      }
    }

    if (score > 0) {
      scores[category] = score;
    }
  }

  // Return highest scoring category
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  if (sorted.length > 0 && sorted[0][1] >= 1) {
    return { suggested: sorted[0][0], score: sorted[0][1], allScores: scores };
  }

  return null;
}

// Convert category name to folder name
function categoryToFolder(category) {
  return category.toLowerCase().replace(/\s+/g, '-');
}

// Analyze all documents
const miscategorized = [];
const uncertain = [];

for (const doc of manifest.documents) {
  const currentCategory = categoryToFolder(doc.category);
  const suggestion = suggestCategory(doc.title, doc.filename);

  if (suggestion) {
    const suggestedFolder = categoryToFolder(suggestion.suggested);

    // Check if document is in wrong category
    if (suggestedFolder !== currentCategory && suggestion.score >= 1) {
      // Skip if current category is "contemporary-analysis" or "theory" (catch-alls)
      // unless the suggested category has strong signal (score >= 2)
      if ((currentCategory === 'contemporary-analysis' || currentCategory === 'theory' || currentCategory === 'misc') && suggestion.score >= 1) {
        miscategorized.push({
          title: doc.title.substring(0, 70),
          filename: doc.filename,
          currentCategory: doc.category,
          suggestedCategory: suggestion.suggested,
          score: suggestion.score,
          filepath: `docs/${currentCategory}/${doc.filename}`,
          newPath: `docs/${suggestedFolder}/${doc.filename}`
        });
      } else if (suggestion.score >= 2) {
        // Strong signal - probably miscategorized
        miscategorized.push({
          title: doc.title.substring(0, 70),
          filename: doc.filename,
          currentCategory: doc.category,
          suggestedCategory: suggestion.suggested,
          score: suggestion.score,
          filepath: `docs/${currentCategory}/${doc.filename}`,
          newPath: `docs/${suggestedFolder}/${doc.filename}`
        });
      }
    }
  }
}

// Sort by score descending
miscategorized.sort((a, b) => b.score - a.score);

console.log('=== MISCATEGORIZED DOCUMENT ANALYSIS ===\n');
console.log(`Total documents: ${manifest.documents.length}`);
console.log(`Potentially miscategorized: ${miscategorized.length}\n`);

// Group by suggested category
const byNewCategory = {};
for (const doc of miscategorized) {
  if (!byNewCategory[doc.suggestedCategory]) byNewCategory[doc.suggestedCategory] = [];
  byNewCategory[doc.suggestedCategory].push(doc);
}

console.log('=== BY SUGGESTED CATEGORY ===\n');
for (const [category, docs] of Object.entries(byNewCategory).sort((a, b) => b[1].length - a[1].length)) {
  console.log(`\n${category.toUpperCase()} (${docs.length} to move):`);
  docs.slice(0, 10).forEach(d => {
    console.log(`  [${d.currentCategory}] → ${d.title.substring(0, 50)}...`);
  });
  if (docs.length > 10) {
    console.log(`  ... and ${docs.length - 10} more`);
  }
}

// Save move list
const moveList = miscategorized.map(d => `${d.filepath}\t${d.newPath}`);
fs.writeFileSync('category-moves.txt', moveList.join('\n'));
console.log(`\n\nMove list saved to: category-moves.txt`);

// Save detailed report
fs.writeFileSync('category-report.json', JSON.stringify({
  summary: {
    totalDocuments: manifest.documents.length,
    miscategorizedCount: miscategorized.length,
  },
  byNewCategory,
  miscategorized
}, null, 2));
console.log('Detailed report saved to: category-report.json');
