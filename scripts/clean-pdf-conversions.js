#!/usr/bin/env node

/**
 * Clean up badly converted PDF documents in the docs/ folder
 *
 * Removes:
 * - PDF conversion metadata (Converted from, Total pages, File size, Converted:)
 * - Page markers (## Page 1, ## Page 2, etc.)
 * - Figures and Images sections
 * - Complete Page View sections
 * - Extracted Text headers
 * - Broken image references
 * - Page footers (X of Y, timestamps)
 */

const fs = require('fs')
const path = require('path')

const DOCS_DIR = path.join(__dirname, '..', 'docs')

// Patterns to identify PDF-converted documents
const PDF_ARTIFACT_PATTERNS = [
  /\*Converted from:.*\.pdf.*\*\s*/gi,
  /\*Total pages:.*\*\s*/gi,
  /\*File size:.*\*\s*/gi,
  /\*Converted:.*\*\s*/gi,
]

// Patterns to remove
const REMOVE_PATTERNS = [
  // Conversion metadata block
  /\*Converted from:.*\n\*Total pages:.*\n\*File size:.*\n\*Converted:.*\n+---\n*/gi,
  // Single metadata lines
  /\*Converted from:.*\.pdf.*\*\s*\n?/gi,
  /\*Total pages:.*\*\s*\n?/gi,
  /\*File size:.*\*\s*\n?/gi,
  /\*Converted:.*\*\s*\n?/gi,
  // Page markers
  /^## Page \d+\s*\n+/gm,
  /^---\s*\n+## Page \d+\s*\n*/gm,
  // Figures and Images sections
  /### Figures and Images.*\n(?:.*\n)*?(?=###|---|\n\n)/gi,
  /#### Figure:.*\n!\[.*\]\(.*\)\s*\n*/gi,
  // Complete Page View sections
  /### Complete Page View\s*\n!\[.*\]\(.*\)\s*\n*/gi,
  /### Complete Page View\s*\n*/gi,
  // Extracted Text headers
  /### Extracted Text\s*\n+/gi,
  // Broken image references
  /!\[.*\]\(images\/page_\d+.*\)\s*\n*/gi,
  // Page footers (X of Y format and timestamps)
  /^\d+ of \d+\s+\d+\/\d+\/\d+,?\s*\d+:\d+\s*(AM|PM)?\s*$/gm,
  // Standalone horizontal rules after cleanup
  /\n---\s*\n---/g,
  // Multiple consecutive blank lines
  /\n{4,}/g,
  // URLs appearing alone on lines (from headers/footers)
  /^https?:\/\/[^\s]+\s*$/gm,
]

function isPdfConverted(content) {
  return PDF_ARTIFACT_PATTERNS.some(pattern => pattern.test(content))
}

function cleanDocument(content) {
  let cleaned = content

  for (const pattern of REMOVE_PATTERNS) {
    cleaned = cleaned.replace(pattern, '\n\n')
  }

  // Clean up excessive whitespace
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n')
  cleaned = cleaned.replace(/^\s+/gm, '')  // Remove leading spaces on lines

  // Remove orphaned horizontal rules
  cleaned = cleaned.replace(/\n---\n(?=\n---)/g, '\n')

  return cleaned.trim()
}

function findPdfConvertedDocs() {
  const results = []

  function walkDir(dir) {
    const files = fs.readdirSync(dir)
    for (const file of files) {
      const filePath = path.join(dir, file)
      const stat = fs.statSync(filePath)

      if (stat.isDirectory()) {
        walkDir(filePath)
      } else if (file.endsWith('.md')) {
        const content = fs.readFileSync(filePath, 'utf8')
        if (isPdfConverted(content)) {
          results.push(filePath)
        }
      }
    }
  }

  walkDir(DOCS_DIR)
  return results
}

function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const verbose = args.includes('--verbose')
  const singleFile = args.find(a => !a.startsWith('--'))

  console.log('PDF Document Cleaner')
  console.log('====================')

  if (dryRun) {
    console.log('DRY RUN - no files will be modified\n')
  }

  let files
  if (singleFile) {
    files = [singleFile]
  } else {
    files = findPdfConvertedDocs()
    console.log(`Found ${files.length} PDF-converted documents\n`)
  }

  let cleaned = 0
  let errors = 0

  for (const filePath of files) {
    try {
      const content = fs.readFileSync(filePath, 'utf8')
      const cleanedContent = cleanDocument(content)

      if (content !== cleanedContent) {
        const relPath = path.relative(process.cwd(), filePath)
        console.log(`Cleaning: ${relPath}`)

        if (verbose) {
          const removed = content.length - cleanedContent.length
          console.log(`  Removed ${removed} characters (${Math.round(removed/content.length*100)}%)`)
        }

        if (!dryRun) {
          fs.writeFileSync(filePath, cleanedContent)
        }
        cleaned++
      }
    } catch (err) {
      console.error(`Error processing ${filePath}: ${err.message}`)
      errors++
    }
  }

  console.log(`\nSummary:`)
  console.log(`  Files scanned: ${files.length}`)
  console.log(`  Files cleaned: ${cleaned}`)
  console.log(`  Errors: ${errors}`)

  if (dryRun && cleaned > 0) {
    console.log('\nRun without --dry-run to apply changes')
  }
}

main()
