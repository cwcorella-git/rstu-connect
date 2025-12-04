const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const DOCS_DIR = path.join(__dirname, '../docs');
const OUTPUT_DIR = path.join(__dirname, '../src/data');
const PUBLIC_DIR = path.join(__dirname, '../public/documents');

function generateManifest() {
  const documents = [];
  const categories = new Set();

  // Scan all .md files in docs/
  const files = fs.readdirSync(DOCS_DIR).filter(f => f.endsWith('.md'));

  files.forEach(filename => {
    const filepath = path.join(DOCS_DIR, filename);
    const content = fs.readFileSync(filepath, 'utf8');
    const { data, content: markdown } = matter(content);

    // Auto-detect category
    const category = detectCategory(filename);
    categories.add(category);

    // Generate metadata
    const id = filename.replace('.md', '').replace(/[^a-z0-9]+/gi, '-').toLowerCase();
    const title = data.title || filename.replace('.md', '').replace(/[-_]/g, ' ');
    const excerpt = markdown.slice(0, 200).replace(/[#*`]/g, '').trim();
    const wordCount = markdown.split(/\s+/).length;
    const slug = id;

    documents.push({
      id,
      title,
      filename,
      category,
      excerpt,
      wordCount,
      lastModified: fs.statSync(filepath).mtime,
      tags: data.tags || [],
      slug
    });

    // Copy to public/ for serving
    const categoryDir = path.join(PUBLIC_DIR, category);
    if (!fs.existsSync(categoryDir)) fs.mkdirSync(categoryDir, { recursive: true });
    fs.copyFileSync(filepath, path.join(categoryDir, filename));
  });

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
