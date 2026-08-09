import { supabase } from './supabaseClient';

// ─── Helpers ───
function snakeToCamel(obj) {
  const map = {
    leetcode_username: 'leetcodeUsername',
    verified_bio: 'verifiedBio',
    initial_deposit: 'initialDeposit',
    deposit_balance: 'depositBalance',
    current_streak: 'currentStreak',
    total_points: 'totalPoints',
    solved_count: 'solvedCount',
    penalties_paid: 'penaltiesPaid',
    created_at: 'createdAt',
    title_slug: 'titleSlug',
    leetcode_url: 'leetcodeUrl',
    solution_url: 'solutionUrl',
    date_assigned: 'dateAssigned',
    points_value: 'pointsValue',
    penalty_amount: 'penaltyAmount',
    member_id: 'memberId',
    task_slug: 'taskSlug',
    verified_at: 'verifiedAt',
    penalty_applied: 'penaltyApplied',
    applied_at: 'appliedAt',
    auth_uid: 'authUid',
    is_blocked: 'isBlocked',
    deposit_status: 'depositStatus',
    utr_number: 'utrNumber'
  };
  const result = {};
  for (const [key, val] of Object.entries(obj)) {
    result[map[key] || key] = val;
  }
  return result;
}

function camelToSnake(obj) {
  const map = {
    leetcodeUsername: 'leetcode_username',
    verifiedBio: 'verified_bio',
    initialDeposit: 'initial_deposit',
    depositBalance: 'deposit_balance',
    currentStreak: 'current_streak',
    totalPoints: 'total_points',
    solvedCount: 'solved_count',
    penaltiesPaid: 'penalties_paid',
    createdAt: 'created_at',
    titleSlug: 'title_slug',
    leetcodeUrl: 'leetcode_url',
    solutionUrl: 'solution_url',
    dateAssigned: 'date_assigned',
    pointsValue: 'points_value',
    penaltyAmount: 'penalty_amount',
    memberId: 'member_id',
    taskSlug: 'task_slug',
    verifiedAt: 'verified_at',
    penaltyApplied: 'penalty_applied',
    appliedAt: 'applied_at',
    authUid: 'auth_uid',
    isBlocked: 'is_blocked',
    depositStatus: 'deposit_status',
    utrNumber: 'utr_number'
  };
  const result = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val === undefined) continue;
    result[map[key] || key] = val;
  }
  return result;
}

// ─── Default seed data ───
const DEFAULT_DAILY_TASK = {
  id: 1,
  title: 'Two Sum',
  title_slug: 'two-sum',
  platform: 'LeetCode',
  difficulty: 'Easy',
  category: 'Arrays',
  sheet: 'NeetCode 150',
  leetcode_url: 'https://leetcode.com/problems/two-sum/',
  solution_url: null,
  date_assigned: new Date().toISOString().split('T')[0],
  points_value: 10,
  penalty_amount: 50
};

// ─── Members ───

export async function fetchMembers() {
  // Clean up any leftover admin member entries if they exist
  await supabase
    .from('members')
    .delete()
    .or('leetcode_username.ilike.shivamkumarninety,gmail.ilike.%shivamkumarninety%');

  const { data: rows, error } = await supabase
    .from('members')
    .select('*')
    .order('total_points', { ascending: false });

  if (error) {
    console.error('fetchMembers error:', error);
    return [];
  }

  // For each member, fetch their submissions and build the history map
  const members = [];
  for (const row of rows) {
    const member = snakeToCamel(row);

    const { data: subs } = await supabase
      .from('submissions')
      .select('*')
      .eq('member_id', member.id);

    const history = {};
    if (subs) {
      for (const sub of subs) {
        history[sub.date] = {
          solved: sub.solved,
          titleSlug: sub.task_slug,
          verifiedAt: sub.verified_at,
          penaltyApplied: sub.penalty_applied,
          penaltyAmount: sub.penalty_amount,
          appliedAt: sub.applied_at
        };
      }
    }
    member.history = history;
    members.push(member);
  }

  return members;
}

export async function fetchMemberByAuthUid(authUid) {
  if (!authUid) return null;
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('auth_uid', authUid)
    .single();

  if (error || !data) return null;
  
  const member = snakeToCamel(data);

  // Also fetch submissions/history
  const { data: subs } = await supabase
    .from('submissions')
    .select('*')
    .eq('member_id', member.id);

  const history = {};
  if (subs) {
    for (const sub of subs) {
      history[sub.date] = {
        solved: sub.solved,
        titleSlug: sub.task_slug,
        verifiedAt: sub.verified_at,
        penaltyApplied: sub.penalty_applied,
        penaltyAmount: sub.penalty_amount,
        appliedAt: sub.applied_at
      };
    }
  }
  member.history = history;
  return member;
}

export async function insertMember(member) {
  // Remove history, password, and any non-column fields before inserting
  const { history: _history, password: _password, ...rest } = member;
  const row = camelToSnake(rest);
  const { error } = await supabase.from('members').insert(row);
  if (error) {
    console.error('insertMember error:', error);
    return false;
  }
  return true;
}

export async function updateMember(member) {
  const { history: _history, password: _password, ...rest } = member;
  const row = camelToSnake(rest);
  const { error } = await supabase
    .from('members')
    .update(row)
    .eq('id', member.id);
  if (error) {
    console.error('updateMember error:', error);
    return false;
  }
  return true;
}

// ─── Submissions ───

export async function upsertSubmission(memberId, date, data) {
  const row = {
    member_id: memberId,
    date,
    task_slug: data.titleSlug || null,
    solved: data.solved || false,
    verified_at: data.verifiedAt || null,
    penalty_applied: data.penaltyApplied || false,
    penalty_amount: data.penaltyAmount || 0,
    applied_at: data.appliedAt || null
  };

  const { error } = await supabase
    .from('submissions')
    .upsert(row, { onConflict: 'member_id,date' });

  if (error) {
    console.error('upsertSubmission error:', error);
    return false;
  }
  return true;
}

// ─── Daily Task ───

export async function fetchDailyTask() {
  const { data, error } = await supabase
    .from('daily_task')
    .select('*')
    .eq('id', 1)
    .single();

  if (error || !data) {
    // Auto-seed the default task
    console.log('No daily task found, seeding default...');
    await supabase.from('daily_task').upsert(DEFAULT_DAILY_TASK);
    return snakeToCamel(DEFAULT_DAILY_TASK);
  }

  return snakeToCamel(data);
}

export async function updateDailyTask(task) {
  const row = camelToSnake({ ...task, id: 1 });
  const { error } = await supabase
    .from('daily_task')
    .upsert(row);
  if (error) {
    console.error('updateDailyTask error:', error);
    return false;
  }
  return true;
}
