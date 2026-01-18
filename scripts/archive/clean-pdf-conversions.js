#!/usr/bin/env node

/**
 * Clean up badly converted PDF/web documents in the docs/ folder
 *
 * Removes:
 * - PDF conversion metadata
 * - Page markers and section headers
 * - Broken image references
 * - Truncated URL header/footer lines
 * - Navigation menus and website chrome
 * - Excessive whitespace and horizontal rules
 */

const fs = require('fs')
const path = require('path')

const DOCS_DIR = path.join(__dirname, '..', 'docs')

// Patterns to identify documents needing cleaning
const NEEDS_CLEANING_PATTERNS = [
  /\*Converted from:.*\.pdf/i,
  /Complete Page View/i,
  /Extracted Text/i,
  /^## Page \d+/m,
  /\.\.\.\s+https?:\/\//,
  /PART OF STATES NEWSROOM/i,
]

// Patterns to remove - order matters!
const REMOVE_PATTERNS = [
  // === PDF CONVERSION ARTIFACTS ===
  // Conversion metadata block
  /\*Converted from:.*\n(?:\*[^\n]+\n)*---\n*/gi,
  // Single metadata lines
  /\*Converted from:.*\*\s*\n?/gi,
  /\*Total pages:.*\*\s*\n?/gi,
  /\*File size:.*\*\s*\n?/gi,
  /\*Converted:.*\*\s*\n?/gi,

  // Page markers
  /^## Page \d+\s*\n+/gm,
  /^---\s*\n+## Page \d+\s*\n*/gm,

  // Image sections
  /### Figures and Images.*\n(?:.*\n)*?(?=###|---|\n\n)/gi,
  /#### Figure:.*\n!\[.*\]\(.*\)\s*\n*/gi,
  /### Complete Page View\s*\n!\[.*\]\(.*\)\s*\n*/gi,
  /### Complete Page View\s*\n*/gi,
  /### Extracted Text\s*\n+/gi,
  /!\[.*\]\(images\/page_\d+.*\)\s*\n*/gi,

  // === WEB PAGE ARTIFACTS ===
  // Truncated title + URL lines (page headers/footers from web captures)
  /^[A-Za-z][^\n]{0,60}\.\.\.\s+https?:\/\/[^\s]+\s*$/gm,

  // Navigation menus
  /^PART OF STATES NEWSROOM\s*$/gm,
  /^ECONOMY\s+HOUSING\s+LEGISLATURE\s+POLITICS\s*\+?\s*GOVERNMENT\s*$/gm,
  /^HOME\s+ABOUT\s+CONTACT\s*.*$/gmi,
  /^MENU\s*$/gmi,
  /^NAVIGATION\s*$/gmi,
  /^Skip to (?:content|main|navigation)\s*$/gmi,

  // Social/sharing elements
  /^(?:SHARE|FOLLOW US|TWEET|FACEBOOK|LINKEDIN|EMAIL)\s*$/gmi,
  /^Share this:?\s*$/gmi,

  // Newsletter/subscription prompts
  /^(?:SUBSCRIBE|SIGN UP|NEWSLETTER|Get our newsletter)\s*.*$/gmi,

  // Page numbers and timestamps from PDF footers
  /^\d+ of \d+\s*$/gm,
  /^\d+\/\d+\/\d+,?\s*\d+:\d+\s*(?:AM|PM)?\s*$/gm,
  /^Page \d+ of \d+\s*$/gmi,

  // Standalone URLs on their own line (usually header/footer artifacts)
  /^https?:\/\/[^\s]+\s*$/gm,

  // === GOOGLE DOCS ARTIFACTS ===
  /^Showing .* Mobile\s*$/gm,
  /^Download PDF\s*$/gmi,
  /^Print\s*$/gm,

  // === CLEANUP ===
  // Multiple consecutive horizontal rules
  /(?:^---\s*\n){2,}/gm,

  // Horizontal rule right after title (keep frontmatter separator)
  /(^# [^\n]+\n+)---\n+/gm,

  // Multiple blank lines (more than 2)
  /\n{4,}/g,

  // Lines that are just whitespace
  /^\s+$/gm,
]

// Post-processing replacements
const POST_PROCESS = [
  // Clean up multiple blank lines again
  [/\n{3,}/g, '\n\n'],
  // Remove trailing whitespace on lines
  [/[ \t]+$/gm, ''],
  // Ensure file ends with single newline
  [/\n*$/, '\n'],
]

function needsCleaning(content) {
  return NEEDS_CLEANING_PATTERNS.some(pattern => pattern.test(content))
}

function cleanDocument(content) {
  let cleaned = content

  // Apply removal patterns
  for (const pattern of REMOVE_PATTERNS) {
    cleaned = cleaned.replace(pattern, '\n')
  }

  // Post-processing
  for (const [pattern, replacement] of POST_PROCESS) {
    cleaned = cleaned.replace(pattern, replacement)
  }

  return cleaned
}

function findDocsNeedingCleaning() {
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
        if (needsCleaning(content)) {
          results.push(filePath)
        }
      }
    }
  }

  walkDir(DOCS_DIR)
  return results
}

function findAllDocs() {
  const results = []

  function walkDir(dir) {
    const files = fs.readdirSync(dir)
    for (const file of files) {
      const filePath = path.join(dir, file)
      const stat = fs.statSync(filePath)

      if (stat.isDirectory()) {
        walkDir(filePath)
      } else if (file.endsWith('.md')) {
        results.push(filePath)
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
  const all = args.includes('--all')
  const singleFile = args.find(a => !a.startsWith('--'))

  console.log('Document Cleaner v2')
  console.log('===================')

  if (dryRun) {
    console.log('DRY RUN - no files will be modified\n')
  }

  let files
  if (singleFile) {
    files = [singleFile]
  } else if (all) {
    files = findAllDocs()
    console.log(`Scanning all ${files.length} documents\n`)
  } else {
    files = findDocsNeedingCleaning()
    console.log(`Found ${files.length} documents needing cleaning\n`)
  }

  let cleaned = 0
  let unchanged = 0
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
      } else {
        unchanged++
      }
    } catch (err) {
      console.error(`Error processing ${filePath}: ${err.message}`)
      errors++
    }
  }

  console.log(`\nSummary:`)
  console.log(`  Files scanned: ${files.length}`)
  console.log(`  Files cleaned: ${cleaned}`)
  console.log(`  Unchanged: ${unchanged}`)
  console.log(`  Errors: ${errors}`)

  if (dryRun && cleaned > 0) {
    console.log('\nRun without --dry-run to apply changes')
  }
}

main()
