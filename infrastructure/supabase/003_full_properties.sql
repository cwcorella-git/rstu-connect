-- RSTU Connect: Full Properties Schema Expansion
-- Adds property_type column and geo-distance query function
-- Run this in Supabase SQL Editor

-- =============================================
-- 1. ADD PROPERTY_TYPE COLUMN
-- =============================================
ALTER TABLE properties ADD COLUMN IF NOT EXISTS property_type TEXT;

-- Property type values:
--   mc = multi-unit corporate
--   mi = multi-unit individual
--   mt = multi-unit trust
--   sc = single-family corporate
--   st = single-family trust (investment)

CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(property_type);

-- =============================================
-- 2. GEO-DISTANCE QUERY FUNCTION
-- =============================================

-- Search properties within a radius (miles) of a center point
-- Uses Haversine formula for distance calculation
CREATE OR REPLACE FUNCTION search_properties_nearby(
  center_lat DOUBLE PRECISION,
  center_lon DOUBLE PRECISION,
  radius_miles DOUBLE PRECISION DEFAULT 0.3,
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
  distance_miles DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.apn, p.address, p.name, p.owner, p.units, p.value,
    p.year_built, p.lat, p.lon, p.chat_slug, p.sqft, p.neighborhood,
    p.property_type, p.eviction_count, p.organizing_priority, p.corporate_landlord,
    -- Haversine distance formula (result in miles)
    (3959 * acos(
      LEAST(1.0, GREATEST(-1.0,
        cos(radians(center_lat)) * cos(radians(p.lat)) *
        cos(radians(p.lon) - radians(center_lon)) +
        sin(radians(center_lat)) * sin(radians(p.lat))
      ))
    ))::DOUBLE PRECISION as distance_miles
  FROM properties p
  WHERE p.lat IS NOT NULL
    AND p.lon IS NOT NULL
    -- Pre-filter with bounding box for performance (rough estimate: 1 degree ~ 69 miles)
    AND p.lat BETWEEN center_lat - (radius_miles / 69.0) AND center_lat + (radius_miles / 69.0)
    AND p.lon BETWEEN center_lon - (radius_miles / 54.0) AND center_lon + (radius_miles / 54.0)
    -- Then filter by actual distance
    AND (3959 * acos(
      LEAST(1.0, GREATEST(-1.0,
        cos(radians(center_lat)) * cos(radians(p.lat)) *
        cos(radians(p.lon) - radians(center_lon)) +
        sin(radians(center_lat)) * sin(radians(p.lat))
      ))
    )) < radius_miles
  ORDER BY distance_miles
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 3. UPDATE SEARCH FUNCTION WITH PROPERTY_TYPE FILTER
-- =============================================

-- Drop and recreate search_properties to include property_type filter
DROP FUNCTION IF EXISTS search_properties(TEXT, INTEGER);
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
      p.portfolio_size, p.organizing_status,
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
    p.portfolio_size, p.organizing_status,
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

-- =============================================
-- 4. SEARCH ALL PROPERTIES (Including non-rentals)
-- =============================================

-- Function to search ALL properties in database (for research mode)
CREATE OR REPLACE FUNCTION search_all_properties(
  search_query TEXT,
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
  property_type TEXT,
  rank REAL
) AS $$
BEGIN
  IF search_query IS NULL OR trim(search_query) = '' THEN
    RETURN QUERY
    SELECT
      p.apn, p.address, p.name, p.owner, p.units, p.value,
      p.year_built, p.lat, p.lon, p.property_type,
      1.0::REAL as rank
    FROM properties p
    ORDER BY p.units DESC
    LIMIT result_limit;
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    p.apn, p.address, p.name, p.owner, p.units, p.value,
    p.year_built, p.lat, p.lon, p.property_type,
    ts_rank(p.fts_vector, websearch_to_tsquery('english', search_query)) as rank
  FROM properties p
  WHERE p.fts_vector @@ websearch_to_tsquery('english', search_query)
     OR p.apn = search_query
     OR p.address ILIKE '%' || search_query || '%'
  ORDER BY rank DESC, p.units DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;
