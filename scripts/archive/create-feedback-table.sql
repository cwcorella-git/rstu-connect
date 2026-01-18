-- Feedback table for user suggestions and bug reports
-- Run this in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('feature', 'bug')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  contact_email TEXT,
  user_agent TEXT,
  current_page TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewed', 'implemented', 'closed'))
);

-- Enable Row Level Security
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Allow anyone to submit feedback (anonymous inserts)
CREATE POLICY "Anyone can submit feedback"
  ON feedback
  FOR INSERT
  WITH CHECK (true);

-- Block reads from the app - view feedback in Supabase dashboard instead
CREATE POLICY "Only admins can view feedback"
  ON feedback
  FOR SELECT
  USING (false);

-- Index for querying by type and status
CREATE INDEX IF NOT EXISTS idx_feedback_type ON feedback(type);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);
