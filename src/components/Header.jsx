import React from 'react';
import { Trophy, Coins, UserPlus, BookOpen, Flame, ShieldAlert, LogOut, Shield, User } from 'lucide-react';

export default function Header({ 
  groupPot, 
  onOpenAddMember, 
  onOpenSheetBrowser, 
  onOpenPenaltyModal,
  currentDate,
  onDateChange,
  userRole,
  loggedInMember,
  onLogout
}) {
  return (
    <header className="app-header modern-header">
      <div className="header-top">
        <div className="brand-logo">
          <div className="logo-icon-modern">
            <Trophy size={22} className="logo-svg" />
          </div>
          <div>
            <h1 className="brand-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              CodeStake 
              <span className="brand-badge">DSA Tracker</span>
              {userRole === 'admin' && (
                <span className="brand-badge" style={{ background: '#0f172a', border: '1px solid #334155' }}>
                  <Shield size={12} style={{ marginRight: '4px', display: 'inline' }} /> Admin Mode
                </span>
              )}
              {userRole === 'member' && (
                <span className="brand-badge" style={{ background: 'var(--accent-primary)' }}>
                  <User size={12} style={{ marginRight: '4px', display: 'inline' }} /> {loggedInMember ? `@${loggedInMember.leetcodeUsername}` : 'Member Mode'}
                </span>
              )}
            </h1>
            <p className="brand-subtitle">Automated LeetCode & Codeforces Verification & Stake Pool</p>
          </div>
        </div>

        <div className="header-actions">
          <div className="pot-pill modern-pot-pill" onClick={onOpenPenaltyModal} title="View Group Penalty Pot Details">
            <Coins size={18} className="coin-icon-indigo" />
            <div className="pot-info">
              <span className="pot-label">Stake Pot</span>
              <span className="pot-value">₹{groupPot.toLocaleString()}</span>
            </div>
          </div>



          {userRole === 'admin' && (
            <>
              <button className="btn btn-secondary" onClick={onOpenSheetBrowser}>
                <BookOpen size={16} />
                <span>Problem Sheets</span>
              </button>
              <button className="btn btn-primary" onClick={onOpenAddMember}>
                <UserPlus size={16} />
                <span>Add Member</span>
              </button>
            </>
          )}

          <button className="btn btn-secondary" onClick={onLogout} title="Exit to Landing Screen" style={{ color: '#e11d48', borderColor: 'var(--border-subtle)' }}>
            <LogOut size={16} />
            <span>{userRole === 'guest' ? 'Exit View' : 'Logout'}</span>
          </button>
        </div>
      </div>

      <div className="header-subbar">
        <div className="date-selector">
          <span className="date-label">Tracking Date:</span>
          <input 
            type="date" 
            value={currentDate} 
            onChange={(e) => onDateChange(e.target.value)}
            className="date-input modern-date-input"
          />
          {currentDate === new Date().toISOString().split('T')[0] && (
            <span className="today-badge">Live Day</span>
          )}
        </div>

        <div className="rules-summary">
          <span className="rule-item">
            <Flame size={14} className="text-orange" /> +10 Pts per solved problem
          </span>
          <span className="rule-item">
            <ShieldAlert size={14} className="text-pink" /> ₹50 Penalty for missed daily target
          </span>
        </div>
      </div>
    </header>
  );
}
