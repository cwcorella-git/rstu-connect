-- RSTU Connect: Management Companies Schema
-- Links properties to management companies extracted from owner_address C/O and ATTN patterns
-- Run this in Supabase SQL Editor

-- =============================================
-- 1. MANAGEMENT COMPANIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS management_companies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  normalized_name TEXT UNIQUE NOT NULL,
  detection_method TEXT DEFAULT 'c/o',  -- 'c/o' or 'attn'
  total_properties INTEGER DEFAULT 0,
  total_units INTEGER DEFAULT 0,
  total_evictions INTEGER DEFAULT 0,
  evictions_per_100_units REAL,
  city TEXT,
  state TEXT,
  confidence_score REAL DEFAULT 1.0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for text search
CREATE INDEX IF NOT EXISTS idx_mgmt_companies_name ON management_companies(name);
CREATE INDEX IF NOT EXISTS idx_mgmt_companies_units ON management_companies(total_units DESC);

-- =============================================
-- 2. EXTEND PROPERTIES TABLE
-- =============================================
ALTER TABLE properties ADD COLUMN IF NOT EXISTS management_company_id TEXT
  REFERENCES management_companies(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_properties_mgmt_company
  ON properties(management_company_id);

-- =============================================
-- 3. SEARCH MANAGEMENT COMPANIES
-- =============================================
CREATE OR REPLACE FUNCTION search_management_companies(
  search_query TEXT,
  result_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id TEXT,
  name TEXT,
  detection_method TEXT,
  total_properties INTEGER,
  total_units INTEGER,
  total_evictions INTEGER,
  evictions_per_100_units REAL,
  rank REAL
) AS $$
BEGIN
  -- Handle empty query - return top by units
  IF search_query IS NULL OR trim(search_query) = '' THEN
    RETURN QUERY
    SELECT
      mc.id, mc.name, mc.detection_method,
      mc.total_properties, mc.total_units, mc.total_evictions,
      mc.evictions_per_100_units,
      1.0::REAL as rank
    FROM management_companies mc
    ORDER BY mc.total_units DESC
    LIMIT result_limit;
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    mc.id, mc.name, mc.detection_method,
    mc.total_properties, mc.total_units, mc.total_evictions,
    mc.evictions_per_100_units,
    CASE
      WHEN mc.name ILIKE search_query THEN 2.0
      WHEN mc.name ILIKE search_query || '%' THEN 1.5
      ELSE 1.0
    END::REAL as rank
  FROM management_companies mc
  WHERE mc.name ILIKE '%' || search_query || '%'
     OR mc.id ILIKE '%' || search_query || '%'
  ORDER BY rank DESC, mc.total_units DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 4. GET PROPERTIES BY MANAGEMENT COMPANY
-- =============================================
CREATE OR REPLACE FUNCTION get_properties_by_management_company(
  mgmt_company_id TEXT,
  result_limit INTEGER DEFAULT 100
)
RETURNS TABLE (
  apn TEXT,
  address TEXT,
  name TEXT,
  owner TEXT,
  units INTEGER,
  value INTEGER,
  year_built INTEGER,
  lat DOUBLE PRECISION,
  lon DOUBLE PRECISION,
  chat_slug TEXT,
  sqft INTEGER,
  neighborhood TEXT,
  property_type TEXT,
  eviction_count INTEGER,
  organizing_priority REAL,
  corporate_landlord BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.apn, p.address, p.name, p.owner, p.units, p.value,
    p.year_built, p.lat, p.lon, p.chat_slug, p.sqft, p.neighborhood,
    p.property_type, p.eviction_count, p.organizing_priority, p.corporate_landlord
  FROM properties p
  WHERE p.management_company_id = mgmt_company_id
  ORDER BY p.units DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 5. GET LANDLORD PORTFOLIO (combines owner + mgmt company)
-- =============================================
CREATE OR REPLACE FUNCTION get_landlord_portfolio(
  search_name TEXT,
  result_limit INTEGER DEFAULT 100
)
RETURNS TABLE (
  apn TEXT,
  address TEXT,
  name TEXT,
  owner TEXT,
  units INTEGER,
  value INTEGER,
  year_built INTEGER,
  lat DOUBLE PRECISION,
  lon DOUBLE PRECISION,
  chat_slug TEXT,
  property_type TEXT,
  management_company_id TEXT,
  match_type TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.apn, p.address, p.name, p.owner, p.units, p.value,
    p.year_built, p.lat, p.lon, p.chat_slug, p.property_type,
    p.management_company_id,
    CASE
      WHEN p.owner ILIKE '%' || search_name || '%' THEN 'owner'
      WHEN mc.name ILIKE '%' || search_name || '%' THEN 'manager'
      ELSE 'unknown'
    END::TEXT as match_type
  FROM properties p
  LEFT JOIN management_companies mc ON p.management_company_id = mc.id
  WHERE p.owner ILIKE '%' || search_name || '%'
     OR mc.name ILIKE '%' || search_name || '%'
  ORDER BY p.units DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 6. UPDATE PROPERTIES SEARCH TO INCLUDE MGMT COMPANY
-- =============================================

-- Add management_company_id to search results
DROP FUNCTION IF EXISTS search_properties(TEXT, TEXT, INTEGER);

CREATE OR REPLACE FUNCTION search_properties(
  search_query TEXT,
  property_type_filter TEXT DEFAULT NULL,
  result_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  apn TEXT,
  address TEXT,
  name TEXT,
  owner TEXT,
  units INTEGER,
  value INTEGER,
  year_built INTEGER,
  lat DOUBLE PRECISION,
  lon DOUBLE PRECISION,
  chat_slug TEXT,
  sqft INTEGER,
  neighborhood TEXT,
  property_type TEXT,
  eviction_count INTEGER,
  organizing_priority REAL,
  corporate_landlord BOOLEAN,
  portfolio_size INTEGER,
  organizing_status TEXT,
  management_company_id TEXT,
  rank REAL
) AS $$
BEGIN
  -- Handle empty query - return top properties by units
  IF search_query IS NULL OR trim(search_query) = '' THEN
    RETURN QUERY
    SELECT
      p.apn, p.address, p.name, p.owner, p.units, p.value,
      p.year_built, p.lat, p.lon, p.chat_slug, p.sqft, p.neighborhood,
      p.property_type, p.eviction_count, p.organizing_priority, p.corporate_landlord,
      p.portfolio_size, p.organizing_status, p.management_company_id,
      1.0::REAL as rank
    FROM properties p
    WHERE (property_type_filter IS NULL OR p.property_type = property_type_filter)
    ORDER BY p.units DESC
    LIMIT result_limit;
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    p.apn, p.address, p.name, p.owner, p.units, p.value,
    p.year_built, p.lat, p.lon, p.chat_slug, p.sqft, p.neighborhood,
    p.property_type, p.eviction_count, p.organizing_priority, p.corporate_landlord,
    p.portfolio_size, p.organizing_status, p.management_company_id,
    ts_rank(p.fts_vector, websearch_to_tsquery('english', search_query)) as rank
  FROM properties p
  WHERE (property_type_filter IS NULL OR p.property_type = property_type_filter)
    AND (
      p.fts_vector @@ websearch_to_tsquery('english', search_query)
      OR p.apn = search_query  -- Exact APN match
      OR p.address ILIKE '%' || search_query || '%'  -- Fallback substring
    )
  ORDER BY rank DESC, p.units DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;
