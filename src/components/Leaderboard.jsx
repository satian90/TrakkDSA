import React, { useState } from 'react';
import { 
  Trophy, Flame, CheckCircle2, Clock, ExternalLink, 
  RefreshCw, ShieldAlert, Award, Wallet, ShieldCheck
} from 'lucide-react';
import { getCodeChefRatingInfo } from '../data/dsaProblems';

export default function Leaderboard({ 
  members, 
  currentDate, 
  onVerifyMember, 
  onToggleManualSolved,
  onApplyPenalty,
  onSelectMember
}) {
  const [activeTab, setActiveTab] = useState('ranklist'); // 'ranklist' | 'stakes'
  const [divisionFilter, setDivisionFilter] = useState('All'); // 'All' | 'Div 1' | 'Div 2' | 'Div 3' | 'Div 4'
  const [loadingId, setLoadingId] = useState(null);

  // Sort members by totalPoints descending, then currentStreak descending
  const sortedMembers = [...members].sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    return b.currentStreak - a.currentStreak;
  });

  const filteredMembers = sortedMembers.filter(m => {
    if (divisionFilter === 'All') return true;
    const ratingInfo = getCodeChefRatingInfo(m.totalPoints);
    return ratingInfo.div === divisionFilter;
  });

  const handleVerifyClick = async (member) => {
    setLoadingId(member.id);
    await onVerifyMember(member);
    setLoadingId(null);
  };

  const getRankBadge = (index) => {
    if (index === 0) return <span className="codechef-rank rank-1"><Trophy size={14} /> 1</span>;
    if (index === 1) return <span className="codechef-rank rank-2"><Award size={14} /> 2</span>;
    if (index === 2) return <span className="codechef-rank rank-3"><Award size={14} /> 3</span>;
    return <span className="codechef-rank rank-default">{index + 1}</span>;
  };

  return (
    <div className="leaderboard-section codechef-leaderboard">
      <div className="section-header">
        <div className="tabs-header">
          <button 
            className={`tab-btn ${activeTab === 'ranklist' ? 'active' : ''}`}
            onClick={() => setActiveTab('ranklist')}
          >
            <Trophy size={18} />
            <span>CodeChef Contest Ranklist</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'stakes' ? 'active' : ''}`}
            onClick={() => setActiveTab('stakes')}
          >
            <Wallet size={18} />
            <span>Security Deposit Stakes</span>
          </button>
        </div>

        {activeTab === 'ranklist' && (
          <div className="div-filters-group">
            <span className="filter-label">Filter Division:</span>
            {['All', 'Div 1', 'Div 2', 'Div 3', 'Div 4'].map(div => (
              <button
                key={div}
                className={`div-filter-btn ${divisionFilter === div ? 'active' : ''}`}
                onClick={() => setDivisionFilter(div)}
              >
                {div}
              </button>
            ))}
          </div>
        )}
      </div>

      {activeTab === 'ranklist' ? (
        <div className="table-responsive">
          <table className="custom-table codechef-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>CodeChef User</th>
                <th>Star Rating</th>
                <th>Division</th>
                <th>Streak</th>
                <th>Score</th>
                <th>Status ({currentDate})</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member, index) => {
                const dayLog = member.history[currentDate] || {};
                const isSolved = dayLog.solved;
                const isFined = dayLog.penaltyApplied;
                const isLoading = loadingId === member.id;
                const ratingInfo = getCodeChefRatingInfo(member.totalPoints);

                return (
                  <tr key={member.id} className={isSolved ? 'row-completed' : ''}>
                    <td>{getRankBadge(index)}</td>

                    <td>
                      <div className="user-profile-cell" onClick={() => onSelectMember(member)}>
                        <img 
                          src={member.avatar} 
                          alt={member.name} 
                          className="user-avatar"
                        />
                        <div className="user-name-info">
                          <div className="name-with-verified">
                            <span className="user-name">{member.name}</span>
                            {member.verifiedBio && (
                              <span className="verified-badge-pill" title={`Verified Gmail: ${member.gmail}`}>
                                <ShieldCheck size={13} /> Verified
                              </span>
                            )}
                          </div>
                          <a 
                            href={`https://leetcode.com/${member.leetcodeUsername}/`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="leetcode-handle-link"
                            onClick={(e) => e.stopPropagation()}
                          >
                            @{member.leetcodeUsername} <ExternalLink size={11} />
                          </a>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className={`star-badge-pill ${ratingInfo.badgeClass}`}>
                        <span className="star-symbol">{ratingInfo.stars}</span>
                        <span className="rating-number">({1200 + member.totalPoints * 8})</span>
                      </div>
                    </td>

                    <td>
                      <span className="division-tag">{ratingInfo.div}</span>
                    </td>

                    <td>
                      <div className="streak-badge">
                        <Flame size={16} className={member.currentStreak > 0 ? "flame-active" : "flame-inactive"} />
                        <span>{member.currentStreak} days</span>
                      </div>
                    </td>

                    <td>
                      <div className="points-pill codechef-score-pill">
                        <span>{member.totalPoints} pts</span>
                      </div>
                    </td>

                    <td>
                      {isSolved ? (
                        <div className="status-badge status-solved">
                          <CheckCircle2 size={15} />
                          <span>Solved</span>
                        </div>
                      ) : isFined ? (
                        <div className="status-badge status-fined">
                          <ShieldAlert size={15} />
                          <span>Fined (₹{dayLog.penaltyAmount || 50})</span>
                        </div>
                      ) : (
                        <div className="status-badge status-pending">
                          <Clock size={15} />
                          <span>Pending</span>
                        </div>
                      )}
                    </td>

                    <td>
                      <div className="action-buttons-group">
                        <button 
                          className="btn btn-icon btn-secondary" 
                          onClick={() => handleVerifyClick(member)}
                          disabled={isLoading}
                          title="Auto-Verify via LeetCode API"
                        >
                          <RefreshCw size={14} className={isLoading ? "spin" : ""} />
                        </button>

                        <button 
                          className={`btn btn-xs ${isSolved ? 'btn-outline' : 'btn-codechef-gold'}`}
                          onClick={() => onToggleManualSolved(member)}
                        >
                          {isSolved ? 'Undo' : 'Mark Solved'}
                        </button>

                        {!isSolved && !isFined && (
                          <button 
                            className="btn btn-xs btn-danger"
                            onClick={() => onApplyPenalty(member)}
                            title="Deduct ₹50 fine from member's stake deposit"
                          >
                            Apply Fine
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="custom-table codechef-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Verified Gmail</th>
                <th>Initial Stake</th>
                <th>Current Deposit Balance</th>
                <th>Total Penalties Deducted</th>
                <th>Streak Protection Status</th>
              </tr>
            </thead>
            <tbody>
              {sortedMembers.map((member) => {
                const depositHealth = Math.round((member.depositBalance / member.initialDeposit) * 100);
                return (
                  <tr key={member.id}>
                    <td>
                      <div className="user-profile-cell">
                        <img src={member.avatar} alt={member.name} className="user-avatar" />
                        <span className="user-name">{member.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className="text-muted font-monospace">{member.gmail || "verified@gmail.com"}</span>
                    </td>
                    <td>₹{member.initialDeposit}</td>
                    <td>
                      <div className="balance-cell">
                        <strong className={depositHealth < 50 ? 'text-pink' : 'text-green'}>
                          ₹{member.depositBalance}
                        </strong>
                        <div className="mini-progress-bar">
                          <div 
                            className={`mini-progress-fill ${depositHealth < 50 ? 'bg-pink' : 'bg-green'}`} 
                            style={{ width: `${depositHealth}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="text-pink fw-bold">₹{member.penaltiesPaid}</td>
                    <td>
                      {member.depositBalance <= 0 ? (
                        <span className="status-badge status-fined">Deposit Exhausted ❌</span>
                      ) : depositHealth < 40 ? (
                        <span className="status-badge status-warning">Low Balance ⚠️</span>
                      ) : (
                        <span className="status-badge status-solved">Active Stake ✅</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
