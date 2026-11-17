-- Fix type mismatch in get_property_eviction_stats function
-- The calculation returns double precision but function expects REAL
-- This migration explicitly casts to REAL

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
    -- Explicitly cast to REAL to match return type
    (COUNT(*) FILTER (WHERE e.defendant_represented = TRUE)::REAL / NULLIF(COUNT(*)::REAL, 0) * 100)::REAL as defendant_represented_pct
  FROM evictions e
  WHERE e.property_apn = property_apn_filter;
END;
$$ LANGUAGE plpgsql;
