import { supabase } from './supabaseClient';

// ─── Sign Up ───
// Creates a Supabase Auth user and returns { user, session, error }
export async function signUpMember({ email, password, platformUsername, platform }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: 'member',
        platform_username: platformUsername,
        platform: platform
      }
    }
  });

  if (error) {
    return { user: null, session: null, error: error.message };
  }

  return { user: data.user, session: data.session, error: null };
}

// ─── Sign In ───
// Authenticates with email + password via Supabase Auth
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    return { user: null, session: null, error: error.message };
  }

  return { user: data.user, session: data.session, error: null };
}

// ─── Sign Out ───
// Destroys the server-side session — browser back button can't restore it
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  // Clear all localStorage auth artifacts
  localStorage.removeItem('codestake_view');
  localStorage.removeItem('codestake_role');
  localStorage.removeItem('codestake_user');
  return { error: error?.message || null };
}

// ─── Get Current Session ───
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session) {
    return { session: null, user: null };
  }
  return { session, user: session.user };
}

// ─── Auth State Change Listener ───
export function onAuthStateChange(callback) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      callback(event, session);
    }
  );
  return subscription;
}

// ─── Role Checks ───
// Admin role is stored in app_metadata (server-side only, can't be tampered with)
// Falls back to user_metadata for initial setup convenience
export function isAdmin(user) {
  if (!user) return false;
  const appRole = user.app_metadata?.role;
  const userRole = user.user_metadata?.role;
  return appRole === 'admin' || userRole === 'admin';
}

export function isMember(user) {
  if (!user) return false;
  return !isAdmin(user);
}

// ─── Get Auth UID ───
export function getAuthUid(user) {
  return user?.id || null;
}

// ─── Build email from platform username ───
// We use a synthetic email so users only need their platform handle
export function buildEmailFromUsername(username) {
  return `${username.trim().toLowerCase()}@codestake.app`;
}
