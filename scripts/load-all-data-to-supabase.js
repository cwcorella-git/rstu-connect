#!/usr/bin/env node
/**
 * Comprehensive data loader for RSTU Connect Supabase
 * Loads properties, evictions, landlord scores, and organizing intelligence
 *
 * Run: node scripts/load-all-data-to-supabase.js
 *
 * Prerequisites:
 *   1. Run supabase/002_expand_properties.sql in Supabase SQL Editor
 *   2. Run supabase/003_full_properties.sql for property_type and geo-query
 *   3. Run python3 scripts/export-all-properties.py to generate latest JSON
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load .env.local if running locally
try {
  require('dotenv').config({ path: path.join(__dirname, '../.env.local') });
} catch {
  // dotenv not available, rely on environment variables
}

// Supabase credentials (from environment variables - REQUIRED)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('ERROR: Missing required environment variables');
  console.error('  NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set');
  console.error('');
  console.error('Options:');
  console.error('  1. Create .env.local file with these variables');
  console.error('  2. Set environment variables before running:');
  console.error('     NEXT_PUBLIC_SUPABASE_URL=... NEXT_PUBLIC_SUPABASE_ANON_KEY=... node scripts/load-all-data-to-supabase.js');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Paths
const PROPERTIES_JSON = path.join(__dirname, '../public/data/all-properties.json');
const MGMT_JSON = path.join(__dirname, '../public/data/management-companies.json');
const LANDLORD_DB = path.join(__dirname, '../data/databases/landlord_accountability.db');
const ORGANIZING_DB = path.join(__dirname, '../data/databases/organizing_targets.db');

// Try to load better-sqlite3, fall back to sqlite3
let Database;
try {
  Database = require('better-sqlite3');
} catch {
  console.log('better-sqlite3 not found, trying sqlite3...');
  // We'll handle this in the sqlite3 async pattern
}

/**
 * Generate a chat slug from an address
 */
function generateChatSlug(address) {
  return 'rstu-' + address
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
}

/**
 * Normalize landlord name for matching
 */
function normalizeLandlordName(name) {
  if (!name) return '';
  return name
    .toUpperCase()
    .replace(/\s+(LLC|LP|LLP|INC|CORP|CORPORATION|LTD|HOLDINGS|PROPERTIES|INVESTMENTS|MANAGEMENT)\.?$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Map case type to standardized format
 */
function mapCaseType(caseType) {
  if (!caseType) return 'other';
  const lower = caseType.toLowerCase();
  if (lower.includes('non-payment') || lower.includes('nonpayment')) return 'non-payment';
  if (lower.includes('breach')) return 'breach';
  if (lower.includes('holdover')) return 'holdover';
  if (lower.includes('unlawful')) return 'unlawful-detainer';
  return 'other';
}

/**
 * Map judgment to standardized format
 */
function mapJudgment(judgmentFor, caseStatus) {
  if (!judgmentFor && !caseStatus) return 'unknown';
  const combined = ((judgmentFor || '') + ' ' + (caseStatus || '')).toLowerCase();
  if (combined.includes('plaintiff') || combined.includes('landlord')) return 'landlord_win';
  if (combined.includes('dismiss')) return 'dismissed';
  if (combined.includes('settle')) return 'settled';
  if (combined.includes('pending') || combined.includes('active')) return 'pending';
  return 'unknown';
}

/**
 * Expand compressed property to full format
 */
function expandProperty(p, organizingData, evictionCounts) {
  const apn = p.a;
  const orgData = organizingData.get(apn) || {};
  const evictionCount = evictionCounts.get(apn) || 0;

  return {
    apn: apn,
    address: p.d,
    name: p.n || null,
    owner: p.o,
    units: p.u,
    value: p.v || null,
    year_built: p.y || null,
    sqft: p.sf || null,
    zoning: p.z || null,
    land_use_code: p.l || null,
    land_use_desc: p.ld || null,
    neighborhood: p.nb || null,
    acres: p.ac || null,
    land_value: p.lv || null,
    improvement_value: p.iv || null,
    lat: p.t || null,
    lon: p.g || null,
    chat_slug: generateChatSlug(p.d),
    // Property type: mc, mi, mt (multi-unit), sc, st (single-family)
    property_type: p.pt || null,
    // Management company (extracted from owner_address C/O or ATTN patterns)
    management_company_id: p.mc || null,
    // Intelligence fields
    eviction_count: evictionCount,
    organizing_priority: orgData.organizing_priority || 0,
    estimated_tenants: orgData.estimated_tenants || null,
    corporate_landlord: orgData.corporate_landlord || false,
    portfolio_size: orgData.landlord_portfolio_size || 1,
    organizing_status: orgData.organizing_priority >= 7 ? 'active' :
                       orgData.organizing_priority >= 4 ? 'emerging' : 'inactive',
  };
}

/**
 * Load data from SQLite using sqlite3 (async)
 */
async function loadSqliteData(dbPath, query) {
  return new Promise((resolve, reject) => {
    const sqlite3 = require('sqlite3').verbose();
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error(`Failed to open ${dbPath}:`, err.message);
        resolve([]);
        return;
      }
    });

    db.all(query, [], (err, rows) => {
      db.close();
      if (err) {
        console.error(`Query error on ${dbPath}:`, err.message);
        resolve([]);
        return;
      }
      resolve(rows || []);
    });
  });
}

/**
 * Load organizing targets data
 */
async function loadOrganizingData() {
  if (!fs.existsSync(ORGANIZING_DB)) {
    console.log('Organizing database not found, skipping...');
    return new Map();
  }

  const rows = await loadSqliteData(ORGANIZING_DB, `
    SELECT
      apn,
      estimated_tenants,
      organizing_priority,
      corporate_landlord,
      landlord_portfolio_size
    FROM organizing_targets
  `);

  const data = new Map();
  for (const row of rows) {
    data.set(row.apn, {
      estimated_tenants: row.estimated_tenants,
      organizing_priority: row.organizing_priority,
      corporate_landlord: Boolean(row.corporate_landlord),
      landlord_portfolio_size: row.landlord_portfolio_size,
    });
  }

  console.log(`Loaded ${data.size} organizing targets`);
  return data;
}

/**
 * Load eviction records
 */
async function loadEvictionRecords() {
  if (!fs.existsSync(LANDLORD_DB)) {
    console.log('Landlord accountability database not found, skipping evictions...');
    return { records: [], countsByApn: new Map() };
  }

  const rows = await loadSqliteData(LANDLORD_DB, `
    SELECT
      id,
      case_number,
      property_address,
      property_apn,
      landlord_name,
      filing_date,
      case_type,
      case_status,
      judgment_date,
      judgment_for,
      judgment_amount,
      attorney_fees,
      court_costs,
      tenant_representation,
      court_jurisdiction
    FROM eviction_records
    ORDER BY filing_date DESC
  `);

  const records = rows.map(row => ({
    id: `eviction-${row.id}`,
    property_apn: row.property_apn || null,
    landlord_name: row.landlord_name || 'Unknown',
    case_number: row.case_number || null,
    case_type: mapCaseType(row.case_type),
    filing_date: row.filing_date || null,
    judgment: mapJudgment(row.judgment_for, row.case_status),
    judgment_date: row.judgment_date || null,
    attorney_fees: row.attorney_fees || null,
    defendant_represented: Boolean(row.tenant_representation),
    defendant_name: null,  // Not in source data
    court: row.court_jurisdiction || null,
    notes: null,
  }));

  // Count evictions by APN
  const countsByApn = new Map();
  for (const row of rows) {
    if (row.property_apn) {
      countsByApn.set(row.property_apn, (countsByApn.get(row.property_apn) || 0) + 1);
    }
  }

  console.log(`Loaded ${records.length} eviction records (${countsByApn.size} unique properties)`);
  return { records, countsByApn };
}

/**
 * Load landlord scorecards
 */
async function loadLandlordScores() {
  if (!fs.existsSync(LANDLORD_DB)) {
    console.log('Landlord accountability database not found, skipping scores...');
    return [];
  }

  const rows = await loadSqliteData(LANDLORD_DB, `
    SELECT
      id,
      landlord_name,
      total_properties,
      total_units,
      total_evictions,
      evictions_per_100_units,
      eviction_success_rate,
      habitability_score,
      tenant_rights_score,
      legal_compliance_score,
      overall_accountability_score,
      worst_landlord_ranking,
      total_violations,
      media_attention_count
    FROM landlord_scorecards
    ORDER BY total_units DESC
  `);

  const scores = rows.map(row => ({
    id: `landlord-${row.id}`,
    landlord_name: row.landlord_name,
    normalized_name: normalizeLandlordName(row.landlord_name),
    total_properties: row.total_properties || 0,
    total_units: row.total_units || 0,
    total_estimated_tenants: Math.round((row.total_units || 0) * 1.8),  // Estimate
    eviction_count: row.total_evictions || 0,
    eviction_success_rate: row.eviction_success_rate || null,
    evictions_per_100_units: row.evictions_per_100_units || null,
    habitability_score: row.habitability_score ? row.habitability_score / 10 : null,  // Convert to 0-10
    tenant_rights_score: row.tenant_rights_score ? row.tenant_rights_score / 10 : null,
    legal_compliance_score: row.legal_compliance_score ? row.legal_compliance_score / 10 : null,
    overall_score: row.overall_accountability_score ? row.overall_accountability_score / 10 : null,
    worst_landlord_rank: row.worst_landlord_ranking || null,
    violation_count: row.total_violations || 0,
    media_mentions: row.media_attention_count || 0,
    notes: null,
  }));

  console.log(`Loaded ${scores.length} landlord scorecards`);
  return scores;
}

/**
 * Upload data in batches
 */
async function uploadBatch(table, data, batchSize = 500, onConflict = null) {
  let uploaded = 0;
  let errors = 0;

  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);

    let query = supabase.from(table);
    if (onConflict) {
      query = query.upsert(batch, { onConflict });
    } else {
      query = query.upsert(batch);
    }

    const { error } = await query;

    if (error) {
      console.error(`Error uploading ${table} batch ${i}-${i + batch.length}:`, error.message);
      errors += batch.length;
    } else {
      uploaded += batch.length;
      process.stdout.write(`\r  Uploaded ${uploaded}/${data.length} ${table}...`);
    }
  }

  console.log(`\n  Done: ${uploaded} uploaded, ${errors} errors`);
  return { uploaded, errors };
}

/**
 * Main function
 */
async function main() {
  console.log('RSTU Connect Data Loader');
  console.log('========================\n');

  // Load intelligence data first
  console.log('Loading intelligence data...');
  const organizingData = await loadOrganizingData();
  const { records: evictionRecords, countsByApn: evictionCounts } = await loadEvictionRecords();
  const landlordScores = await loadLandlordScores();

  // Load and expand properties
  console.log('\nLoading properties from JSON...');
  if (!fs.existsSync(PROPERTIES_JSON)) {
    console.error(`Properties JSON not found: ${PROPERTIES_JSON}`);
    console.log('Run: python3 scripts/export-all-properties.py');
    return;
  }

  const data = JSON.parse(fs.readFileSync(PROPERTIES_JSON, 'utf-8'));
  console.log(`Found ${data.p.length} properties in JSON`);

  const properties = data.p.map(p => expandProperty(p, organizingData, evictionCounts));

  // Build set of valid APNs for FK constraint
  const validApns = new Set(properties.map(p => p.apn));

  // Filter eviction records - set property_apn to NULL if not in our properties
  const filteredEvictions = evictionRecords.map(e => ({
    ...e,
    property_apn: e.property_apn && validApns.has(e.property_apn) ? e.property_apn : null
  }));
  const linkedEvictions = filteredEvictions.filter(e => e.property_apn !== null).length;
  console.log(`Evictions linked to properties: ${linkedEvictions}/${evictionRecords.length}`);

  // Load management companies
  let managementCompanies = [];
  if (fs.existsSync(MGMT_JSON)) {
    const mgmtData = JSON.parse(fs.readFileSync(MGMT_JSON, 'utf-8'));
    managementCompanies = mgmtData.companies.map(mc => ({
      id: mc.id,
      name: mc.name,
      normalized_name: mc.name.toUpperCase().replace(/[^A-Z0-9]+/g, ' ').trim(),
      detection_method: mc.detection_method,
      total_properties: mc.property_count,
      total_units: mc.units,
      total_evictions: 0,  // Will be calculated later
      evictions_per_100_units: null,
      city: null,
      state: null,
      confidence_score: mc.detection_method === 'c/o' ? 1.0 : 0.9,
      notes: null,
    }));
    console.log(`Loaded ${managementCompanies.length} management companies from JSON`);
  } else {
    console.log('Management companies JSON not found, skipping...');
  }

  // Upload to Supabase
  console.log('\n--- Uploading to Supabase ---\n');

  // Upload management companies FIRST (properties have FK reference)
  console.log('1. Uploading management companies...');
  if (managementCompanies.length > 0) {
    const mgmtResult = await uploadBatch('management_companies', managementCompanies, 100, 'id');
  } else {
    console.log('  No management companies to upload');
  }

  console.log('\n2. Uploading properties...');
  const propResult = await uploadBatch('properties', properties, 500, 'apn');

  console.log('\n3. Uploading eviction records...');
  if (filteredEvictions.length > 0) {
    const evictResult = await uploadBatch('evictions', filteredEvictions, 500, 'id');
  } else {
    console.log('  No eviction records to upload');
  }

  console.log('\n4. Uploading landlord scores...');
  if (landlordScores.length > 0) {
    const scoreResult = await uploadBatch('landlord_scores', landlordScores, 100, 'id');
  } else {
    console.log('  No landlord scores to upload');
  }

  // Verify counts
  console.log('\n--- Verification ---\n');

  const { count: mgmtCount } = await supabase
    .from('management_companies')
    .select('*', { count: 'exact', head: true });
  console.log(`Management companies in Supabase: ${mgmtCount}`);

  const { count: propCount } = await supabase
    .from('properties')
    .select('*', { count: 'exact', head: true });
  console.log(`Properties in Supabase: ${propCount}`);

  const { count: propsWithMgmt } = await supabase
    .from('properties')
    .select('*', { count: 'exact', head: true })
    .not('management_company_id', 'is', null);
  console.log(`Properties with management company: ${propsWithMgmt}`);

  const { count: evictCount } = await supabase
    .from('evictions')
    .select('*', { count: 'exact', head: true });
  console.log(`Evictions in Supabase: ${evictCount}`);

  const { count: scoreCount } = await supabase
    .from('landlord_scores')
    .select('*', { count: 'exact', head: true });
  console.log(`Landlord scores in Supabase: ${scoreCount}`);

  // Show sample with new fields
  console.log('\n--- Sample Property with Intelligence ---\n');
  const { data: sample } = await supabase
    .from('properties')
    .select('apn, address, owner, units, eviction_count, organizing_priority, organizing_status, corporate_landlord')
    .gt('eviction_count', 0)
    .order('eviction_count', { ascending: false })
    .limit(3);

  if (sample) {
    for (const p of sample) {
      console.log(`  ${p.address} (${p.units} units)`);
      console.log(`    Owner: ${p.owner}`);
      console.log(`    Evictions: ${p.eviction_count}, Priority: ${p.organizing_priority}, Status: ${p.organizing_status}`);
    }
  }

  console.log('\nDone!');
}

main().catch(console.error);
