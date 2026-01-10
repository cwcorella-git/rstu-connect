#!/usr/bin/env node
/**
 * Integration tests for Supabase server-authoritative functions
 * Tests RPC functions from 007_server_authoritative.sql against real Supabase
 *
 * Prerequisites:
 *   1. Run supabase/007_server_authoritative.sql in Supabase SQL Editor
 *   2. Set environment variables:
 *      - NEXT_PUBLIC_SUPABASE_URL
 *      - NEXT_PUBLIC_SUPABASE_ANON_KEY
 *
 * Usage:
 *   node scripts/test-supabase-functions.js
 *
 * Or with inline env vars:
 *   NEXT_PUBLIC_SUPABASE_URL=... NEXT_PUBLIC_SUPABASE_ANON_KEY=... node scripts/test-supabase-functions.js
 */

const { createClient } = require('@supabase/supabase-js')

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing environment variables:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL')
  console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY')
  console.error('')
  console.error('Usage:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL=... NEXT_PUBLIC_SUPABASE_ANON_KEY=... node scripts/test-supabase-functions.js')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Test tracking
let passed = 0
let failed = 0
const failures = []

function log(msg) {
  console.log(msg)
}

function pass(testName) {
  passed++
  log(`  ✅ ${testName}`)
}

function fail(testName, error) {
  failed++
  failures.push({ testName, error })
  log(`  ❌ ${testName}`)
  log(`     Error: ${error}`)
}

// Test data - will be created and cleaned up
// Use proper UUIDs for database compatibility
function generateTestUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

const TEST_PREFIX = 'test_' + Date.now() + '_'
let testAdminId = null
let testTenantId = null
let testProposalId = null

/**
 * Setup: Create test profiles
 */
async function setup() {
  log('\n📦 Setting up test data...')

  // Create test admin profile with proper UUID and unique email
  testAdminId = generateTestUUID()
  const testTimestamp = Date.now()
  const { error: adminError } = await supabase
    .from('profiles')
    .upsert({
      id: testAdminId,
      nickname: 'TestAdmin_' + testTimestamp,
      email: `test_admin_${testTimestamp}@test.local`,
      role: 'admin',
      trust_level: 'verified',
      created_at: new Date().toISOString(),
      last_active: new Date().toISOString(),
    })

  if (adminError) {
    log(`   ⚠️  Could not create admin profile: ${adminError.message}`)
    log('   Continuing with tests (some may fail)...')
  } else {
    log(`   Created test admin: ${testAdminId}`)
  }

  // Create test tenant profile with proper UUID and unique email
  testTenantId = generateTestUUID()
  const { error: tenantError } = await supabase
    .from('profiles')
    .upsert({
      id: testTenantId,
      nickname: 'TestTenant_' + testTimestamp,
      email: `test_tenant_${testTimestamp}@test.local`,
      role: 'tenant',
      trust_level: 'verified',
      created_at: new Date().toISOString(),
      last_active: new Date().toISOString(),
    })

  if (tenantError) {
    log(`   ⚠️  Could not create tenant profile: ${tenantError.message}`)
  } else {
    log(`   Created test tenant: ${testTenantId}`)
  }

  // Create a test proposal ID (proper UUID format)
  testProposalId = generateTestUUID()
  log(`   Using test proposal ID: ${testProposalId}`)
}

/**
 * Cleanup: Remove test data
 */
async function cleanup() {
  log('\n🧹 Cleaning up test data...')

  // Delete test votes
  if (testProposalId) {
    await supabase
      .from('proposal_votes')
      .delete()
      .eq('proposal_id', testProposalId)
  }

  // Delete test ban records
  if (testTenantId) {
    await supabase
      .from('ban_records')
      .delete()
      .eq('profile_id', testTenantId)
  }

  // Delete test mute records
  if (testTenantId) {
    await supabase
      .from('mute_records')
      .delete()
      .eq('profile_id', testTenantId)
  }

  // Delete test profiles
  if (testAdminId) {
    await supabase.from('profiles').delete().eq('id', testAdminId)
  }
  if (testTenantId) {
    await supabase.from('profiles').delete().eq('id', testTenantId)
  }

  log('   Cleanup complete')
}

// ============================================
// Test: cast_vote
// ============================================
async function testCastVote() {
  log('\n🗳️  Testing cast_vote...')

  // Test 1: Valid vote
  {
    const { data, error } = await supabase.rpc('cast_vote', {
      p_target_type: 'proposal',
      p_target_id: testProposalId,
      p_voter_id: testTenantId,
      p_vote: 'up',
    })

    if (error) {
      fail('cast valid vote', error.message)
    } else if (data?.success) {
      pass('cast valid vote')
    } else {
      fail('cast valid vote', data?.error || 'Unknown error')
    }
  }

  // Test 2: Update existing vote
  {
    const { data, error } = await supabase.rpc('cast_vote', {
      p_target_type: 'proposal',
      p_target_id: testProposalId,
      p_voter_id: testTenantId,
      p_vote: 'down',
    })

    if (error) {
      fail('update existing vote', error.message)
    } else if (data?.success) {
      pass('update existing vote')
    } else {
      fail('update existing vote', data?.error || 'Unknown error')
    }
  }

  // Test 3: Invalid vote value
  {
    const { data, error } = await supabase.rpc('cast_vote', {
      p_target_type: 'proposal',
      p_target_id: testProposalId,
      p_voter_id: testTenantId,
      p_vote: 'invalid',
    })

    if (data?.success === false && data?.error?.includes('Invalid')) {
      pass('reject invalid vote value')
    } else if (error) {
      // Database constraint rejection is also acceptable
      pass('reject invalid vote value (constraint)')
    } else {
      fail('reject invalid vote value', 'Should have rejected invalid vote')
    }
  }

  // Test 4: Admin cannot vote on proposals (Bookchin principle)
  {
    const { data, error } = await supabase.rpc('cast_vote', {
      p_target_type: 'proposal',
      p_target_id: testProposalId,
      p_voter_id: testAdminId,
      p_vote: 'up',
    })

    if (data?.success === false && data?.error?.toLowerCase().includes('admin')) {
      pass('admin cannot vote on proposals (Bookchin)')
    } else if (error) {
      fail('admin cannot vote on proposals', error.message)
    } else {
      fail('admin cannot vote on proposals', 'Admin vote should be rejected')
    }
  }
}

// ============================================
// Test: get_proposal_votes
// ============================================
async function testGetProposalVotes() {
  log('\n📊 Testing get_proposal_votes...')

  const { data, error } = await supabase.rpc('get_proposal_votes', {
    p_proposal_id: testProposalId,
  })

  if (error) {
    fail('get proposal votes', error.message)
    return
  }

  // Should have 1 downvote from the earlier test (tenant changed from up to down)
  if (data?.downvotes >= 0 && data?.upvotes >= 0) {
    pass('get proposal votes returns counts')
  } else {
    fail('get proposal votes returns counts', 'Missing vote counts')
  }

  if (Array.isArray(data?.downvoters) || data?.downvoters === null) {
    pass('get proposal votes returns voter arrays')
  } else {
    fail('get proposal votes returns voter arrays', 'Missing voter arrays')
  }
}

// ============================================
// Test: check_ban_status
// ============================================
async function testCheckBanStatus() {
  log('\n🚫 Testing check_ban_status...')

  // Test 1: User not banned
  {
    const { data, error } = await supabase.rpc('check_ban_status', {
      p_profile_id: testTenantId,
      p_scope_type: null,
      p_scope_id: null,
    })

    if (error) {
      fail('check not banned user', error.message)
    } else if (data?.banned === false) {
      pass('check not banned user')
    } else {
      fail('check not banned user', 'Should return banned: false')
    }
  }

  // Test 2: Check with scope
  {
    const { data, error } = await supabase.rpc('check_ban_status', {
      p_profile_id: testTenantId,
      p_scope_type: 'group',
      p_scope_id: 'test-group',
    })

    if (error) {
      fail('check scoped ban status', error.message)
    } else if (data?.banned === false) {
      pass('check scoped ban status')
    } else {
      fail('check scoped ban status', 'Should return banned: false')
    }
  }
}

// ============================================
// Test: ban_user / unban_user
// ============================================
async function testBanUnban() {
  log('\n🔨 Testing ban_user / unban_user...')

  // Test 1: Admin can ban user
  {
    const { data, error } = await supabase.rpc('ban_user', {
      p_actor_id: testAdminId,
      p_target_id: testTenantId,
      p_scope_type: 'global',
      p_scope_id: null,
      p_reason: 'Test ban',
      p_expires_at: null,
    })

    if (error) {
      fail('admin can ban user', error.message)
    } else if (data?.success) {
      pass('admin can ban user')
    } else {
      fail('admin can ban user', data?.error || 'Unknown error')
    }
  }

  // Test 2: Verify user is banned (check profile.banned column directly)
  {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('banned')
      .eq('id', testTenantId)
      .single()

    if (error) {
      fail('verify ban applied', error.message)
    } else if (profile?.banned === true) {
      pass('verify ban applied')
    } else {
      fail('verify ban applied', 'User should be banned (profile.banned=' + profile?.banned + ')')
    }
  }

  // Test 3: Admin can unban user
  {
    const { data, error } = await supabase.rpc('unban_user', {
      p_actor_id: testAdminId,
      p_target_id: testTenantId,
      p_scope_type: 'global',
      p_scope_id: null,
    })

    if (error) {
      fail('admin can unban user', error.message)
    } else if (data?.success) {
      pass('admin can unban user')
    } else {
      fail('admin can unban user', data?.error || 'Unknown error')
    }
  }

  // Test 4: Verify user is unbanned
  {
    const { data, error } = await supabase.rpc('check_ban_status', {
      p_profile_id: testTenantId,
      p_scope_type: null,
      p_scope_id: null,
    })

    if (error) {
      fail('verify unban applied', error.message)
    } else if (data?.banned === false) {
      pass('verify unban applied')
    } else {
      fail('verify unban applied', 'User should be unbanned')
    }
  }

  // Test 5: Non-admin cannot ban
  {
    const { data, error } = await supabase.rpc('ban_user', {
      p_actor_id: testTenantId,
      p_target_id: testAdminId,
      p_scope_type: 'global',
      p_scope_id: null,
      p_reason: 'Should fail',
      p_expires_at: null,
    })

    if (data?.success === false) {
      pass('non-admin cannot ban')
    } else if (error) {
      pass('non-admin cannot ban (constraint)')
    } else {
      fail('non-admin cannot ban', 'Should reject non-admin ban attempt')
    }
  }
}

// ============================================
// Test: validate_role_change
// ============================================
async function testValidateRoleChange() {
  log('\n👤 Testing validate_role_change...')

  // Test 1: Admin can change roles
  {
    const { data, error } = await supabase.rpc('validate_role_change', {
      p_actor_id: testAdminId,
      p_target_id: testTenantId,
      p_new_role: 'organizer',
    })

    if (error) {
      fail('admin can change roles', error.message)
    } else if (data?.valid) {
      pass('admin can change roles')
    } else {
      fail('admin can change roles', data?.error || 'Unknown error')
    }
  }

  // Test 2: Non-admin cannot change roles
  {
    const { data, error } = await supabase.rpc('validate_role_change', {
      p_actor_id: testTenantId,
      p_target_id: testTenantId,
      p_new_role: 'admin',
    })

    if (data?.valid === false) {
      pass('non-admin cannot change roles')
    } else if (error) {
      fail('non-admin cannot change roles', error.message)
    } else {
      fail('non-admin cannot change roles', 'Should reject non-admin role change')
    }
  }

  // Test 3: Invalid role rejected
  {
    const { data, error } = await supabase.rpc('validate_role_change', {
      p_actor_id: testAdminId,
      p_target_id: testTenantId,
      p_new_role: 'superuser',
    })

    if (data?.valid === false) {
      pass('invalid role rejected')
    } else if (error) {
      pass('invalid role rejected (constraint)')
    } else {
      fail('invalid role rejected', 'Should reject invalid role')
    }
  }
}

// ============================================
// Test: Table existence
// ============================================
async function testTableExistence() {
  log('\n📋 Testing table existence...')

  const tables = [
    'proposal_votes',
    'event_votes',
    'ban_records',
    'mute_records',
    'events',
    'event_rsvps',
    'campaigns',
    'mutual_aid_posts',
    'mutual_aid_resources',
    'skill_profiles',
  ]

  for (const table of tables) {
    const { error } = await supabase
      .from(table)
      .select('*')
      .limit(1)

    if (error && error.code === '42P01') {
      fail(`table ${table} exists`, 'Table does not exist')
    } else if (error && error.message.includes('does not exist')) {
      fail(`table ${table} exists`, 'Table does not exist')
    } else {
      pass(`table ${table} exists`)
    }
  }
}

// ============================================
// Main
// ============================================
async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗')
  console.log('║  Supabase Server-Authoritative Functions Integration Test  ║')
  console.log('╚════════════════════════════════════════════════════════════╝')
  console.log('')
  console.log(`Supabase URL: ${SUPABASE_URL}`)

  try {
    // Check connection
    log('\n🔌 Testing connection...')
    const { error: connError } = await supabase.from('profiles').select('id').limit(1)
    if (connError && connError.code === '42P01') {
      log('   ⚠️  Profiles table does not exist - run schema.sql first')
      process.exit(1)
    }
    log('   Connected to Supabase')

    // Run tests
    await testTableExistence()
    await setup()
    await testCastVote()
    await testGetProposalVotes()
    await testCheckBanStatus()
    await testBanUnban()
    await testValidateRoleChange()
    await cleanup()

    // Summary
    console.log('\n' + '═'.repeat(60))
    console.log(`\n📊 Results: ${passed} passed, ${failed} failed`)

    if (failures.length > 0) {
      console.log('\n❌ Failed tests:')
      failures.forEach(({ testName, error }) => {
        console.log(`   - ${testName}: ${error}`)
      })
    }

    if (failed > 0) {
      console.log('\n⚠️  Some tests failed. Make sure you have run:')
      console.log('   1. supabase/schema.sql')
      console.log('   2. supabase/007_server_authoritative.sql')
      process.exit(1)
    } else {
      console.log('\n✅ All tests passed!')
      process.exit(0)
    }
  } catch (err) {
    console.error('\n💥 Unexpected error:', err.message)
    await cleanup().catch(() => {})
    process.exit(1)
  }
}

main()
