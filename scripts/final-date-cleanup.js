const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const DOCS_DIR = path.join(__dirname, '../docs');

// Manual date assignments based on document context
const MANUAL_DATES = {
  // Bristol protests were 2021
  '7 Lies Police Have Told You About The Bristol Protests.md': { date: 2021, reason: 'Bristol protests 2021' },
  // Police organizing guides - contemporary
  'How You and Your Co-Workers Can Fck the Police.md': { date: 2020, reason: 'BLM era document' },
  'Police Powers Bill Preparing for Class War.md': { date: 2022, reason: 'UK Police Bill 2022' },
  'Police Station Support Guide.md': { date: 2020, reason: 'protest support guide' },
  // Autonomous Tenants Union content
  'autonomous-tenants-union-tactics-of-the-autonomous-tenants-union.md': { date: 2020, reason: 'ATU tactics guide' },
  // Education article
  '5 Reasons Why College Should Be Free _ UoPeople.md': { date: 2023, reason: 'education article' },
  // COVID-era strikes
  'Workers Launch Wave of Wildcat Strikes As Trump Pushes for \'Return to Work\' Amidst Exploding Coronav.md': { date: 2020, reason: 'COVID strikes' },
  // Union finance article
  'Article_unions-renewed-_-building-power-in-an-age-of-finance.md': { date: 2022, reason: 'union finance article' },
  // Cancel rent - COVID era
  'Cancel_rent_day_-_Ricochet.md': { date: 2020, reason: 'Cancel rent movement' },
  'COVID-19_Tenant_Organizing_Toolkit.md': { date: 2020, reason: 'COVID organizing' },
  // Academic article
  'Emotional_labor_as_emotion_regulation_investigated_with_ecological_momentary_ass.md': { date: 2019, reason: 'academic research' },
  // Tenants Together is ongoing org
  'Form_a_Tenants_Union_Tenants_Together.md': { date: 2020, reason: 'organizing guide' },
  // Strike organizing guides
  'How_to_organize_a_rent_strike.md': { date: 2020, reason: 'organizing guide' },
  'How_to_Strike.md': { date: 2020, reason: 'organizing guide' },
  // John Creaghe - historical anarchist (Sheffield 1890s)
  'john-creaghe-no-rent-in-sheffield.md': { date: 1893, reason: 'historical Sheffield rent strike' },
  // KEEPING YOUR RENT series - COVID organizing
  'KEEPING_YOUR_RENT_HOW_TO_ORGANIZE_YOUR_NEIGHBOURS.md': { date: 2020, reason: 'COVID rent organizing' },
  'KEEPING_YOUR_RENT_TENANT_EMAIL_TEMPLATE.md': { date: 2020, reason: 'COVID rent organizing' },
  'KEEPING_YOUR_RENT_WHY_KEEP_YOUR_RENT.md': { date: 2020, reason: 'COVID rent organizing' },
  // Kevin Carson - recent work
  'kevin-carson-the-rentier-economy-vulture-capital-and-enshittification.md': { date: 2024, reason: 'recent Kevin Carson' },
  // Rent strike organizing - COVID era
  'Rent_Strike_Organizing_Emergency_Episode_Rebel_Steps.md': { date: 2020, reason: 'COVID rent strike' },
  // Robert Anton Wilson - 1970s libertarian
  'robert-anton-wilson-the-permanent-universal-rent-strike.md': { date: 1971, reason: 'RAW 1970s writing' },
  // Strike declarations
  'Strike_Declarations.md': { date: 2020, reason: 'organizing document' },
  // LA rent strike - 2020
  'These_Tenants_Are_Leading_the_Largest_Rent_Strike_in_L.md': { date: 2020, reason: 'LA rent strike' },
  // Notes file - current
  'PROPERTY_DATA_GAPS.md': { date: 2025, reason: 'project notes' },
  // Murray Bookchin compilation - 2007 edition
  'Social ecology and Communalism_Murray Bookchin_liber3.md': { date: 2007, reason: 'Bookchin compilation' }
};

function applyManualDates() {
  let fixed = 0;

  function processDir(dir) {
    for (const item of fs.readdirSync(dir)) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory() && !item.startsWith('.')) {
        processDir(fullPath);
      } else if (item.endsWith('.md')) {
        // Check if this file needs a manual date
        const manual = MANUAL_DATES[item];
        if (!manual) continue;

        const content = fs.readFileSync(fullPath, 'utf8');
        let parsed;
        try {
          parsed = matter(content);
        } catch (e) {
          continue;
        }

        // Skip if already has date
        if (parsed.data.date) continue;

        // Apply the manual date
        parsed.data.date = manual.date;
        const newContent = matter.stringify(parsed.content, parsed.data);
        fs.writeFileSync(fullPath, newContent);
        fixed++;
        console.log(`[${manual.reason}] ${item.slice(0, 50)}: ${manual.date}`);
      }
    }
  }

  processDir(DOCS_DIR);
  return fixed;
}

console.log('=== Final Date Cleanup ===\n');
const fixed = applyManualDates();
console.log(`\nFixed ${fixed} documents with manual dates`);
