-- RSTU Connect Full-Text Search Schema
-- Run this in Supabase SQL Editor after the main schema

-- =============================================
-- 1. PROPERTIES TABLE (for building directory)
-- =============================================
CREATE TABLE IF NOT EXISTS properties (
  apn TEXT PRIMARY KEY,
  address TEXT NOT NULL,
  name TEXT,
  owner TEXT NOT NULL,
  units INTEGER DEFAULT 1,
  value INTEGER,
  year_built INTEGER,
  sqft INTEGER,
  zoning TEXT,
  land_use_code TEXT,
  lat DOUBLE PRECISION,
  lon DOUBLE PRECISION,
  chat_slug TEXT,
  -- FTS column (auto-generated)
  fts_vector TSVECTOR GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(address, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(owner, '')), 'B')
  ) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- FTS index for properties
CREATE INDEX IF NOT EXISTS idx_properties_fts ON properties USING gin(fts_vector);

-- Additional indexes for common queries
CREATE INDEX IF NOT EXISTS idx_properties_owner ON properties(owner);
CREATE INDEX IF NOT EXISTS idx_properties_units ON properties(units DESC);
CREATE INDEX IF NOT EXISTS idx_properties_address ON properties(address);

-- =============================================
-- 2. DOCUMENTS TABLE (for reading library)
-- =============================================
CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT,
  date TEXT,
  category TEXT NOT NULL,
  filename TEXT NOT NULL,
  slug TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,  -- Full markdown content for deep search
  -- FTS column (auto-generated)
  fts_vector TSVECTOR GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(author, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(excerpt, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(content, '')), 'D')
  ) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- FTS index for documents
CREATE INDEX IF NOT EXISTS idx_documents_fts ON documents USING gin(fts_vector);

-- Category index for filtering
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);

-- =============================================
-- 3. FTS SEARCH FUNCTIONS
-- =============================================

-- Search properties with ranking
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
  rank REAL
) AS $$
BEGIN
  -- Handle empty query - return top properties by units
  IF search_query IS NULL OR trim(search_query) = '' THEN
    RETURN QUERY
    SELECT
      p.apn, p.address, p.name, p.owner, p.units, p.value,
      p.year_built, p.lat, p.lon, p.chat_slug,
      1.0::REAL as rank
    FROM properties p
    ORDER BY p.units DESC
    LIMIT result_limit;
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    p.apn, p.address, p.name, p.owner, p.units, p.value,
    p.year_built, p.lat, p.lon, p.chat_slug,
    ts_rank(p.fts_vector, websearch_to_tsquery('english', search_query)) as rank
  FROM properties p
  WHERE p.fts_vector @@ websearch_to_tsquery('english', search_query)
     OR p.apn = search_query  -- Exact APN match
     OR p.address ILIKE '%' || search_query || '%'  -- Fallback substring
  ORDER BY rank DESC, p.units DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;

-- Search documents with ranking
CREATE OR REPLACE FUNCTION search_documents(
  search_query TEXT,
  category_filter TEXT DEFAULT NULL,
  result_limit INTEGER DEFAULT 100
)
RETURNS TABLE (
  id TEXT,
  title TEXT,
  author TEXT,
  date TEXT,
  category TEXT,
  filename TEXT,
  slug TEXT,
  excerpt TEXT,
  rank REAL
) AS $$
BEGIN
  -- Handle empty query - return all docs in category or all
  IF search_query IS NULL OR trim(search_query) = '' THEN
    RETURN QUERY
    SELECT
      d.id, d.title, d.author, d.date, d.category,
      d.filename, d.slug, d.excerpt,
      1.0::REAL as rank
    FROM documents d
    WHERE category_filter IS NULL OR d.category = category_filter
    ORDER BY d.title
    LIMIT result_limit;
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    d.id, d.title, d.author, d.date, d.category,
    d.filename, d.slug, d.excerpt,
    ts_rank(d.fts_vector, websearch_to_tsquery('english', search_query)) as rank
  FROM documents d
  WHERE d.fts_vector @@ websearch_to_tsquery('english', search_query)
    AND (category_filter IS NULL OR d.category = category_filter)
  ORDER BY rank DESC, d.title
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;

-- Prefix search for autocomplete (faster, uses trigrams)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_properties_address_trgm ON properties USING gin(address gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_properties_owner_trgm ON properties USING gin(owner gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_documents_title_trgm ON documents USING gin(title gin_trgm_ops);

-- Autocomplete function for properties
CREATE OR REPLACE FUNCTION autocomplete_properties(
  prefix TEXT,
  result_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  apn TEXT,
  address TEXT,
  name TEXT,
  owner TEXT,
  units INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT p.apn, p.address, p.name, p.owner, p.units
  FROM properties p
  WHERE p.address ILIKE prefix || '%'
     OR p.owner ILIKE prefix || '%'
     OR p.name ILIKE prefix || '%'
  ORDER BY
    CASE WHEN p.address ILIKE prefix || '%' THEN 0 ELSE 1 END,
    p.units DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 4. DISABLE RLS (using app-level auth)
-- =============================================
ALTER TABLE properties DISABLE ROW LEVEL SECURITY;
ALTER TABLE documents DISABLE ROW LEVEL SECURITY;
