-- Landing Pages table for admin page builder
-- Stores custom landing page configurations as JSON

CREATE TABLE IF NOT EXISTS landing_pages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  sections JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Allow all authenticated users to read (public pages)
-- Only admins should write (enforced client-side)
ALTER TABLE landing_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read landing pages"
  ON landing_pages FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage landing pages"
  ON landing_pages FOR ALL
  USING (auth.role() = 'authenticated');
