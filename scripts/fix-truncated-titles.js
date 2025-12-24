const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const DOCS_DIR = path.join(__dirname, '../docs');

// Known title corrections (research these or infer from content)
const TITLE_CORRECTIONS = {
  // Format: filename substring -> correct title
  'Did American Police Originate from Slave Patrols': 'Did American Police Originate from Slave Patrols?',
  'What Is Holding Back the Formation of a Global Prison': 'What Is Holding Back the Formation of a Global Prison Abolitionist Movement?',
  '100 Years Ago The Philadelphia dockers strike': '100 Years Ago: The Philadelphia Dockers Strike and Local 8 of the IWW',
  '100-years-ago-the-philadelphia': '100 Years Ago: The Philadelphia Dockers Strike and Local 8 of the IWW',
  'Staff at Anti-Mountaintop Removal Nonprofit': 'Staff at Anti-Mountaintop Removal Nonprofit Coal River Mountain Watch Unionize',
  '200 Years of Labor History Blackstone': '200 Years of Labor History: Blackstone River Valley National Historical Park',
  'About The Organization Of Anarchists In Ukraine': 'About The Organization Of Anarchists In Ukraine: Point Of View Of A Member',
  'Base Unions in Italy To Strike Against Destructive': 'Base Unions in Italy To Strike Against Destructive "Good Schools" Law',
  'Deliveroo Couriers Strike Against Poverty Pay': 'Deliveroo Couriers Strike Against Poverty Pay, Manchester',
  'International Day Against Police Brutality March': 'International Day Against Police Brutality - March 15',
  'Labor in the Age of Climate Change': 'Labor in the Age of Climate Change: A Just Transition To a Green Economy',
  'How A Railway Workers Union Won New Technology': 'How A Railway Workers Union Won New Technology That Improves Jobs And Safety',
  'Hubs Of Antifascism The Spanish Anarchist Press': 'Hubs Of Antifascism: The Spanish Anarchist Press In The United States',
  'I Am an Anarchist Remembering Anarchist Prisoner': 'I Am an Anarchist: Remembering Anarchist Prisoner Brian McCarvill',
  'If Its Jobs They Want Labour and the Unions': 'If It\'s Jobs They Want, Labour and the Unions Must Back Renewables Not Nuclear',
  'If We Must Die Bomani Shakurs Statement': 'If We Must Die: Bomani Shakur\'s Statement On Launching a Hunger Strike',
  'Green Unionism Done Right in Richmond': 'Green Unionism Done Right in Richmond: A Brief Review of the Roadmap To Richmond',
  'Factionalism in Transition a Comparison': 'Factionalism in Transition: A Comparison of Ruptures in the Spanish Anarchist Movement',
  'Fedao Has Concluded Their Organizing': 'FEDAO Has Concluded Their Organizing After The Release Of Their Incarcerated Comrades',
  'Do All Organizing Roads Lead To Bernie': 'Do All Organizing Roads Lead To Bernie? A Response To Eric Blanc\'s Interview',
  'Escape From Childhood John Holt': 'Escape From Childhood - John Holt',
  'Labor Rallies Against Fossil Fuel': 'Labor Rallies Against Fossil Fuel At Climate Rally in Oakland',
  'Labor Wars in the Us American Experience': 'Labor Wars in the US - American Experience - PBS',
  'Alameda County Central Labor Council Climate': 'Alameda County Central Labor Council: Climate and Environmental Justice Mission',
};

// Extract title from markdown content
function extractTitleFromContent(content) {
  // Look for H1 heading
  const h1Match = content.match(/^#\s+(.+)$/m);
  if (h1Match) {
    return h1Match[1].replace(/\*\*/g, '').trim();
  }

  // Look for bold heading at start
  const boldMatch = content.match(/^\*\*(.+?)\*\*/m);
  if (boldMatch) {
    return boldMatch[1].trim();
  }

  return null;
}

// Clean up title
function cleanTitle(title) {
  return title
    // Remove file artifacts
    .replace(/\s*aboutreaderurl=.*$/i, '')
    .replace(/\s*\*\*Source\*\*:.*$/i, '')
    .replace(/\s*\(\d+_\d+_\d+\s+\d+[：:]\d+[：:]\d+\s*[AP]M\)$/i, '')  // Remove timestamps
    .replace(/\s*-\s*Google Docs.*$/i, '')
    .replace(/\s*\|\s*The Anarchist Library.*$/i, '')
    .replace(/\s*___\s*The Anarchist Library.*$/i, '')
    // Fix underscores
    .replace(/_\s+/g, ': ')
    // Clean up
    .replace(/\s+/g, ' ')
    .trim();
}

function fixTruncatedTitles(dryRun = true) {
  console.log('📝 Fix Truncated Titles');
  console.log('═'.repeat(60));
  console.log(`Mode: ${dryRun ? '🔍 DRY RUN' : '✏️  APPLYING'}\n`);

  let scanned = 0, fixed = 0;
  const changes = [];

  function scanDir(dir) {
    for (const item of fs.readdirSync(dir)) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory() && !item.startsWith('.')) {
        scanDir(fullPath);
      } else if (item.endsWith('.md')) {
        scanned++;
        const content = fs.readFileSync(fullPath, 'utf8');
        let parsed;
        try {
          parsed = matter(content);
        } catch (e) {
          continue;
        }

        const currentTitle = parsed.data.title;
        if (!currentTitle) continue;

        let newTitle = null;

        // Check for known corrections
        for (const [pattern, correction] of Object.entries(TITLE_CORRECTIONS)) {
          if (currentTitle.includes(pattern) || item.includes(pattern.replace(/\s+/g, '-').toLowerCase())) {
            newTitle = correction;
            break;
          }
        }

        // Try to extract from content if title looks truncated
        if (!newTitle && currentTitle.length > 50) {
          const words = currentTitle.split(/\s+/);
          const lastWord = words[words.length - 1];
          // Check if truncated (short last word that's not common)
          if (lastWord && lastWord.length < 4 && !/^(the|a|an|of|and|in|to|for|on|is|it|or|as|be|us|uk|pdf|law)$/i.test(lastWord)) {
            const contentTitle = extractTitleFromContent(parsed.content);
            if (contentTitle && contentTitle.length > currentTitle.length) {
              newTitle = cleanTitle(contentTitle);
            }
          }
        }

        // Clean up titles with timestamps or artifacts
        if (!newTitle && /\(\d+_\d+_\d+.*[AP]M\)|aboutreaderurl|Google Docs/i.test(currentTitle)) {
          newTitle = cleanTitle(currentTitle);
        }

        if (newTitle && newTitle !== currentTitle && newTitle.length >= 10) {
          fixed++;
          changes.push({
            file: path.relative(DOCS_DIR, fullPath),
            from: currentTitle.slice(0, 60) + (currentTitle.length > 60 ? '...' : ''),
            to: newTitle.slice(0, 60) + (newTitle.length > 60 ? '...' : ''),
          });

          if (!dryRun) {
            parsed.data.title = newTitle;
            const newContent = matter.stringify(parsed.content, parsed.data);
            fs.writeFileSync(fullPath, newContent);
          }
        }
      }
    }
  }

  scanDir(DOCS_DIR);

  // Show changes
  console.log(`📋 Title Fixes (${changes.length}):\n`);
  for (const c of changes) {
    console.log(`   ${c.file}:`);
    console.log(`     FROM: "${c.from}"`);
    console.log(`     TO:   "${c.to}"`);
    console.log();
  }

  console.log(`${'═'.repeat(60)}`);
  console.log(`📊 Summary: ${scanned} scanned, ${fixed} fixed`);

  if (dryRun && fixed > 0) {
    console.log(`\n💡 Run with --apply to make changes`);
  }
}

const dryRun = !process.argv.includes('--apply');
fixTruncatedTitles(dryRun);
