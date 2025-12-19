const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const DOCS_DIR = path.join(__dirname, '../docs');
const OUTPUT_DIR = path.join(__dirname, '../src/data');
const PUBLIC_DIR = path.join(__dirname, '../public/documents');

function generateManifest() {
  const documents = [];
  const categories = new Set();

  // Recursively scan for markdown files
  function scanDirectory(dir, depth = 0) {
    const items = fs.readdirSync(dir);

    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        // Skip hidden directories and node_modules
        if (!item.startsWith('.') && item !== 'node_modules') {
          scanDirectory(fullPath, depth + 1);
        }
      } else if (item.endsWith('.md')) {
        const relativePath = path.relative(DOCS_DIR, fullPath);
        const content = fs.readFileSync(fullPath, 'utf8');
        let data, markdown;

        try {
          const parsed = matter(content);
          data = parsed.data;
          markdown = parsed.content;
        } catch (err) {
          console.warn(`⚠️  Skipping ${relativePath}: Invalid frontmatter`);
          return;
        }

        // Determine category from directory structure or filename
        const parts = relativePath.split(path.sep);
        let category;

        if (parts.length > 1) {
          // Use first subdirectory as category
          category = formatCategoryName(parts[0]);
        } else {
          // Auto-detect category from filename
          category = detectCategory(item);
        }

        categories.add(category);

        // Generate metadata
        const id = relativePath.replace(/\.md$/, '').replace(/[^a-z0-9]+/gi, '-').toLowerCase();
        const rawTitle = data.title || item.replace('.md', '').replace(/[-_]/g, ' ');
        const title = String(rawTitle).substring(0, 200); // Ensure it's a string and limit length
        const excerpt = markdown.slice(0, 200).replace(/[#*`]/g, '').trim();
        const wordCount = markdown.split(/\s+/).length;
        const slug = id;

        // Extract tags from frontmatter, content, or title keywords
        let tags = data.tags || [];
        if (tags.length === 0) {
          tags = extractTagsFromContent(markdown);
        }
        if (tags.length === 0) {
          tags = extractTagsFromTitle(title);
        }

        documents.push({
          id,
          title,
          filename: item,
          category,
          excerpt,
          wordCount,
          lastModified: fs.statSync(fullPath).mtime,
          tags,
          slug
        });

        // Copy to public/ for serving
        const categoryDir = path.join(PUBLIC_DIR, category);
        if (!fs.existsSync(categoryDir)) fs.mkdirSync(categoryDir, { recursive: true });
        fs.copyFileSync(fullPath, path.join(categoryDir, item));
      }
    });
  }

  scanDirectory(DOCS_DIR);

  // Sort by category, then title
  documents.sort((a, b) => {
    if (a.category !== b.category) return a.category.localeCompare(b.category);
    return a.title.localeCompare(b.title);
  });

  const manifest = {
    documents,
    categories: Array.from(categories).sort(),
    totalDocuments: documents.length
  };

  // Write manifest
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'reading-manifest.json'),
    JSON.stringify(manifest, null, 2)
  );

  console.log(`✅ Generated manifest: ${documents.length} documents, ${categories.size} categories`);
}

function formatCategoryName(dirName) {
  // Convert directory names to proper category names
  return dirName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function detectCategory(filename) {
  const lower = filename.toLowerCase();

  if (lower.includes('assembly-bill') || lower.includes('senate-bill')) return 'Legislation';
  if (lower.includes('agenda') || lower.match(/\d{1,2}-\d{1,2}-\d{4}/)) return 'Meeting Minutes';
  if (lower.includes('organize') || lower.includes('handbook')) return 'Organizing Guides';
  if (lower.includes('intelligence') || lower.includes('strategy')) return 'Strategic Intelligence';
  if (lower.includes('report') || lower.includes('research')) return 'Research Reports';
  if (lower.includes('communication') || lower.includes('content')) return 'Content & Communication';

  return 'Other Resources';
}

// Extract tags from title keywords
function extractTagsFromTitle(title) {
  const titleLower = title.toLowerCase();
  const tags = [];

  // Keyword mappings: [keyword patterns] -> tag
  const keywordMappings = [
    // Action types
    { patterns: ['general strike', 'general-strike'], tag: 'general strikes' },
    { patterns: ['rent strike'], tag: 'rent strikes' },
    { patterns: ['strike', 'walkout', 'textile'], tag: 'strikes' },
    { patterns: ['protest', 'demonstration', 'march'], tag: 'protests' },
    { patterns: ['riot', 'uprising', 'rebellion', 'revolt'], tag: 'riots' },
    { patterns: ['boycott'], tag: 'boycotts' },
    { patterns: ['occupation', 'occupy'], tag: 'occupations' },
    { patterns: ['direct action'], tag: 'direct action' },
    { patterns: ['civil disobedience', 'non-cooperation', 'noncooperation'], tag: 'civil disobedience' },
    { patterns: ['blockade', 'barricade'], tag: 'blockades' },
    { patterns: ['nonviolence', 'non-violence', 'nonviolent'], tag: 'nonviolence' },

    // Organizations & movements
    { patterns: ['tenant', 'renter'], tag: 'tenants' },
    { patterns: ['union', 'iww', 'afl', 'cio', 'wobbl'], tag: 'unions' },
    { patterns: ['anarchi', 'anarch'], tag: 'anarchism' },
    { patterns: ['communist', 'marxist', 'socialist', 'marxism'], tag: 'socialism' },
    { patterns: ['syndicalis'], tag: 'syndicalism' },
    { patterns: ['feminism', 'feminist', 'women'], tag: 'feminism' },
    { patterns: ['mutual aid'], tag: 'mutual aid' },
    { patterns: ['solidarity'], tag: 'solidarity' },
    { patterns: ['organizing', 'organizer', 'organis'], tag: 'organizing' },
    { patterns: ['communit', 'neighborhood', 'neighbour'], tag: 'community' },
    { patterns: ['cooperativ', 'co-op', 'coop'], tag: 'cooperatives' },
    { patterns: ['antifa', 'anti-fascis', 'antifascis'], tag: 'antifascism' },
    { patterns: ['autonomy', 'autonomous', 'black autonomy'], tag: 'autonomy' },
    { patterns: ['municipalis'], tag: 'municipalism' },

    // Issues
    { patterns: ['housing', 'eviction', 'rent', 'landlord', 'homeless', 'dwelling'], tag: 'housing' },
    { patterns: ['police', 'cop ', 'cops ', 'law enforcement', 'policing', 'fire the cop'], tag: 'police' },
    { patterns: ['prison', 'jail', 'incarcerat'], tag: 'prisons' },
    { patterns: ['abolition', 'abolitionist', 'abolish'], tag: 'abolition' },
    { patterns: ['labor', 'labour', 'worker', 'wage', 'employ', 'job', 'bullshit job'], tag: 'labor' },
    { patterns: ['climate', 'environment', 'ecological', 'ecology', 'energy', 'renewable'], tag: 'environment' },
    { patterns: ['immigrant', 'migration', 'deportat', 'border'], tag: 'immigration' },
    { patterns: ['racial', 'racism', 'black lives', 'anti-black'], tag: 'racial justice' },
    { patterns: ['gentrif'], tag: 'gentrification' },
    { patterns: ['indigenous', 'native', 'tribal'], tag: 'indigenous' },
    { patterns: ['anti-war', 'antiwar', 'war ', 'peace ', 'pacifis'], tag: 'anti-war' },
    { patterns: ['property', 'private property'], tag: 'property' },
    { patterns: ['food', 'hunger', 'agricult', 'farm', 'grain'], tag: 'food' },
    { patterns: ['education', 'school', 'teacher', 'student', 'college', 'childhood'], tag: 'education' },
    { patterns: ['health', 'medical', 'hospital'], tag: 'healthcare' },
    { patterns: ['democra'], tag: 'democracy' },
    { patterns: ['debt', 'credit'], tag: 'debt' },
    { patterns: ['capital', 'capitalis'], tag: 'capitalism' },
    { patterns: ['urban', 'city ', 'cities', 'municipal', 'arcology'], tag: 'urban' },
    { patterns: ['commons', 'common good'], tag: 'commons' },
    { patterns: ['state violence', 'state power', 'violence'], tag: 'state violence' },
    { patterns: ['liberty', 'freedom'], tag: 'liberty' },
    { patterns: ['civilization', 'civilisation'], tag: 'civilization' },
    { patterns: ['investor', 'investment', 'specul'], tag: 'investment' },
    { patterns: ['class ', 'working class', 'class struggle'], tag: 'class' },

    // Authors (for classic texts)
    { patterns: ['kropotkin', 'conquest of bread', 'appeal to the young'], tag: 'Kropotkin' },
    { patterns: ['bakunin', 'capitalist system'], tag: 'Bakunin' },
    { patterns: ['bookchin', 'municipalism'], tag: 'Bookchin' },
    { patterns: ['graeber'], tag: 'Graeber' },
    { patterns: ['kevin carson', 'carson', 'mutualist'], tag: 'Kevin Carson' },
    { patterns: ['vitale', 'end of policing'], tag: 'police' },
    { patterns: ['palaces for the people', 'klinenberg'], tag: 'community' },

    // RSTU/Nevada specific
    { patterns: ['rstu', 'reno-sparks tenant', 'reno sparks tenant'], tag: 'RSTU' },
    { patterns: ['nevada', ' reno', 'sparks', 'washoe'], tag: 'Nevada' },
    { patterns: ['assembly bill', 'senate bill', 'ab ', 'sb ', 'legislat', 'veto'], tag: 'legislation' },
    { patterns: ['meeting', 'agenda', 'minutes'], tag: 'meetings' },
    { patterns: ['bylaws', 'bylaw'], tag: 'bylaws' },

    // Regions
    { patterns: ['los angeles', ' la ', 'l.a.'], tag: 'Los Angeles' },
    { patterns: ['new york', ' nyc', 'n.y.c'], tag: 'New York' },
    { patterns: ['seattle'], tag: 'Seattle' },
    { patterns: ['chicago'], tag: 'Chicago' },
    { patterns: ['britain', 'british', 'uk ', 'u.k.', 'england', 'united kingdom', 'sheffield'], tag: 'United Kingdom' },
    { patterns: ['india', 'indian'], tag: 'India' },
    { patterns: ['ukraine', 'ukrainian'], tag: 'Ukraine' },
    { patterns: ['russia', 'russian'], tag: 'Russia' },
    { patterns: ['spain', 'spanish', 'catalan'], tag: 'Spain' },
    { patterns: ['france', 'french', 'paris'], tag: 'France' },
    { patterns: ['germany', 'german', 'berlin'], tag: 'Germany' },
    { patterns: ['mexico', 'mexican'], tag: 'Mexico' },
    { patterns: ['canada', 'canadian'], tag: 'Canada' },
    { patterns: ['australia', 'australian'], tag: 'Australia' },
    { patterns: ['lawrence', 'massachusetts'], tag: 'Massachusetts' },
    { patterns: ['minneapolis', 'minnesota'], tag: 'Minnesota' },
  ];

  for (const mapping of keywordMappings) {
    for (const pattern of mapping.patterns) {
      if (titleLower.includes(pattern)) {
        if (!tags.includes(mapping.tag)) {
          tags.push(mapping.tag);
        }
        break;
      }
    }
    if (tags.length >= 5) break; // Max 5 tags from title
  }

  return tags;
}

function extractTagsFromContent(markdown) {
  // Look for tags in various formats:
  // **Tags:** tag1, tag2, tag3
  // Tags: tag1, tag2, tag3 (inside code blocks or plain)
  const patterns = [
    /\*\*Tags:\*\*\s*([^\n]+)/i,           // Bold markdown: **Tags:** ...
    /^Tags:\s*([^\n]+)/m,                   // Plain: Tags: ...
    /`[^`]*Tags:\s*([^`\n]+)/i,            // Inside code block
  ];

  for (const pattern of patterns) {
    const match = markdown.match(pattern);
    if (match && match[1]) {
      // Split by comma and clean up
      const tags = match[1]
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0 && t.length < 50) // Filter out empty and overly long tags
        .slice(0, 10); // Max 10 tags

      if (tags.length > 0) {
        return tags;
      }
    }
  }

  return [];
}

generateManifest();
