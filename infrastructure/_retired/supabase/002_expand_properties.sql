-- RSTU Connect Schema Expansion
-- Adds additional property metadata, evictions table, and landlord scores
-- Run this in Supabase SQL Editor after the initial schema

-- =============================================
-- 1. ADD NEW COLUMNS TO PROPERTIES TABLE
-- =============================================
ALTER TABLE properties ADD COLUMN IF NOT EXISTS neighborhood TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS acres REAL;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS land_value INTEGER;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS improvement_value INTEGER;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS land_use_desc TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS eviction_count INTEGER DEFAULT 0;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS organizing_priority REAL DEFAULT 0;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS estimated_tenants INTEGER;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS corporate_landlord BOOLEAN DEFAULT FALSE;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS portfolio_size INTEGER DEFAULT 1;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS organizing_status TEXT DEFAULT 'inactive';

-- Index for new filterable columns
CREATE INDEX IF NOT EXISTS idx_properties_neighborhood ON properties(neighborhood);
CREATE INDEX IF NOT EXISTS idx_properties_organizing_priority ON properties(organizing_priority DESC);
CREATE INDEX IF NOT EXISTS idx_properties_eviction_count ON properties(eviction_count DESC);
CREATE INDEX IF NOT EXISTS idx_properties_corporate_landlord ON properties(corporate_landlord);

-- =============================================
-- 2. EVICTIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS evictions (
  id TEXT PRIMARY KEY,
  property_apn TEXT REFERENCES properties(apn) ON DELETE SET NULL,
  landlord_name TEXT NOT NULL,
  case_number TEXT,
  case_type TEXT CHECK (case_type IN ('non-payment', 'breach', 'holdover', 'unlawful-detainer', 'other')),
  filing_date DATE,
  judgment TEXT CHECK (judgment IN ('landlord_win', 'dismissed', 'settled', 'pending', 'unknown')),
  judgment_date DATE,
  attorney_fees REAL,
  defendant_represented BOOLEAN DEFAULT FALSE,
  defendant_name TEXT,
  court TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for evictions
CREATE INDEX IF NOT EXISTS idx_evictions_apn ON evictions(property_apn);
CREATE INDEX IF NOT EXISTS idx_evictions_landlord ON evictions(landlord_name);
CREATE INDEX IF NOT EXISTS idx_evictions_filing_date ON evictions(filing_date DESC);
CREATE INDEX IF NOT EXISTS idx_evictions_case_type ON evictions(case_type);

-- FTS for evictions (search by landlord name, defendant name)
ALTER TABLE evictions ADD COLUMN IF NOT EXISTS fts_vector TSVECTOR
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(landlord_name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(defendant_name, '')), 'B')
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_evictions_fts ON evictions USING gin(fts_vector);

-- =============================================
-- 3. LANDLORD SCORES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS landlord_scores (
  id TEXT PRIMARY KEY,
  landlord_name TEXT UNIQUE NOT NULL,
  normalized_name TEXT,
  total_properties INTEGER DEFAULT 0,
  total_units INTEGER DEFAULT 0,
  total_estimated_tenants INTEGER DEFAULT 0,
  eviction_count INTEGER DEFAULT 0,
  eviction_success_rate REAL,  -- percentage of evictions won
  evictions_per_100_units REAL,
  habitability_score REAL CHECK (habitability_score >= 0 AND habitability_score <= 10),
  tenant_rights_score REAL CHECK (tenant_rights_score >= 0 AND tenant_rights_score <= 10),
  legal_compliance_score REAL CHECK (legal_compliance_score >= 0 AND legal_compliance_score <= 10),
  overall_score REAL CHECK (overall_score >= 0 AND overall_score <= 10),
  worst_landlord_rank INTEGER,
  violation_count INTEGER DEFAULT 0,
  media_mentions INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for landlord scores
CREATE INDEX IF NOT EXISTS idx_landlord_scores_normalized ON landlord_scores(normalized_name);
CREATE INDEX IF NOT EXISTS idx_landlord_scores_overall ON landlord_scores(overall_score ASC);
CREATE INDEX IF NOT EXISTS idx_landlord_scores_eviction_rate ON landlord_scores(evictions_per_100_units DESC);
CREATE INDEX IF NOT EXISTS idx_landlord_scores_rank ON landlord_scores(worst_landlord_rank ASC);

-- FTS for landlord search
ALTER TABLE landlord_scores ADD COLUMN IF NOT EXISTS fts_vector TSVECTOR
  GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(landlord_name, '')) ||
    to_tsvector('english', coalesce(normalized_name, ''))
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_landlord_scores_fts ON landlord_scores USING gin(fts_vector);

-- =============================================
-- 4. UPDATED SEARCH FUNCTIONS
-- =============================================

-- Drop and recreate search_properties to include new fields
DROP FUNCTION IF EXISTS search_properties(TEXT, INTEGER);

CREATE OR REPLACE FUNCTION search_properties(
  search_query TEXT,
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
      p.eviction_count, p.organizing_priority, p.corporate_landlord,
      p.portfolio_size, p.organizing_status,
      1.0::REAL as rank
    FROM properties p
    ORDER BY p.units DESC
    LIMIT result_limit;
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    p.apn, p.address, p.name, p.owner, p.units, p.value,
    p.year_built, p.lat, p.lon, p.chat_slug, p.sqft, p.neighborhood,
    p.eviction_count, p.organizing_priority, p.corporate_landlord,
    p.portfolio_size, p.organizing_status,
    ts_rank(p.fts_vector, websearch_to_tsquery('english', search_query)) as rank
  FROM properties p
  WHERE p.fts_vector @@ websearch_to_tsquery('english', search_query)
     OR p.apn = search_query  -- Exact APN match
     OR p.address ILIKE '%' || search_query || '%'  -- Fallback substring
  ORDER BY rank DESC, p.units DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;

-- Search evictions
CREATE OR REPLACE FUNCTION search_evictions(
  search_query TEXT,
  property_apn_filter TEXT DEFAULT NULL,
  result_limit INTEGER DEFAULT 100
)
RETURNS TABLE (
  id TEXT,
  property_apn TEXT,
  landlord_name TEXT,
  case_number TEXT,
  case_type TEXT,
  filing_date DATE,
  judgment TEXT,
  judgment_date DATE,
  attorney_fees REAL,
  defendant_represented BOOLEAN,
  rank REAL
) AS $$
BEGIN
  -- Filter by property APN if provided
  IF property_apn_filter IS NOT NULL THEN
    RETURN QUERY
    SELECT
      e.id, e.property_apn, e.landlord_name, e.case_number, e.case_type,
      e.filing_date, e.judgment, e.judgment_date, e.attorney_fees,
      e.defendant_represented,
      1.0::REAL as rank
    FROM evictions e
    WHERE e.property_apn = property_apn_filter
    ORDER BY e.filing_date DESC
    LIMIT result_limit;
    RETURN;
  END IF;

  -- Search by landlord/defendant name
  IF search_query IS NULL OR trim(search_query) = '' THEN
    RETURN QUERY
    SELECT
      e.id, e.property_apn, e.landlord_name, e.case_number, e.case_type,
      e.filing_date, e.judgment, e.judgment_date, e.attorney_fees,
      e.defendant_represented,
      1.0::REAL as rank
    FROM evictions e
    ORDER BY e.filing_date DESC
    LIMIT result_limit;
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    e.id, e.property_apn, e.landlord_name, e.case_number, e.case_type,
    e.filing_date, e.judgment, e.judgment_date, e.attorney_fees,
    e.defendant_represented,
    ts_rank(e.fts_vector, websearch_to_tsquery('english', search_query)) as rank
  FROM evictions e
  WHERE e.fts_vector @@ websearch_to_tsquery('english', search_query)
     OR e.landlord_name ILIKE '%' || search_query || '%'
  ORDER BY rank DESC, e.filing_date DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;

-- Get landlord score by name
CREATE OR REPLACE FUNCTION get_landlord_score(landlord_name_query TEXT)
RETURNS TABLE (
  id TEXT,
  landlord_name TEXT,
  total_properties INTEGER,
  total_units INTEGER,
  eviction_count INTEGER,
  eviction_success_rate REAL,
  evictions_per_100_units REAL,
  habitability_score REAL,
  tenant_rights_score REAL,
  legal_compliance_score REAL,
  overall_score REAL,
  worst_landlord_rank INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ls.id, ls.landlord_name, ls.total_properties, ls.total_units,
    ls.eviction_count, ls.eviction_success_rate, ls.evictions_per_100_units,
    ls.habitability_score, ls.tenant_rights_score, ls.legal_compliance_score,
    ls.overall_score, ls.worst_landlord_rank
  FROM landlord_scores ls
  WHERE ls.fts_vector @@ websearch_to_tsquery('english', landlord_name_query)
     OR ls.landlord_name ILIKE '%' || landlord_name_query || '%'
     OR ls.normalized_name ILIKE '%' || landlord_name_query || '%'
  ORDER BY
    CASE WHEN ls.landlord_name ILIKE landlord_name_query THEN 0 ELSE 1 END,
    ls.total_units DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Get eviction stats for a property
CREATE OR REPLACE FUNCTION get_property_eviction_stats(property_apn_filter TEXT)
RETURNS TABLE (
  total_evictions BIGINT,
  landlord_wins BIGINT,
  dismissed BIGINT,
  avg_attorney_fees REAL,
  most_recent_filing DATE,
  defendant_represented_pct REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_evictions,
    COUNT(*) FILTER (WHERE e.judgment = 'landlord_win')::BIGINT as landlord_wins,
    COUNT(*) FILTER (WHERE e.judgment = 'dismissed')::BIGINT as dismissed,
    AVG(e.attorney_fees)::REAL as avg_attorney_fees,
    MAX(e.filing_date) as most_recent_filing,
    (COUNT(*) FILTER (WHERE e.defendant_represented = TRUE)::REAL / NULLIF(COUNT(*)::REAL, 0) * 100) as defendant_represented_pct
  FROM evictions e
  WHERE e.property_apn = property_apn_filter;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 5. DISABLE RLS FOR NEW TABLES
-- =============================================
ALTER TABLE evictions DISABLE ROW LEVEL SECURITY;
ALTER TABLE landlord_scores DISABLE ROW LEVEL SECURITY;

-- =============================================
-- 6. ENABLE REALTIME FOR NEW TABLES (optional)
-- =============================================
-- Uncomment if you want real-time updates
-- ALTER PUBLICATION supabase_realtime ADD TABLE evictions;
-- ALTER PUBLICATION supabase_realtime ADD TABLE landlord_scores;
