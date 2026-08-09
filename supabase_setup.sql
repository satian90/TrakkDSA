-- ==============================================
-- CodeStake Supabase Setup Script V2
-- ==============================================

-- 1. Sprints
CREATE TABLE IF NOT EXISTS sprints (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  initial_deposit INTEGER DEFAULT 500,
  daily_penalty INTEGER DEFAULT 50,
  status TEXT DEFAULT 'ACTIVE', -- ACTIVE | CLOSED
  curriculum_sheet TEXT DEFAULT 'NeetCode 150',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Curriculum Problems
CREATE TABLE IF NOT EXISTS curriculum_problems (
  id BIGSERIAL PRIMARY KEY,
  sheet TEXT NOT NULL,
  category TEXT,
  title TEXT NOT NULL,
  title_slug TEXT UNIQUE NOT NULL,
  difficulty TEXT,
  sort_order INTEGER,
  difficulty_rank INTEGER, -- 1=Easy, 2=Medium, 3=Hard
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Members
CREATE TABLE IF NOT EXISTS members (
  id TEXT PRIMARY KEY,
  auth_uid UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  gmail TEXT,
  leetcode_username TEXT NOT NULL,
  platform TEXT NOT NULL DEFAULT 'LeetCode',
  verified_bio BOOLEAN DEFAULT FALSE,
  avatar TEXT,
  color TEXT,
  initial_deposit INTEGER DEFAULT 0,
  deposit_balance INTEGER DEFAULT 0,
  debt_balance INTEGER DEFAULT 0,
  deposit_status TEXT DEFAULT 'PENDING', -- PENDING | APPROVED
  utr_number TEXT,
  is_blocked BOOLEAN DEFAULT FALSE,
  current_streak INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  solved_count INTEGER DEFAULT 0,
  penalties_paid INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Daily Task
CREATE TABLE IF NOT EXISTS daily_task (
  id INTEGER PRIMARY KEY DEFAULT 1,
  sprint_id BIGINT REFERENCES sprints(id),
  curriculum_problem_id BIGINT REFERENCES curriculum_problems(id),
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
  penalty_amount INTEGER DEFAULT 50,
  auto_assigned BOOLEAN DEFAULT FALSE
);

-- 5. Submissions
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

-- 6. Holidays
CREATE TABLE IF NOT EXISTS holidays (
  id BIGSERIAL PRIMARY KEY,
  date TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Payouts
CREATE TABLE IF NOT EXISTS payouts (
  id BIGSERIAL PRIMARY KEY,
  sprint_id BIGINT REFERENCES sprints(id),
  member_id TEXT REFERENCES members(id),
  amount INTEGER NOT NULL,
  points_share NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Drop unused tables
DROP TABLE IF EXISTS admin_accounts;

-- Enable RLS
ALTER TABLE sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculum_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_task ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;

-- Note on RLS Policies:
-- We allow all reads to authenticated/anon users so the dashboard renders.
-- Write permissions are restricted.

CREATE POLICY "Allow read on sprints" ON sprints FOR SELECT USING (true);
CREATE POLICY "Allow read on curriculum_problems" ON curriculum_problems FOR SELECT USING (true);
CREATE POLICY "Allow read on members" ON members FOR SELECT USING (true);
CREATE POLICY "Allow read on daily_task" ON daily_task FOR SELECT USING (true);
CREATE POLICY "Allow read on submissions" ON submissions FOR SELECT USING (true);
CREATE POLICY "Allow read on holidays" ON holidays FOR SELECT USING (true);
CREATE POLICY "Allow read on payouts" ON payouts FOR SELECT USING (true);

-- Members can insert/update their OWN row.
CREATE POLICY "Members can insert their own row" ON members FOR INSERT WITH CHECK (auth.uid() = auth_uid);
CREATE POLICY "Members can update their own row" ON members FOR UPDATE USING (auth.uid() = auth_uid);

-- Submissions can be inserted/updated by the member.
CREATE POLICY "Members can manage their own submissions" ON submissions FOR ALL USING (
  member_id IN (SELECT id FROM members WHERE auth_uid = auth.uid())
);

-- Helper function to identify admins based on known email addresses
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
BEGIN
  RETURN (auth.jwt() ->> 'email' = 'shivamkumarninety@gmail.com' OR auth.jwt() ->> 'email' = 'admin@codestake.app');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin policies (Full Access)
CREATE POLICY "Admin full access on sprints" ON sprints FOR ALL USING (is_admin());
CREATE POLICY "Admin full access on curriculum_problems" ON curriculum_problems FOR ALL USING (is_admin());
CREATE POLICY "Admin full access on members" ON members FOR ALL USING (is_admin());
CREATE POLICY "Admin full access on daily_task" ON daily_task FOR ALL USING (is_admin());
CREATE POLICY "Admin full access on submissions" ON submissions FOR ALL USING (is_admin());
CREATE POLICY "Admin full access on holidays" ON holidays FOR ALL USING (is_admin());
CREATE POLICY "Admin full access on payouts" ON payouts FOR ALL USING (is_admin());

-- Note: Edge functions will manage background tasks (penalties, daily tasks) using the SERVICE_ROLE key which bypasses RLS.
