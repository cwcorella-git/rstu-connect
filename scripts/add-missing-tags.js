#!/usr/bin/env node
/**
 * Add missing tags to documents based on title keywords and category
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const DOCS_DIR = path.join(__dirname, '../docs');

// Keyword to tag mappings (from generate-reading-manifest.js, expanded)
const KEYWORD_MAPPINGS = [
  // Action types
  { patterns: [/general strike/i, /general-strike/i], tag: 'general strikes' },
  { patterns: [/rent strike/i], tag: 'rent strikes' },
  { patterns: [/\bstrike\b/i, /walkout/i, /textile/i], tag: 'strikes' },
  { patterns: [/protest/i, /demonstration/i, /\bmarch\b/i], tag: 'protests' },
  { patterns: [/\briot/i, /uprising/i, /rebellion/i, /revolt/i], tag: 'riots' },
  { patterns: [/boycott/i], tag: 'boycotts' },
  { patterns: [/occupation/i, /\boccupy\b/i], tag: 'occupations' },
  { patterns: [/direct action/i], tag: 'direct action' },
  { patterns: [/civil disobedience/i, /non-cooperation/i, /noncooperation/i], tag: 'civil disobedience' },
  { patterns: [/blockade/i, /barricade/i], tag: 'blockades' },
  { patterns: [/nonviolence/i, /non-violence/i, /nonviolent/i], tag: 'nonviolence' },

  // Organizations & movements
  { patterns: [/tenant/i, /renter/i], tag: 'tenants' },
  { patterns: [/\bunion\b/i, /\biww\b/i, /\bafl\b/i, /\bcio\b/i, /wobbl/i], tag: 'unions' },
  { patterns: [/anarchi/i, /anarch/i], tag: 'anarchism' },
  { patterns: [/communist/i, /marxist/i, /socialist/i, /marxism/i], tag: 'socialism' },
  { patterns: [/syndicalis/i], tag: 'syndicalism' },
  { patterns: [/feminism/i, /feminist/i], tag: 'feminism' },
  { patterns: [/\bwomen/i, /woman/i], tag: 'women' },
  { patterns: [/mutual aid/i], tag: 'mutual aid' },
  { patterns: [/solidarity/i], tag: 'solidarity' },
  { patterns: [/organiz(e|ing|er)/i], tag: 'organizing' },
  { patterns: [/communit/i, /neighborhood/i, /neighbour/i], tag: 'community' },
  { patterns: [/cooperativ/i, /co-op/i, /\bcoop\b/i], tag: 'cooperatives' },
  { patterns: [/antifa/i, /anti-fascis/i, /antifascis/i], tag: 'antifascism' },
  { patterns: [/autonomy/i, /autonomous/i, /black autonomy/i], tag: 'autonomy' },
  { patterns: [/municipalis/i], tag: 'municipalism' },

  // Issues
  { patterns: [/housing/i, /eviction/i, /\brent\b/i, /landlord/i, /homeless/i, /dwelling/i], tag: 'housing' },
  { patterns: [/police/i, /\bcop\b/i, /\bcops\b/i, /law enforcement/i, /policing/i], tag: 'police' },
  { patterns: [/prison/i, /jail/i, /incarcerat/i], tag: 'prisons' },
  { patterns: [/abolition/i, /abolitionist/i, /abolish/i], tag: 'abolition' },
  { patterns: [/labor/i, /labour/i, /worker/i, /wage/i, /employ/i, /\bjob\b/i], tag: 'labor' },
  { patterns: [/climate/i, /environment/i, /ecological/i, /ecology/i, /renewable/i], tag: 'environment' },
  { patterns: [/immigrant/i, /migration/i, /deportat/i, /border/i], tag: 'immigration' },
  { patterns: [/racial/i, /racism/i, /black lives/i, /anti-black/i], tag: 'racial justice' },
  { patterns: [/gentrif/i], tag: 'gentrification' },
  { patterns: [/indigenous/i, /native/i, /tribal/i], tag: 'indigenous' },
  { patterns: [/anti-war/i, /antiwar/i, /\bwar\b/i, /peace\b/i, /pacifis/i], tag: 'anti-war' },
  { patterns: [/property/i], tag: 'property' },
  { patterns: [/\bfood\b/i, /hunger/i, /agricult/i, /\bfarm/i], tag: 'food' },
  { patterns: [/education/i, /school/i, /teacher/i, /student/i, /college/i], tag: 'education' },
  { patterns: [/health/i, /medical/i, /hospital/i], tag: 'healthcare' },
  { patterns: [/democra/i], tag: 'democracy' },
  { patterns: [/\bdebt\b/i, /credit/i], tag: 'debt' },
  { patterns: [/capital/i, /capitalis/i], tag: 'capitalism' },
  { patterns: [/urban/i, /\bcity\b/i, /cities/i, /municipal/i], tag: 'urban' },
  { patterns: [/commons/i, /common good/i], tag: 'commons' },
  { patterns: [/liberty/i, /freedom/i], tag: 'liberty' },
  { patterns: [/class\b/i, /working class/i, /class struggle/i], tag: 'class' },
  { patterns: [/pipeline/i, /fossil fuel/i, /oil/i, /\bgas\b/i], tag: 'fossil fuels' },
  { patterns: [/just transition/i], tag: 'just transition' },
  { patterns: [/deliveroo/i, /uber/i, /gig economy/i, /platform/i], tag: 'gig economy' },
  { patterns: [/railroad/i, /railway/i, /rail worker/i], tag: 'railroads' },
  { patterns: [/queer/i, /lgbt/i, /trans\b/i], tag: 'LGBTQ+' },
  { patterns: [/disability/i, /disabled/i, /ableism/i], tag: 'disability' },

  // Thinkers/Authors
  { patterns: [/kropotkin/i, /conquest of bread/i], tag: 'Kropotkin' },
  { patterns: [/bakunin/i], tag: 'Bakunin' },
  { patterns: [/bookchin/i], tag: 'Bookchin' },
  { patterns: [/graeber/i], tag: 'Graeber' },
  { patterns: [/goldman/i, /emma goldman/i], tag: 'Emma Goldman' },
  { patterns: [/berkman/i], tag: 'Berkman' },
  { patterns: [/proudhon/i], tag: 'Proudhon' },
  { patterns: [/malatesta/i], tag: 'Malatesta' },

  // Regions
  { patterns: [/nevada/i, /\breno\b/i, /sparks/i, /washoe/i], tag: 'Nevada' },
  { patterns: [/los angeles/i, /\bla\b/i], tag: 'Los Angeles' },
  { patterns: [/new york/i, /\bnyc\b/i], tag: 'New York' },
  { patterns: [/seattle/i], tag: 'Seattle' },
  { patterns: [/chicago/i], tag: 'Chicago' },
  { patterns: [/britain/i, /british/i, /\buk\b/i, /england/i, /united kingdom/i], tag: 'United Kingdom' },
  { patterns: [/india/i, /indian/i], tag: 'India' },
  { patterns: [/ukraine/i, /ukrainian/i], tag: 'Ukraine' },
  { patterns: [/russia/i, /russian/i], tag: 'Russia' },
  { patterns: [/spain/i, /spanish/i, /catalan/i], tag: 'Spain' },
  { patterns: [/france/i, /french/i, /paris/i], tag: 'France' },
  { patterns: [/germany/i, /german/i, /berlin/i], tag: 'Germany' },
  { patterns: [/mexico/i, /mexican/i, /zapatista/i], tag: 'Mexico' },
  { patterns: [/canada/i, /canadian/i], tag: 'Canada' },
  { patterns: [/australia/i, /australian/i], tag: 'Australia' },
  { patterns: [/sweden/i, /swedish/i], tag: 'Sweden' },
  { patterns: [/ireland/i, /irish/i], tag: 'Ireland' },
  { patterns: [/italy/i, /italian/i], tag: 'Italy' },
  { patterns: [/kurdish/i, /kurdistan/i, /rojava/i], tag: 'Kurdistan' },
  { patterns: [/palestine/i, /palestinian/i, /gaza/i], tag: 'Palestine' },
];

// Category to default tags
const CATEGORY_TAGS = {
  'abolition': ['abolition', 'police', 'prisons'],
  'labor': ['labor', 'unions', 'workers'],
  'housing': ['housing', 'tenants'],
  'feminist-theory': ['feminism'],
  'environmental-justice': ['environment', 'climate'],
  'organizing': ['organizing'],
  'theory': ['theory'],
  'anti-war-peace': ['anti-war', 'peace'],
  'economic-alternatives': ['economics', 'alternatives'],
  'international-solidarity': ['international', 'solidarity'],
  'indigenous-solidarity': ['indigenous', 'solidarity'],
  'disability-justice': ['disability', 'justice'],
  'food-justice': ['food', 'justice'],
  'youth-student-organizing': ['students', 'youth'],
  'technology-digital-justice': ['technology', 'digital rights'],
  'legislation': ['legislation', 'Nevada'],
};

function extractTags(title, filename, category) {
  const text = `${title} ${filename}`.toLowerCase();
  const tags = new Set();

  // Extract from keywords
  for (const mapping of KEYWORD_MAPPINGS) {
    for (const pattern of mapping.patterns) {
      if (pattern.test(text)) {
        tags.add(mapping.tag);
        break;
      }
    }
  }

  // Add category-based tags if we have very few tags
  if (tags.size < 2) {
    const categoryFolder = category.toLowerCase().replace(/\s+/g, '-');
    const categoryTags = CATEGORY_TAGS[categoryFolder] || [];
    categoryTags.forEach(t => tags.add(t));
  }

  return Array.from(tags).slice(0, 7); // Max 7 tags
}

function updateDocumentTags(filePath, newTags) {
  const content = fs.readFileSync(filePath, 'utf8');

  // Parse frontmatter
  let parsed;
  try {
    parsed = matter(content);
  } catch (err) {
    return false;
  }

  // Skip if already has tags
  if (parsed.data.tags && parsed.data.tags.length > 0) {
    return false;
  }

  // Add tags
  parsed.data.tags = newTags;

  // Rebuild content
  const newContent = matter.stringify(parsed.content, parsed.data);
  fs.writeFileSync(filePath, newContent);
  return true;
}

// Scan all documents
console.log('=== ADDING MISSING TAGS ===\n');

let updated = 0;
let skipped = 0;
let failed = 0;

function scanDirectory(dir) {
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory() && !item.startsWith('.')) {
      scanDirectory(fullPath);
    } else if (item.endsWith('.md')) {
      const relativePath = path.relative(DOCS_DIR, fullPath);
      const parts = relativePath.split(path.sep);
      const category = parts.length > 1 ? parts[0] : 'misc';

      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        const parsed = matter(content);

        // Skip if already has tags
        if (parsed.data.tags && parsed.data.tags.length > 0) {
          skipped++;
          continue;
        }

        const title = parsed.data.title || item.replace('.md', '');
        const newTags = extractTags(title, item, category);

        if (newTags.length > 0) {
          if (updateDocumentTags(fullPath, newTags)) {
            updated++;
            if (updated <= 20) {
              console.log(`+ ${relativePath}`);
              console.log(`  Tags: ${newTags.join(', ')}`);
            }
          } else {
            failed++;
          }
        } else {
          skipped++;
        }
      } catch (err) {
        failed++;
      }
    }
  }
}

scanDirectory(DOCS_DIR);

console.log(`\n=== SUMMARY ===`);
console.log(`Updated: ${updated}`);
console.log(`Skipped (already tagged): ${skipped}`);
console.log(`Failed: ${failed}`);
