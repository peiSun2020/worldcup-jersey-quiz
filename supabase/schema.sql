-- ============================================
-- Supabase Schema for SEO Game Starter
-- Run this in Supabase SQL Editor
-- ============================================

-- Leaderboard table
CREATE TABLE IF NOT EXISTS leaderboard (
  id BIGSERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 10000),
  ip_hash VARCHAR(64) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for leaderboard queries
CREATE INDEX idx_leaderboard_score ON leaderboard (score DESC);
CREATE INDEX idx_leaderboard_daily ON leaderboard (created_at DESC, score DESC);
CREATE INDEX idx_leaderboard_ip ON leaderboard (ip_hash, created_at DESC);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id BIGSERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  content VARCHAR(200) NOT NULL,
  score INTEGER DEFAULT 0,
  is_highlighted BOOLEAN DEFAULT FALSE,
  ip_hash VARCHAR(64) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for comments
CREATE INDEX idx_comments_highlighted ON comments (is_highlighted, created_at DESC);
CREATE INDEX idx_comments_recent ON comments (created_at DESC);
CREATE INDEX idx_comments_ip ON comments (ip_hash, created_at DESC);

-- Rate limiting: max 10 leaderboard submissions per IP per hour
-- (enforce in application code, index supports the query)

-- RLS (Row Level Security) policies
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Allow public read
CREATE POLICY "Anyone can read leaderboard" ON leaderboard
  FOR SELECT USING (true);

CREATE POLICY "Anyone can read comments" ON comments
  FOR SELECT USING (true);

-- Allow public insert (with app-level validation)
CREATE POLICY "Anyone can submit scores" ON leaderboard
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can post comments" ON comments
  FOR INSERT WITH CHECK (true);

-- ============================================
-- Optional: Auto-cleanup old daily entries
-- Uncomment if you want automatic cleanup
-- ============================================
-- CREATE OR REPLACE FUNCTION cleanup_old_entries()
-- RETURNS void AS $$
-- BEGIN
--   DELETE FROM leaderboard WHERE created_at < NOW() - INTERVAL '90 days';
--   DELETE FROM comments WHERE created_at < NOW() - INTERVAL '90 days';
-- END;
-- $$ LANGUAGE plpgsql;
