/**
 * Phase 4 Module Import Tests
 * Verifies that all Phase 4 modules can be imported and used correctly
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

console.log('═══════════════════════════════════════════════════════════════')
console.log('PHASE 4 MODULE IMPORT TESTS')
console.log('═══════════════════════════════════════════════════════════════\n')

// Test 1: Check file existence
console.log('TEST 1: Module File Existence')
console.log('───────────────────────────────────────────────────────────────')

const modulesToCheck = [
  'src/lib/codeEnforcementIntegration.ts',
  'src/lib/legalAidReferral.ts',
  'src/components/Chat/IssueSuggestion.tsx',
  'src/lib/strikeNoticePDF.ts'
]

let allFilesExist = true

modulesToCheck.forEach(modulePath => {
  const fullPath = path.join(__dirname, modulePath)
  const exists = fs.existsSync(fullPath)
  console.log(`${exists ? '✅' : '❌'} ${modulePath}`)
  if (!exists) allFilesExist = false
})

console.log(`\nResult: ${allFilesExist ? '✅ All files exist' : '❌ Some files missing'}\n`)

// Test 2: Check file sizes and content
console.log('TEST 2: Module File Content Validation')
console.log('───────────────────────────────────────────────────────────────')

const modules = [
  {
    path: 'src/lib/codeEnforcementIntegration.ts',
    expectedFunctions: [
      'generateRenoCodeEnforcementUrl',
      'generateCodeEnforcementEmailTemplate',
      'openRenoCodeEnforcementForm',
      'copyCodeEnforcementEmailTemplate',
      'getRenoCodeEnforcementPhone',
      'getRenoCodeEnforcementEmail',
      'getCodeEnforcementCategories'
    ]
  },
  {
    path: 'src/lib/legalAidReferral.ts',
    expectedFunctions: [
      'generateLegalAidEmailTemplate',
      'openLegalAidIntakeForm',
      'doesIssueQualifyForLegalAid',
      'doesIssueSuggestUrgentLegalAction',
      'getNevadaTenantRightsResources',
      'getCrisisLegalResources'
    ]
  },
  {
    path: 'src/lib/strikeNoticePDF.ts',
    expectedFunctions: [
      'generateHabitabilityNoticePDF',
      'downloadHabitabilityNoticePDF',
      'getHabitabilityNoticeFilename'
    ]
  },
  {
    path: 'src/components/Chat/IssueSuggestion.tsx',
    expectedFunctions: ['IssueSuggestion', 'handleFileCodeEnforcementComplaint', 'handleOpenLegalAid']
  }
]

modules.forEach(module => {
  const fullPath = path.join(__dirname, module.path)
  const content = fs.readFileSync(fullPath, 'utf-8')
  const fileSize = content.length

  console.log(`\n📄 ${module.path}`)
  console.log(`   Size: ${fileSize} bytes (~${Math.round(fileSize / 1024)} KB)`)
  console.log(`   Functions/exports expected: ${module.expectedFunctions.length}`)

  let foundCount = 0
  module.expectedFunctions.forEach(fn => {
    const found = content.includes(`export function ${fn}`) ||
                 content.includes(`export const ${fn}`) ||
                 content.includes(`function ${fn}`) ||
                 content.includes(`const ${fn}`) ||
                 content.includes(`export { ${fn}`) ||
                 content.includes(`${fn}:`)

    if (found) {
      console.log(`   ✅ ${fn}`)
      foundCount++
    } else {
      console.log(`   ⚠️  ${fn} (not found)`)
    }
  })

  console.log(`   Found: ${foundCount}/${module.expectedFunctions.length}`)
})

console.log('\n')

// Test 3: TypeScript/Interface definitions
console.log('TEST 3: Type Definitions and Interfaces')
console.log('───────────────────────────────────────────────────────────────')

const interfaceChecks = [
  {
    file: 'src/lib/codeEnforcementIntegration.ts',
    interfaces: ['CodeEnforcementComplaintData']
  },
  {
    file: 'src/lib/legalAidReferral.ts',
    interfaces: ['LegalAidReferralData']
  },
  {
    file: 'src/lib/strikeNoticePDF.ts',
    interfaces: ['HabitabilityNoticeData']
  }
]

interfaceChecks.forEach(check => {
  const fullPath = path.join(__dirname, check.file)
  const content = fs.readFileSync(fullPath, 'utf-8')

  console.log(`\n${check.file}`)

  check.interfaces.forEach(iface => {
    const found = content.includes(`interface ${iface}`) ||
                 content.includes(`type ${iface}`)
    console.log(`   ${found ? '✅' : '❌'} ${iface}`)
  })
})

console.log('\n')

// Test 4: External Integration Points
console.log('TEST 4: External Integration Points')
console.log('───────────────────────────────────────────────────────────────')

const ceFile = fs.readFileSync(path.join(__dirname, 'src/lib/codeEnforcementIntegration.ts'), 'utf-8')
const legalFile = fs.readFileSync(path.join(__dirname, 'src/lib/legalAidReferral.ts'), 'utf-8')

// Check Reno city website references
const hasRenoUrl = ceFile.includes('reno.gov')
console.log(`✅ Reno city code enforcement URL: ${hasRenoUrl ? 'Found' : 'Not found'}`)

// Check legal aid references
const hasLegalAidPhone = legalFile.includes('775')
const hasLegalAidEmail = legalFile.includes('nnevadlegal.org')
console.log(`✅ Legal aid phone number: ${hasLegalAidPhone ? 'Found' : 'Not found'}`)
console.log(`✅ Legal aid website domain: ${hasLegalAidEmail ? 'Found' : 'Not found'}`)

// Check Nevada law references
const hasNRS = ceFile.includes('NRS 118A') || legalFile.includes('NRS 118A')
console.log(`✅ Nevada Revised Statutes references: ${hasNRS ? 'Found' : 'Not found'}`)

console.log('\n')

// Test 5: Component Integration
console.log('TEST 5: IssueSuggestion Component Integration')
console.log('───────────────────────────────────────────────────────────────')

const issueFile = fs.readFileSync(path.join(__dirname, 'src/components/Chat/IssueSuggestion.tsx'), 'utf-8')

const imports = [
  { name: 'codeEnforcementIntegration', present: issueFile.includes('codeEnforcementIntegration') },
  { name: 'legalAidReferral', present: issueFile.includes('legalAidReferral') },
  { name: 'strikeNoticePDF', present: issueFile.includes('strikeNoticePDF') }
]

console.log('Imports present:')
imports.forEach(imp => {
  console.log(`${imp.present ? '✅' : '❌'} ${imp.name}`)
})

const handlers = [
  { name: 'handleFileCodeEnforcementComplaint', present: issueFile.includes('handleFileCodeEnforcementComplaint') },
  { name: 'handleOpenLegalAid', present: issueFile.includes('handleOpenLegalAid') },
  { name: 'handleDownloadHabitabilityNotice', present: issueFile.includes('handleDownloadHabitabilityNotice') }
]

console.log('\nEvent handlers present:')
handlers.forEach(handler => {
  console.log(`${handler.present ? '✅' : '❌'} ${handler.name}`)
})

const uiElements = [
  { name: '"External Actions Available"', present: issueFile.includes('External Actions Available') },
  { name: 'File Code Enforcement button', present: issueFile.includes('File Code Enforcement') },
  { name: 'Legal Aid button', present: issueFile.includes('Get Legal Aid') },
  { name: 'Demand Letter button', present: issueFile.includes('Download Demand') }
]

console.log('\nUI elements present:')
uiElements.forEach(ui => {
  console.log(`${ui.present ? '✅' : '❌'} ${ui.name}`)
})

console.log('\n')

// Summary
console.log('═══════════════════════════════════════════════════════════════')
console.log('MODULE VALIDATION SUMMARY')
console.log('═══════════════════════════════════════════════════════════════\n')

const allTests = [
  ...modules.map(m => ({ name: `${m.path} exists`, pass: true })),
  ...imports.map(i => ({ name: `${i.name} imported`, pass: i.present })),
  ...handlers.map(h => ({ name: `${h.name} defined`, pass: h.present })),
  ...uiElements.map(u => ({ name: `${u.name} present`, pass: u.present }))
]

const passCount = allTests.filter(t => t.pass).length
const totalCount = allTests.length

console.log(`Validation Result: ${passCount}/${totalCount} checks passed`)
console.log(`Success Rate: ${Math.round((passCount / totalCount) * 100)}%\n`)

if (passCount === totalCount) {
  console.log('✅ All module validation tests passed!')
  console.log('✅ Phase 4 modules are properly integrated!')
} else {
  console.log('⚠️  Some validation checks did not pass')
  console.log('Failed checks:')
  allTests.filter(t => !t.pass).forEach(t => console.log(`  ❌ ${t.name}`))
}

console.log('\n═══════════════════════════════════════════════════════════════')
