import React, { useState, useEffect, useCallback } from 'react';
import Captcha from './components/Captcha';
import Header from './components/Header';
import DailyChallengeCard from './components/DailyChallengeCard';
import Leaderboard from './components/Leaderboard';
import PenaltyPoolCard from './components/PenaltyPoolCard';
import ProblemSheetBrowser from './components/ProblemSheetBrowser';
import UserDetailModal from './components/UserDetailModal';
import Footer from './components/Footer';
import AdminLoginModal from './components/AdminLoginModal';
import UpiDepositModal from './components/UpiDepositModal';

import { verifyDailySubmission, verifyPlatformProfile } from './services/platformService';
import { fetchMembers, insertMember, updateMember, upsertSubmission, fetchDailyTask, updateDailyTask, fetchMemberByAuthUid } from './services/dbService';
import { signUpMember, signIn, signOut, getSession, onAuthStateChange, isAdmin as checkIsAdmin, buildEmailFromUsername } from './services/authService';
import { Sparkles, CheckCircle, ShieldAlert, AlertCircle, ArrowRight, UserCheck, Users, Key, Loader2, X } from 'lucide-react';
import './App.css';

function App() {
  // Theme state: default to 'dark' or stored preference
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('codestake_theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('codestake_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Views and role states — start with null, session check will populate
  const [currentView, setCurrentView] = useState('landing');
  const [userRole, setUserRole] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [_authUser, setAuthUser] = useState(null); // Supabase Auth user object

  // Database-backed state
  const [members, setMembers] = useState([]);
  const [dailyTask, setDailyTask] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [currentDate, setCurrentDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Modals state
  const [isSheetBrowserOpen, setIsSheetBrowserOpen] = useState(false);
  const [isPenaltyModalOpen, setIsPenaltyModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isUpiModalOpen, setIsUpiModalOpen] = useState(false);
  const [selectedMemberDetail, setSelectedMemberDetail] = useState(null);

  // Notification Toast state
  const [toast, setToast] = useState(null);

  // Sign up Form states
  const [signupUsername, setSignupUsername] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  const [isVerifyingSignup, setIsVerifyingSignup] = useState(false);
  const [signupError, setSignupError] = useState('');

  // Member Login Form states
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Admin Login state
  const [adminLoginError, setAdminLoginError] = useState('');

  // Captcha states
  const [isLoginCaptchaVerified, setIsLoginCaptchaVerified] = useState(false);
  const [isSignupCaptchaVerified, setIsSignupCaptchaVerified] = useState(false);

  // Typewriter animation state for landing hero
  const [stakeDisplay, setStakeDisplay] = useState('');

  // Filter out any admin accounts from competing members list (admins are moderators/organizers only)
  const competingMembers = members.filter(m => {
    if (!m) return false;
    const isAuthAdmin = _authUser && _authUser.id === m.authUid && checkIsAdmin(_authUser);

    return !isAuthAdmin;
  });

  // Sync current user details from members list
  const loggedInMember = competingMembers.find(m => m.id === currentUser?.id) || null;

  // Calculate group pot dynamically from total penalties paid by competing members
  const groupPot = competingMembers.reduce((sum, m) => sum + (m.penaltiesPaid || 0), 0);

  // Refresh all data from Supabase
  const refreshData = useCallback(async () => {
    const [membersData, taskData] = await Promise.all([
      fetchMembers(),
      fetchDailyTask()
    ]);
    setMembers(membersData);
    setDailyTask(taskData);
  }, []);

  // Toggle manual solved status for a member
  const handleToggleManualSolved = useCallback(async (member) => {
    if (!dailyTask) return;
    const dayLog = member.history?.[currentDate] || {};
    const currentlySolved = !!dayLog.solved;

    let newStreak = member.currentStreak;
    let newPoints = member.totalPoints;
    let newSolvedCount = member.solvedCount;

    if (!currentlySolved) {
      newStreak += 1;
      newPoints += (dailyTask.pointsValue || 10);
      newSolvedCount += 1;
      showToast(`🎉 ${member.name} completed '${dailyTask.title}'! +${dailyTask.pointsValue || 10} pts`, 'success');
    } else {
      newStreak = Math.max(0, newStreak - 1);
      newPoints = Math.max(0, newPoints - (dailyTask.pointsValue || 10));
      newSolvedCount = Math.max(0, newSolvedCount - 1);
      showToast(`Marked ${member.name} as pending.`, 'info');
    }

    // Update the member stats
    await updateMember({
      ...member,
      currentStreak: newStreak,
      totalPoints: newPoints,
      solvedCount: newSolvedCount
    });

    // Upsert the submission record
    await upsertSubmission(member.id, currentDate, {
      solved: !currentlySolved,
      titleSlug: dailyTask.titleSlug,
      verifiedAt: !currentlySolved ? new Date().toISOString() : null,
      penaltyApplied: false
    });

    await refreshData();
  }, [currentDate, dailyTask, refreshData]);

  // Initial data load + Supabase Auth session check
  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        await refreshData();

        // Check for existing Supabase Auth session
        const { session, user } = await getSession();
        if (session && user) {
          setAuthUser(user);
          if (checkIsAdmin(user)) {
            setUserRole('admin');
            setCurrentView('dashboard');
          } else {
            // Look up member by auth UID
            const member = await fetchMemberByAuthUid(user.id);
            if (member) {
              if (member.isBlocked) {
                await signOut();
                setAuthUser(null);
                setCurrentUser(null);
                setUserRole(null);
                setCurrentView('landing');
                window.history.replaceState(null, '', '/');
                showToast("You are blocked. Please contact admin.", "danger");
              } else {
                setCurrentUser(member);
                setUserRole('member');
                setCurrentView('dashboard');
              }
            } else {
              // Stale session detected (member deleted from DB)
              await signOut();
              setAuthUser(null);
              setCurrentUser(null);
              setUserRole(null);
              setCurrentView('landing');
              window.history.replaceState(null, '', '/');
            }
          }
        }
      } catch (err) {
        console.error("Initial load error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [refreshData]);

  // Listen for Supabase Auth state changes (e.g. signed out)
  useEffect(() => {
    const subscription = onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setAuthUser(null);
        setCurrentUser(null);
        setUserRole(null);
        setLoginError('');
        setSignupError('');
        setCurrentView('landing');
        if (window.location.pathname !== '/') {
          window.history.replaceState(null, '', '/');
        }
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Automated background submission tracking for logged-in member
  useEffect(() => {
    if (userRole !== 'member' || !loggedInMember || !dailyTask) return;

    const autoCheckSubmission = async () => {
      // Don't poll if not approved or already marked solved
      if (loggedInMember.depositStatus !== 'APPROVED') return;
      if (loggedInMember.history[currentDate]?.solved) return;

      const result = await verifyDailySubmission(
        loggedInMember.platform || 'LeetCode',
        loggedInMember.leetcodeUsername,
        dailyTask.titleSlug,
        currentDate
      );

      if (result.verified) {
        await handleToggleManualSolved(loggedInMember);
        showToast(`🎉 Auto-Verified! @${loggedInMember.leetcodeUsername} solved '${dailyTask.title}' today!`, 'success');
      }
    };

    autoCheckSubmission();
    const interval = setInterval(autoCheckSubmission, 30000);
    return () => clearInterval(interval);
  }, [userRole, loggedInMember, dailyTask, currentDate, handleToggleManualSolved]);

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [currentView]);

  // Synchronize browser URL bar (e.g. /, /signup, /dashboard, /admin)
  // This runs once on mount to handle direct URL navigation
  useEffect(() => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();

    if (path === '/admin' || hash === '#admin') {
      // Only open admin modal if not already logged in as admin
      if (userRole !== 'admin') {
        setIsAdminModalOpen(true);
      }
    } else if (path === '/signup' || hash === '#signup') {
      setCurrentView('signup');
    }
    // /dashboard is handled by session check in the load effect above
  }, [userRole]);

  useEffect(() => {
    let targetPath = '/';
    if (isAdminModalOpen) {
      targetPath = '/admin';
    } else if (currentView === 'signup') {
      targetPath = '/signup';
    } else if (currentView === 'dashboard') {
      targetPath = '/dashboard';
    }

    if (window.location.pathname !== targetPath) {
      window.history.replaceState(null, '', targetPath);
    }
  }, [currentView, isAdminModalOpen]);

  useEffect(() => {
    const handlePopState = async () => {
      const path = window.location.pathname.toLowerCase();

      // Always check for a valid session before restoring protected views
      const { session } = await getSession();

      if (path === '/dashboard') {
        if (session) {
          setIsAdminModalOpen(false);
          setCurrentView('dashboard');
        } else {
          // No valid session — force back to landing
          setCurrentUser(null);
          setUserRole(null);
          setCurrentView('landing');
          window.history.replaceState(null, '', '/');
        }
      } else if (path === '/admin') {
        if (session) {
          setIsAdminModalOpen(true);
        } else {
          setIsAdminModalOpen(true);
        }
      } else if (path === '/signup') {
        setIsAdminModalOpen(false);
        setCurrentView('signup');
      } else {
        setIsAdminModalOpen(false);
        setCurrentView('landing');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Typewriter loop: type "stake" → hold 3s → delete → pause → repeat
  useEffect(() => {
    const WORD = 'stake';
    let cancelled = false;
    const sleep = (ms) => new Promise(res => setTimeout(res, ms));
    const run = async () => {
      while (!cancelled) {
        for (let i = 1; i <= WORD.length; i++) {
          if (cancelled) return;
          setStakeDisplay(WORD.slice(0, i));
          await sleep(110);
        }
        await sleep(3000);
        for (let i = WORD.length - 1; i >= 0; i--) {
          if (cancelled) return;
          setStakeDisplay(WORD.slice(0, i));
          await sleep(80);
        }
        await sleep(700);
      }
    };
    run();
    return () => { cancelled = true; };
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };



  // Select new daily task
  const handleSelectTask = async (task) => {
    const updatedTask = {
      ...task,
      dateAssigned: currentDate,
      pointsValue: task.difficulty === 'Hard' ? 20 : task.difficulty === 'Medium' ? 15 : 10,
      penaltyAmount: 50
    };
    await updateDailyTask(updatedTask);
    await refreshData();
    showToast(`Updated today's task to '${task.title}' on ${task.platform}!`, 'info');
  };





  // Toggle member block/unblock status (Admin only)
  const handleToggleBlockMember = async (member) => {
    const nextStatus = !member.isBlocked;
    showToast(`${nextStatus ? '🚫 Blocking' : '✅ Unblocking'} @${member.leetcodeUsername}...`, 'info');

    await updateMember({
      ...member,
      isBlocked: nextStatus
    });

    await refreshData();

    if (nextStatus) {
      showToast(`🚫 Blocked @${member.leetcodeUsername}. Access revoked.`, 'warning');
    } else {
      showToast(`✅ Unblocked @${member.leetcodeUsername}. Access restored.`, 'success');
    }
  };

  // Handle UTR Submission by member
  const handleSubmitUtr = async (utrNumber, amount) => {
    if (!loggedInMember) return;

    showToast(`Submitting UTR ${utrNumber} for Admin approval...`, 'info');

    await updateMember({
      ...loggedInMember,
      utrNumber: utrNumber,
      depositStatus: 'PENDING',
      initialDeposit: amount,
      depositBalance: amount
    });

    await refreshData();
    showToast(`🎉 UTR ${utrNumber} submitted! Verification pending Admin approval.`, 'success');
  };

  // Admin Approve Payment
  const handleApprovePayment = async (member) => {
    const amount = member.initialDeposit || 500;
    showToast(`Approving ₹${amount} deposit for @${member.leetcodeUsername}...`, 'info');

    await updateMember({
      ...member,
      depositStatus: 'APPROVED',
      depositBalance: amount
    });

    await refreshData();
    showToast(`✅ Approved ₹${amount} deposit for @${member.leetcodeUsername}!`, 'success');
  };

  // Admin Reject Payment
  const handleRejectPayment = async (member) => {
    showToast(`Rejecting deposit for @${member.leetcodeUsername}...`, 'warning');

    await updateMember({
      ...member,
      depositStatus: 'REJECTED'
    });

    await refreshData();
    showToast(`❌ Rejected deposit for @${member.leetcodeUsername}.`, 'info');
  };

  // Verify single member (moderator/admin trigger)
  const handleVerifyMember = async (member) => {
    showToast(`Checking ${member.platform || 'LeetCode'} submissions for @${member.leetcodeUsername}...`, 'info');

    const result = await verifyDailySubmission(
      member.platform || 'LeetCode',
      member.leetcodeUsername,
      dailyTask.titleSlug,
      currentDate
    );

    if (result.verified) {
      if (!member.history[currentDate]?.solved) {
        await handleToggleManualSolved(member);
      } else {
        showToast(`✅ Confirmed: @${member.leetcodeUsername} solved '${dailyTask.title}'!`, 'success');
      }
    } else {
      if (result.isOfflineMode) {
        showToast(`CORS/API standard restriction. Use 'Mark Solved' or retry.`, 'warning');
      } else {
        showToast(`No accepted submission found for @${member.leetcodeUsername} today.`, 'warning');
      }
    }
  };

  // Auto-verify all members
  const handleVerifyAllMembers = async () => {
    showToast(`Verifying all member submissions...`, 'info');
    let verifiedCount = 0;

    for (const member of competingMembers) {
      if (!member.history[currentDate]?.solved) {
        const result = await verifyDailySubmission(
          member.platform || 'LeetCode',
          member.leetcodeUsername,
          dailyTask.titleSlug,
          currentDate
        );
        if (result.verified) {
          await handleToggleManualSolved(member);
          verifiedCount++;
        }
      }
    }

    if (verifiedCount > 0) {
      showToast(`Verified ${verifiedCount} new member submissions!`, 'success');
    } else {
      showToast(`Completed verification check. No new solutions found.`, 'info');
    }
  };

  // Verify currently logged in user
  const handleVerifySelf = async () => {
    if (!loggedInMember) return;
    showToast(`Checking your ${loggedInMember.platform} submissions...`, 'info');

    const result = await verifyDailySubmission(
      loggedInMember.platform,
      loggedInMember.leetcodeUsername,
      dailyTask.titleSlug,
      currentDate
    );

    if (result.verified) {
      if (!loggedInMember.history[currentDate]?.solved) {
        await handleToggleManualSolved(loggedInMember);
      } else {
        showToast(`✅ Verified: You solved '${dailyTask.title}' today!`, 'success');
      }
    } else {
      if (result.isOfflineMode) {
        showToast(`Could not query API directly. Request admin verification or try again.`, 'warning');
      } else {
        showToast(`No accepted submission found. Please solve the problem first!`, 'warning');
      }
    }
  };

  // Streamlined 1-step sign-up handler with Supabase Auth
  const handleStreamlinedSignup = async (e) => {
    e.preventDefault();
    setSignupError('');

    const username = signupUsername.trim();
    const password = signupPassword.trim();
    const platform = 'LeetCode';

    if (!username || !password) {
      setSignupError('Please enter a platform username and password.');
      return;
    }

    if (password.length < 6) {
      setSignupError('Password must be at least 6 characters.');
      return;
    }

    // Check if username already exists in members table or admin reserved list
    const existing = members.find(
      m => m.leetcodeUsername.toLowerCase() === username.toLowerCase()
    );
    if (existing) {
      const msg = `Username @${username} is already registered on ${platform}. Please sign in instead!`;
      setSignupError(msg);
      showToast(msg, 'warning');
      return;
    }

    if (!isSignupCaptchaVerified) {
      setSignupError('Please solve the security captcha to continue.');
      return;
    }

    setIsVerifyingSignup(true);
    showToast(`Verifying ${platform} profile @${username}...`, 'info');

    const result = await verifyPlatformProfile(platform, username);
    setIsVerifyingSignup(false);

    if (!result.verified && result.error) {
      setSignupError(result.error);
      showToast(result.error, 'danger');
      return;
    }

    // Create Supabase Auth account (password is hashed server-side)
    const email = buildEmailFromUsername(username);
    let authResult = await signUpMember({
      email,
      password,
      platformUsername: username,
      platform
    });

    if (authResult.error) {
      if (authResult.error.toLowerCase().includes('already registered')) {
        // Attempt to login if they are already in auth.users but their members row was deleted
        const loginRes = await signIn(email, password);
        if (loginRes.error) {
           setSignupError("Account already exists in Auth but password was incorrect. Please sign in.");
           showToast("Auth mismatch. Try signing in.", 'warning');
           return;
        }
        authResult = loginRes;
      } else {
        setSignupError(authResult.error);
        showToast(authResult.error, 'danger');
        return;
      }
    }

    // Ensure session is active
    if (!authResult.session) {
      const loginRes = await signIn(email, password);
      if (loginRes.user) {
        authResult = loginRes;
      }
    }

    const realName = result.realName || username;
    const authUid = authResult.user?.id || null;

    const newMember = {
      id: `mem-${Date.now()}`,
      name: realName,
      gmail: email,
      leetcodeUsername: username,
      platform: platform,
      authUid: authUid,
      verifiedBio: true,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username)}`,
      color: '#ffb300',
      initialDeposit: 0,
      depositBalance: 0,
      debtBalance: 0,
      depositStatus: 'PENDING',
      currentStreak: 0,
      totalPoints: 0,
      solvedCount: 0,
      penaltiesPaid: 0,
      history: {}
    };

    const insertResult = await insertMember(newMember);
    if (!insertResult.success) {
      setSignupError(`Database Insert Error: ${insertResult.error}`);
      showToast(`Insert failed: ${insertResult.error}`, 'danger');
      return;
    }

    await refreshData();

    // Fetch the inserted member to get the full object
    const insertedMember = authUid ? await fetchMemberByAuthUid(authUid) : null;
    setAuthUser(authResult.user);
    setCurrentUser(insertedMember || newMember);
    setUserRole('member');
    setCurrentView('dashboard');
    if (window.location.pathname !== '/dashboard') {
      window.history.pushState(null, '', '/dashboard');
    }
    setSignupUsername('');
    setSignupPassword('');
    setSignupError('');
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    showToast(`🎉 Account created & verified! Welcome @${username}`, 'success');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    const username = loginUsername.trim().toLowerCase();
    const password = loginPassword.trim();

    if (!username || !password) {
      setLoginError('Please enter your username and password.');
      return;
    }

    if (!isLoginCaptchaVerified) {
      setLoginError('Please solve the security captcha to continue.');
      return;
    }

    // Sign in via Supabase Auth (password verified server-side, never stored in plain text)
    const email = buildEmailFromUsername(username);
    const authResult = await signIn(email, password);

    if (authResult.error) {
      const msg = "Invalid credentials. Please verify your username and password.";
      setLoginError(msg);
      showToast(msg, "danger");
      return;
    }

    const member = await fetchMemberByAuthUid(authResult.user.id);
    if (!member) {
      const msg = "Hmm, we couldn't find your profile. If you're a new user or your profile was deleted, please click 'Create Account' with these same details to set up your profile!";
      setLoginError(msg);
      showToast(msg, "warning");
      return;
    }

    // Check if user is blocked
    if (member.isBlocked) {
      await signOut();
      const msg = "You are blocked. Please contact admin.";
      setLoginError(msg);
      showToast(msg, "danger");
      return;
    }

    setAuthUser(authResult.user);
    setCurrentUser(member);
    setUserRole('member');
    setCurrentView('dashboard');
    if (window.location.pathname !== '/dashboard') {
      window.history.pushState(null, '', '/dashboard');
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    showToast(`Logged in as @${member.leetcodeUsername}`, "success");
    setLoginUsername('');
    setLoginPassword('');
    setLoginError('');
  };

  const handleAdminModalLogin = async (emailOrUsername, pwd) => {
    setAdminLoginError('');
    const cleanInput = emailOrUsername.trim().toLowerCase();
    const cleanPwd = pwd.trim();

    // Determine email: if it contains @, use as-is; otherwise, treat as username
    const email = cleanInput.includes('@') ? cleanInput : buildEmailFromUsername(cleanInput);

    const authResult = await signIn(email, cleanPwd);

    if (authResult.error) {
      const msg = "Invalid admin credentials.";
      setAdminLoginError(msg);
      showToast(msg, "danger");
      return;
    }

    // Check if this user has admin role
    if (!checkIsAdmin(authResult.user)) {
      const msg = "Access denied. This account does not have admin privileges.";
      setAdminLoginError(msg);
      showToast(msg, "danger");
      // Sign them out since they're not an admin
      await signOut();
      return;
    }

    setIsAdminModalOpen(false);
    setAuthUser(authResult.user);
    setUserRole('admin');
    setCurrentUser(null);
    setCurrentView('dashboard');
    if (window.location.pathname !== '/dashboard') {
      window.history.pushState(null, '', '/dashboard');
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    showToast(`Logged in as Admin`, "success");
    setAdminLoginError('');
  };

  const handleLogout = async () => {
    await signOut();
    setAuthUser(null);
    setCurrentUser(null);
    setUserRole(null);
    setCurrentView('landing');
    window.history.replaceState(null, '', '/');
    showToast("Logged out successfully.");
  };

  // Render views

  // Loading state while fetching from Supabase
  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '16px' }}>
        <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent-primary)' }} />
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Loading CodeStake...</p>
      </div>
    );
  }

  if (currentView === 'landing') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <div className="landing-container" style={{ maxWidth: '800px', margin: '40px auto 60px', padding: '0 20px', flex: 1 }}>
          {/* Landing Page Branding */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 style={{ 
              fontSize: 'clamp(2.8rem, 8vw, 5rem)',
              fontWeight: '900', 
              letterSpacing: '-0.03em', 
              lineHeight: '1.1',
              margin: '0 0 14px 0',
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'center',
              gap: '0'
            }}>
              <span style={{
                background: 'linear-gradient(135deg, var(--accent-primary), #8b5cf6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>code</span>
              <span style={{
                background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>{stakeDisplay}</span>
              <span style={{
                background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontWeight: '300',
                animation: 'blinkCursor 0.85s step-end infinite',
                marginLeft: '1px'
              }}>|</span>
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '10px' }}>
              Automated daily DSA tracking on LeetCode with deposit penalties.
            </p>
          </div>

          {/* Global Stats bar */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '32px' }}>
            <div className="landing-card" style={{ padding: '20px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Stake Pot</span>
              <strong style={{ fontSize: '1.6rem', color: '#10b981' }}>₹{groupPot}</strong>
            </div>
            <div className="landing-card" style={{ padding: '20px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Active Members</span>
              <strong style={{ fontSize: '1.6rem', color: 'var(--accent-primary)' }}>{members.length}</strong>
            </div>
            <div className="landing-card" style={{ padding: '20px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Platform</span>
              <strong style={{ fontSize: '1.6rem', color: 'var(--text-main)' }}>LeetCode</strong>
            </div>
          </div>

          {/* Action Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', alignItems: 'stretch' }}>
            <div className="landing-card" style={{ padding: '28px', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <Users size={22} className="text-accent" />
                <h3 style={{ fontWeight: '700', fontSize: '1.2rem' }}>Join the Challenge</h3>
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '16px' }}>
                Sign up as a new member, verify your LeetCode account profile, deposit collateral, and compete!
              </p>
              <button className="btn btn-primary" onClick={() => { setSignupError(''); setCurrentView('signup'); }} style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: 'auto' }}>
                <span>Create Account</span>
                <ArrowRight size={16} />
              </button>
            </div>

            <div className="landing-card" style={{ padding: '28px', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <Key size={22} className="text-orange" />
                <h3 style={{ fontWeight: '700', fontSize: '1.2rem' }}>Member Sign In</h3>
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                Already a member? Enter your platform username and password to sign in.
              </p>
              <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                {loginError && (
                  <div className="modern-alert modern-alert-danger">
                    <ShieldAlert size={18} style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} />
                    <div className="modern-alert-content" style={{ flex: 1 }}>
                      <span className="modern-alert-title">Auth Error</span>
                      <span className="modern-alert-text">{loginError}</span>
                    </div>
                    <button 
                      type="button" 
                      className="alert-dismiss-btn"
                      onClick={() => setLoginError('')}
                      title="Dismiss error"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
                <input 
                  type="text" 
                  placeholder="LeetCode username (e.g. dev_coder)" 
                  value={loginUsername}
                  onChange={(e) => { setLoginUsername(e.target.value); setLoginError(''); }}
                  required
                  className="form-control"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '0.88rem' }}
                />
                <input 
                  type="password" 
                  placeholder="Password" 
                  value={loginPassword}
                  onChange={(e) => { setLoginPassword(e.target.value); setLoginError(''); }}
                  required
                  className="form-control"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '0.88rem' }}
                />
                
                <Captcha onVerify={setIsLoginCaptchaVerified} />
                
                <button className="btn btn-primary" type="submit" style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: 'auto' }}>
                  <span>Member Login</span>
                  <ArrowRight size={16} />
                </button>
              </form>
            </div>
          </div>
        </div>
        <Footer 
          theme={theme} 
          userRole={userRole}
          onToggleTheme={toggleTheme} 
          onOpenAdminModal={() => {
            setAdminLoginError('');
            setIsAdminModalOpen(true);
          }}
        />
        {isAdminModalOpen && (
          <AdminLoginModal 
            isOpen={isAdminModalOpen}
            onClose={() => setIsAdminModalOpen(false)}
            onAdminLogin={handleAdminModalLogin}
            adminLoginError={adminLoginError}
            onClearError={() => setAdminLoginError('')}
          />
        )}
      </div>
    );
  }

  if (currentView === 'signup') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <div className="signup-container" style={{ maxWidth: '480px', margin: '40px auto 60px', padding: '32px', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
            <UserCheck className="text-accent" size={28} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--text-main)' }}>Create Account & Verify</h2>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '22px' }}>
            Instant 1-step registration. Enter your public profile handle and start competing!
          </p>

          <form onSubmit={handleStreamlinedSignup} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {signupError && (
              <div className="modern-alert modern-alert-danger">
                <ShieldAlert size={18} style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} />
                <div className="modern-alert-content" style={{ flex: 1 }}>
                  <span className="modern-alert-title">Registration Error</span>
                  <span className="modern-alert-text">{signupError}</span>
                </div>
                <button 
                  type="button" 
                  className="alert-dismiss-btn"
                  onClick={() => setSignupError('')}
                  title="Dismiss error"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            <div className="form-group">
              <label style={{ fontWeight: '600', marginBottom: '6px', display: 'block', fontSize: '0.85rem', color: 'var(--text-main)' }}>LeetCode Public @Username</label>
              <input 
                type="text" 
                placeholder="e.g. dev_coder"
                value={signupUsername} 
                onChange={(e) => { setSignupUsername(e.target.value); setSignupError(''); }}
                required
                className="form-control"
                style={{ width: '100%', padding: '10px 14px' }}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label style={{ fontWeight: '600', marginBottom: '6px', display: 'block', fontSize: '0.85rem', color: 'var(--text-main)' }}>Login Password</label>
              <input 
                type="password" 
                placeholder="Choose a password" 
                value={signupPassword} 
                onChange={(e) => { setSignupPassword(e.target.value); setSignupError(''); }}
                required
                className="form-control"
                style={{ width: '100%', padding: '10px 14px' }}
              />
            </div>

            <Captcha onVerify={setIsSignupCaptchaVerified} />

            <div style={{ display: 'flex', gap: '14px', marginTop: '10px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setCurrentView('landing')} style={{ flex: 1, justifyContent: 'center', padding: '12px' }}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={isVerifyingSignup} style={{ flex: 2, justifyContent: 'center', padding: '12px' }}>
                {isVerifyingSignup ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Verifying Profile...</span>
                  </>
                ) : (
                  <>
                    <span>Verify & Create Account</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
        <Footer 
          theme={theme} 
          userRole={userRole}
          onToggleTheme={toggleTheme} 
          onOpenAdminModal={() => {
            setAdminLoginError('');
            setIsAdminModalOpen(true);
          }}
        />
        {isAdminModalOpen && (
          <AdminLoginModal 
            isOpen={isAdminModalOpen}
            onClose={() => setIsAdminModalOpen(false)}
            onAdminLogin={handleAdminModalLogin}
            adminLoginError={adminLoginError}
            onClearError={() => setAdminLoginError('')}
          />
        )}
      </div>
    );
  }

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Toast Banner */}
      {toast && (
        <div className={`toast-notification toast-${toast.type}`}>
          {toast.type === 'success' && <CheckCircle size={18} />}
          {toast.type === 'danger' && <ShieldAlert size={18} />}
          {toast.type === 'warning' && <AlertCircle size={18} />}
          {toast.type === 'info' && <Sparkles size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Main Header */}
      <Header 
        groupPot={groupPot}
        onOpenAddMember={() => { setSignupError(''); setCurrentView('signup'); }}
        onOpenSheetBrowser={() => setIsSheetBrowserOpen(true)}
        onOpenPenaltyModal={() => setIsPenaltyModalOpen(true)}
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        userRole={userRole}
        loggedInMember={loggedInMember}
        onLogout={handleLogout}
      />

      <main className="main-content" style={{ flex: 1 }}>
        {/* Pending Deposit Banner */}
        {userRole === 'member' && loggedInMember?.depositStatus !== 'APPROVED' && (
          <div style={{ background: 'var(--bg-card-subtle)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <AlertCircle className="text-orange" size={24} />
              <div>
                <h4 style={{ fontWeight: '600', margin: '0 0 4px 0', color: 'var(--text-main)' }}>Account Pending Activation</h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0 }}>Deposit collateral to start competing, earn points, and appear on the ranked leaderboard.</p>
              </div>
            </div>
            <button className="btn btn-primary" onClick={() => setIsUpiModalOpen(true)} style={{ whiteSpace: 'nowrap' }}>
              Deposit Now
            </button>
          </div>
        )}

        {/* Daily Assigned Problem Card */}
        <DailyChallengeCard 
          dailyTask={dailyTask}
          onOpenSheetBrowser={() => setIsSheetBrowserOpen(true)}
          members={competingMembers}
          onVerifyAll={handleVerifyAllMembers}
          onVerifySelf={handleVerifySelf}
          userRole={userRole}
          loggedInMember={loggedInMember}
        />

        {/* Group Leaderboard & Deposit Balances */}
        <Leaderboard 
          members={competingMembers}
          dailyTask={dailyTask}
          currentDate={currentDate}
          onVerifyMember={handleVerifyMember}
          onToggleManualSolved={handleToggleManualSolved}
          onToggleBlockMember={handleToggleBlockMember}
          onApprovePayment={handleApprovePayment}
          onRejectPayment={handleRejectPayment}
          onOpenDepositModal={() => setIsUpiModalOpen(true)}
          onSelectMember={setSelectedMemberDetail}
          userRole={userRole}
          currentUser={loggedInMember}
        />
      </main>

      {/* Minimal Big Footer */}
      <Footer 
        theme={theme} 
        userRole={userRole}
        onToggleTheme={toggleTheme} 
        onOpenAdminModal={() => {
          setAdminLoginError('');
          setIsAdminModalOpen(true);
        }}
      />

      {/* Modals */}
      {isSheetBrowserOpen && (
        <ProblemSheetBrowser 
          currentTask={dailyTask}
          onSelectTask={handleSelectTask}
          onClose={() => setIsSheetBrowserOpen(false)}
        />
      )}

      {isPenaltyModalOpen && (
        <PenaltyPoolCard 
          members={members}
          groupPot={groupPot}
          onClose={() => setIsPenaltyModalOpen(false)}
        />
      )}

      {selectedMemberDetail && (
        <UserDetailModal 
          member={selectedMemberDetail}
          onClose={() => setSelectedMemberDetail(null)}
        />
      )}

      {isAdminModalOpen && (
        <AdminLoginModal 
          isOpen={isAdminModalOpen}
          onClose={() => setIsAdminModalOpen(false)}
          onAdminLogin={handleAdminModalLogin}
          adminLoginError={adminLoginError}
          onClearError={() => setAdminLoginError('')}
        />
      )}

      {isUpiModalOpen && (
        <UpiDepositModal 
          isOpen={isUpiModalOpen}
          onClose={() => setIsUpiModalOpen(false)}
          depositAmount={loggedInMember?.initialDeposit || 500}
          onSubmitUtr={handleSubmitUtr}
        />
      )}
    </div>
  );
}

export default App;
