#!/usr/bin/env node
/**
 * Supabase Schema Setup Script
 * Creates all necessary tables for RSTU Connect
 * Usage: node scripts/setup-supabase.js
 */

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in environment variables')
  console.error('   NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY required')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTable(tableName) {
  try {
    const { error } = await supabase.from(tableName).select('count', { count: 'exact' }).limit(1)
    // PGRST116 = no rows found, which is fine - table exists
    return !error || error.code === 'PGRST116'
  } catch (e) {
    return false
  }
}

async function main() {
  console.log('🔧 RSTU Connect - Supabase Setup')
  console.log('='.repeat(50))

  try {
    // Test connection
    console.log('\n📡 Testing Supabase connection...')
    const { error: connError } = await supabase.from('profiles').select('count', { count: 'exact' }).limit(1)

    if (connError && connError.code !== 'PGRST116') {
      console.error('❌ Connection failed:', connError.message)
      process.exit(1)
    }

    console.log('✅ Connected to Supabase')

    // Check existing tables
    console.log('\n📋 Checking existing tables...')
    const tables = [
      'profiles',
      'invite_codes',
      'document_admin_state',
      'document_edits',
      'canvass_units',
      'building_complaints',
      'building_demands',
      'linked_property_groups',
      'governance_proposals'
    ]

    const existingTables = []
    const missingTables = []

    for (const table of tables) {
      const exists = await checkTable(table)
      if (exists) {
        existingTables.push(table)
        console.log(`  ✅ ${table}`)
      } else {
        missingTables.push(table)
        console.log(`  ❌ ${table}`)
      }
    }

    console.log(`\n📊 Summary: ${existingTables.length}/${tables.length} tables exist`)

    if (missingTables.length === 0) {
      console.log('\n✅ All tables exist! Setup complete.')
      console.log('\nNext steps:')
      console.log('1. Test invite code sync: Create an invite on desktop, scan on mobile')
      console.log('2. Monitor browser console for: [InviteCode:create] Successfully synced to Supabase')
      process.exit(0)
    }

    // Show SQL for manual creation
    console.log('\n⚠️  Missing tables: ' + missingTables.join(', '))
    console.log('\n📝 Run this SQL in Supabase SQL Editor:')
    console.log('Go to: https://supabase.com/dashboard/project/dxkwzvweaqlhmpwgpzsa/sql')
    console.log('\nThen paste the content from: supabase/schema.sql')
    console.log('\nOr run:')
    console.log('  cat supabase/schema.sql | supabase sql --no-verify')

  } catch (error) {
    console.error('❌ Setup failed:', error.message)
    process.exit(1)
  }
}

main()
