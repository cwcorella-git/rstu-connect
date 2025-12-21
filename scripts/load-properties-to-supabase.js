#!/usr/bin/env node
/**
 * Load all properties from all-properties.json into Supabase
 * Run: node scripts/load-properties-to-supabase.js
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Supabase credentials
const SUPABASE_URL = 'https://dxkwzvweaqlhmpwgpzsa.supabase.co';
const SUPABASE_KEY = 'sb_publishable_cDaWuFY-msonrx-m1uRZaw_PwE-LshY';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

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
 * Expand compressed property to full format
 */
function expandProperty(p) {
  return {
    apn: p.a,
    address: p.d,
    name: p.n || null,
    owner: p.o,
    units: p.u,
    value: p.v || null,
    year_built: p.y || null,
    sqft: null,
    zoning: p.z || null,
    land_use_code: p.l || null,
    lat: p.t || null,
    lon: p.g || null,
    chat_slug: generateChatSlug(p.d),
  };
}

async function loadProperties() {
  console.log('Loading properties from JSON...');

  const jsonPath = path.join(__dirname, '../public/data/all-properties.json');
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

  console.log(`Found ${data.p.length} properties`);

  // Expand all properties
  const properties = data.p.map(expandProperty);

  // Upload in batches of 500
  const BATCH_SIZE = 500;
  let uploaded = 0;
  let errors = 0;

  for (let i = 0; i < properties.length; i += BATCH_SIZE) {
    const batch = properties.slice(i, i + BATCH_SIZE);

    const { error } = await supabase
      .from('properties')
      .upsert(batch, { onConflict: 'apn' });

    if (error) {
      console.error(`Error uploading batch ${i}-${i + batch.length}:`, error.message);
      errors += batch.length;
    } else {
      uploaded += batch.length;
      process.stdout.write(`\rUploaded ${uploaded}/${properties.length} properties...`);
    }
  }

  console.log(`\n\nDone! Uploaded: ${uploaded}, Errors: ${errors}`);

  // Verify count
  const { count } = await supabase
    .from('properties')
    .select('*', { count: 'exact', head: true });

  console.log(`Total properties in Supabase: ${count}`);
}

loadProperties().catch(console.error);
