-- ==============================================
-- CodeStake Supabase Setup Script
-- Run this ONCE in your Supabase SQL Editor
-- (Project Dashboard → SQL Editor → New Query)
-- ==============================================

-- 1. Members table
CREATE TABLE IF NOT EXISTS members (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  gmail TEXT,
  leetcode_username TEXT NOT NULL,
  platform TEXT NOT NULL DEFAULT 'LeetCode',
  password TEXT NOT NULL,
  verified_bio BOOLEAN DEFAULT FALSE,
  avatar TEXT,
  color TEXT,
  initial_deposit INTEGER DEFAULT 500,
  deposit_balance INTEGER DEFAULT 500,
  current_streak INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  solved_count INTEGER DEFAULT 0,
  penalties_paid INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Daily task (single shared row)
CREATE TABLE IF NOT EXISTS daily_task (
  id INTEGER PRIMARY KEY DEFAULT 1,
  title TEXT,
  title_slug TEXT,
  platform TEXT DEFAULT 'LeetCode',
  difficulty TEXT,
  category TEXT,
  sheet TEXT,
  leetcode_url TEXT,
  solution_url TEXT,
  date_assigned TEXT,
  points_value INTEGER DEFAULT 10,
  penalty_amount INTEGER DEFAULT 50
);

-- 3. Submissions (one per member per day)
CREATE TABLE IF NOT EXISTS submissions (
  id BIGSERIAL PRIMARY KEY,
  member_id TEXT REFERENCES members(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  task_slug TEXT,
  solved BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  penalty_applied BOOLEAN DEFAULT FALSE,
  penalty_amount INTEGER DEFAULT 0,
  applied_at TIMESTAMPTZ,
  UNIQUE(member_id, date)
);

-- 4. Admin accounts
CREATE TABLE IF NOT EXISTS admin_accounts (
  id BIGSERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL
);

-- Disable Row Level Security for all tables (private group app)
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_task ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_accounts ENABLE ROW LEVEL SECURITY;

-- Allow anon key full access (open policies)
CREATE POLICY "Allow all on members" ON members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on daily_task" ON daily_task FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on submissions" ON submissions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on admin_accounts" ON admin_accounts FOR ALL USING (true) WITH CHECK (true);

-- Done! The app will auto-seed the default admin account and daily task on first load.
