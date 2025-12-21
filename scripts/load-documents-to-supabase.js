#!/usr/bin/env node
/**
 * Load all reading documents into Supabase
 * Run: node scripts/load-documents-to-supabase.js
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Supabase credentials
const SUPABASE_URL = 'https://dxkwzvweaqlhmpwgpzsa.supabase.co';
const SUPABASE_KEY = 'sb_publishable_cDaWuFY-msonrx-m1uRZaw_PwE-LshY';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Document directories
const DOCS_DIR = path.join(__dirname, '../docs');
const PUBLIC_DOCS_DIR = path.join(__dirname, '../public/documents');

/**
 * Parse YAML frontmatter from markdown
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return { frontmatter: {}, body: content };

  const frontmatter = {};
  const lines = match[1].split('\n');

  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      let value = line.substring(colonIndex + 1).trim();
      // Remove quotes
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      frontmatter[key] = value;
    }
  }

  const body = content.substring(match[0].length).trim();
  return { frontmatter, body };
}

/**
 * Generate excerpt from markdown body
 */
function generateExcerpt(body, maxLength = 200) {
  // Remove markdown formatting
  const text = body
    .replace(/#{1,6}\s+/g, '')  // Headers
    .replace(/\*\*([^*]+)\*\*/g, '$1')  // Bold
    .replace(/\*([^*]+)\*/g, '$1')  // Italic
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')  // Links
    .replace(/```[\s\S]*?```/g, '')  // Code blocks
    .replace(/`([^`]+)`/g, '$1')  // Inline code
    .replace(/>\s+/g, '')  // Blockquotes
    .replace(/\n+/g, ' ')  // Newlines
    .trim();

  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
}

/**
 * Generate slug from filename
 */
function generateSlug(filename, category) {
  const name = path.basename(filename, '.md');
  return `${category}/${name}`;
}

/**
 * Load documents from a directory
 */
function loadDocumentsFromDir(baseDir) {
  const documents = [];

  if (!fs.existsSync(baseDir)) {
    console.log(`Directory not found: ${baseDir}`);
    return documents;
  }

  const categories = fs.readdirSync(baseDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  for (const category of categories) {
    const categoryPath = path.join(baseDir, category);
    const files = fs.readdirSync(categoryPath)
      .filter(f => f.endsWith('.md'));

    for (const file of files) {
      const filePath = path.join(categoryPath, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const { frontmatter, body } = parseFrontmatter(content);

      const id = `${category}-${path.basename(file, '.md')}`;
      const doc = {
        id,
        title: frontmatter.title || path.basename(file, '.md').replace(/-/g, ' '),
        author: frontmatter.author || null,
        date: frontmatter.date ? String(frontmatter.date) : null,
        category,
        filename: file,
        slug: generateSlug(file, category),
        excerpt: generateExcerpt(body),
        content: body.substring(0, 50000),  // Limit to 50KB per doc
      };

      documents.push(doc);
    }
  }

  return documents;
}

async function loadDocuments() {
  console.log('Loading documents from docs directories...');

  // Load from both docs/ and public/documents/
  const documents = [
    ...loadDocumentsFromDir(DOCS_DIR),
    ...loadDocumentsFromDir(PUBLIC_DOCS_DIR),
  ];

  // Deduplicate by id
  const uniqueDocs = Array.from(
    new Map(documents.map(d => [d.id, d])).values()
  );

  console.log(`Found ${uniqueDocs.length} unique documents`);

  if (uniqueDocs.length === 0) {
    console.log('No documents found. Check docs/ and public/documents/ directories.');
    return;
  }

  // Upload in batches of 100
  const BATCH_SIZE = 100;
  let uploaded = 0;
  let errors = 0;

  for (let i = 0; i < uniqueDocs.length; i += BATCH_SIZE) {
    const batch = uniqueDocs.slice(i, i + BATCH_SIZE);

    const { error } = await supabase
      .from('documents')
      .upsert(batch, { onConflict: 'id' });

    if (error) {
      console.error(`Error uploading batch ${i}-${i + batch.length}:`, error.message);
      errors += batch.length;
    } else {
      uploaded += batch.length;
      process.stdout.write(`\rUploaded ${uploaded}/${uniqueDocs.length} documents...`);
    }
  }

  console.log(`\n\nDone! Uploaded: ${uploaded}, Errors: ${errors}`);

  // Verify count
  const { count } = await supabase
    .from('documents')
    .select('*', { count: 'exact', head: true });

  console.log(`Total documents in Supabase: ${count}`);

  // Show categories
  const { data: categories } = await supabase
    .from('documents')
    .select('category')
    .order('category');

  if (categories) {
    const catCounts = {};
    for (const row of categories) {
      catCounts[row.category] = (catCounts[row.category] || 0) + 1;
    }
    console.log('\nDocuments by category:');
    for (const [cat, count] of Object.entries(catCounts).sort()) {
      console.log(`  ${cat}: ${count}`);
    }
  }
}

loadDocuments().catch(console.error);
