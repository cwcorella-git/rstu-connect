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

        documents.push({
          id,
          title,
          filename: item,
          category,
          excerpt,
          wordCount,
          lastModified: fs.statSync(fullPath).mtime,
          tags: data.tags || [],
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

generateManifest();
