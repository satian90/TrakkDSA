import React from 'react';
import { Coins, UserPlus, BookOpen, Flame, ShieldAlert, Award } from 'lucide-react';

export default function Header({ 
  groupPot, 
  onOpenAddMember, 
  onOpenSheetBrowser, 
  onOpenPenaltyModal,
  currentDate,
  onDateChange 
}) {
  return (
    <header className="app-header codechef-header">
      <div className="header-top">
        <div className="brand-logo">
          <div className="codechef-logo-icon">
            <span className="chef-hat-icon">👨‍🍳</span>
          </div>
          <div>
            <h1 className="brand-title">
              CodeChef <span className="title-highlight">DSA Arena</span> 
              <span className="codechef-div-tag">Div 1-4 Sprint</span>
            </h1>
            <p className="brand-subtitle">LeetCode & Striver A-Z Group Ranklist with Verified Bio Accounts</p>
          </div>
        </div>

        <div className="header-actions">
          <div className="pot-pill codechef-pot-pill" onClick={onOpenPenaltyModal} title="View Penalty Pool Details">
            <Coins size={20} className="coin-icon-gold" />
            <div className="pot-info">
              <span className="pot-label">Group Stake Pot</span>
              <span className="pot-value">₹{groupPot.toLocaleString()}</span>
            </div>
          </div>

          <button className="btn btn-codechef-secondary" onClick={onOpenSheetBrowser}>
            <BookOpen size={16} />
            <span>Problem Arena</span>
          </button>

          <button className="btn btn-codechef-gold" onClick={onOpenAddMember}>
            <UserPlus size={16} />
            <span>+ Add Verified Member</span>
          </button>
        </div>
      </div>

      <div className="header-subbar codechef-subbar">
        <div className="date-selector">
          <span className="date-label">Tracking Contest Date:</span>
          <input 
            type="date" 
            value={currentDate} 
            onChange={(e) => onDateChange(e.target.value)}
            className="date-input codechef-date-input"
          />
          {currentDate === new Date().toISOString().split('T')[0] && (
            <span className="today-badge codechef-today-badge">Live Day</span>
          )}
        </div>

        <div className="rules-summary">
          <span className="rule-item">
            <Award size={14} className="text-gold" /> CodeChef Star Ratings (1★ – 7★)
          </span>
          <span className="rule-item">
            <Flame size={14} className="text-orange" /> +10 Pts per solved problem
          </span>
          <span className="rule-item">
            <ShieldAlert size={14} className="text-pink" /> ₹50 Fine for missed daily target
          </span>
        </div>
      </div>
    </header>
  );
}
