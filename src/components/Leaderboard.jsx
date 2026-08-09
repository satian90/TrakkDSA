import React, { useState } from 'react';
import { 
  Trophy, Flame, CheckCircle2, Clock, ExternalLink, 
  RefreshCw, ShieldAlert, Award, Wallet, ShieldCheck
} from 'lucide-react';

export default function Leaderboard({ 
  members, 
  currentDate, 
  onVerifyMember, 
  onToggleManualSolved,
  onApplyPenalty,
  onToggleBlockMember,
  onApprovePayment,
  onRejectPayment,
  onOpenDepositModal,
  onSelectMember,
  userRole,
  currentUser
}) {
  const [activeTab, setActiveTab] = useState('leaderboard'); // 'leaderboard' | 'stakes' | 'payments'
  const [loadingId, setLoadingId] = useState(null);

  // Filter members with pending payments
  const pendingPayments = members.filter(m => m.depositStatus === 'PENDING' || (m.utrNumber && m.depositStatus !== 'APPROVED'));
  const pendingPaymentsCount = pendingPayments.length;

  // Sort members by totalPoints descending, then currentStreak descending
  const sortedMembers = [...members].sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    return b.currentStreak - a.currentStreak;
  });

  const handleVerifyClick = async (member) => {
    setLoadingId(member.id);
    await onVerifyMember(member);
    setLoadingId(null);
  };

  const getRankBadge = (index) => {
    if (index === 0) return <span className="rank-badge rank-1"><Trophy size={14} /> 1st</span>;
    if (index === 1) return <span className="rank-badge rank-2"><Award size={14} /> 2nd</span>;
    if (index === 2) return <span className="rank-badge rank-3"><Award size={14} /> 3rd</span>;
    return <span className="rank-badge rank-default">#{index + 1}</span>;
  };

  return (
    <div className="leaderboard-section modern-leaderboard">
      <div className="section-header-row">
        <div className="tabs-header">
          <button 
            className={`tab-btn ${activeTab === 'leaderboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('leaderboard')}
          >
            <Trophy size={18} />
            <span>Group Leaderboard</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'stakes' ? 'active' : ''}`}
            onClick={() => setActiveTab('stakes')}
          >
            <Wallet size={18} />
            <span>Deposit Balances & Fines</span>
          </button>
          {userRole === 'admin' && (
            <button 
              className={`tab-btn ${activeTab === 'payments' ? 'active' : ''}`}
              onClick={() => setActiveTab('payments')}
              style={{ position: 'relative' }}
            >
              <ShieldCheck size={18} />
              <span>Pending Payment Approvals</span>
              {pendingPaymentsCount > 0 && (
                <span style={{ background: '#ef4444', color: '#ffffff', padding: '2px 7px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: '800', marginLeft: '6px' }}>
                  {pendingPaymentsCount}
                </span>
              )}
            </button>
          )}
        </div>

        {userRole !== 'admin' && onOpenDepositModal && (
          <button 
            className="btn btn-sm btn-primary"
            onClick={onOpenDepositModal}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}
          >
            <Wallet size={14} />
            <span>Deposit / Top Up Collateral</span>
          </button>
        )}
      </div>

      {activeTab === 'leaderboard' ? (
        <div className="table-responsive">
          <table className="custom-table modern-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Member</th>
                <th>Handle / Profile</th>
                <th>Streak</th>
                <th>Score</th>
                <th>Status ({currentDate})</th>
                {userRole === 'admin' && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {sortedMembers.length === 0 ? (
                <tr>
                  <td colSpan={userRole === 'admin' ? "7" : "6"} style={{ textAlign: 'center', padding: '48px 24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-main)' }}>No members tracked yet</span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Create an account to start tracking!</span>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedMembers.map((member, index) => {
                  const dayLog = member.history?.[currentDate] || {};
                  const isSolved = dayLog.solved;
                  const isFined = dayLog.penaltyApplied;
                  const isLoading = loadingId === member.id;
                  const isSelf = currentUser && currentUser.id === member.id;

                  return (
                    <tr 
                      key={member.id} 
                      className={isSolved ? 'row-completed' : ''}
                      style={isSelf ? { background: 'rgba(16, 185, 129, 0.14)', borderLeft: '4px solid #10b981' } : {}}
                    >
                      <td>{getRankBadge(index)}</td>

                      <td>
                        <div className="user-profile-cell" onClick={() => onSelectMember(member)}>
                          <img 
                            src={member.avatar} 
                            alt={member.name} 
                            className="user-avatar"
                            style={{ borderColor: member.color || '#6366f1' }}
                          />
                          <div className="user-name-info">
                            <div className="name-with-verified">
                              <span className="user-name" style={isSelf ? { fontWeight: '800', color: 'var(--text-main)' } : {}}>
                                {member.name} {isSelf && " (You)"}
                              </span>
                              {member.verifiedBio && (
                                <span className="verified-badge-pill" title={`Verified Gmail: ${member.gmail}`}>
                                  <ShieldCheck size={12} /> Verified
                                </span>
                              )}
                              {member.isBlocked && (
                                <span className="blocked-badge-pill" style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fca5a5', padding: '2px 6px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: '700' }} title="User account is blocked">
                                  <ShieldAlert size={12} style={{ display: 'inline', marginRight: '3px' }} /> Blocked
                                </span>
                              )}
                            </div>
                            <span className="user-solved-count">{member.solvedCount || 0} total solved</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <a 
                          href={member.platform === 'Codeforces' ? `https://codeforces.com/profile/${member.leetcodeUsername}` : `https://leetcode.com/${member.leetcodeUsername}/`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="leetcode-handle-link"
                          onClick={(e) => e.stopPropagation()}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        >
                          <span style={{ 
                            fontSize: '0.7rem', 
                            padding: '2px 6px', 
                            borderRadius: '4px', 
                            background: member.platform === 'Codeforces' ? '#fee2e2' : '#fef3c7', 
                            color: member.platform === 'Codeforces' ? '#ef4444' : '#d97706', 
                            fontWeight: '800' 
                          }}>
                            {member.platform === 'Codeforces' ? 'CF' : 'LC'}
                          </span>
                          @{member.leetcodeUsername} <ExternalLink size={11} />
                        </a>
                      </td>

                      <td>
                        <div className="streak-badge">
                          <Flame size={16} className={member.currentStreak > 0 ? "flame-active" : "flame-inactive"} />
                          <span>{member.currentStreak} days</span>
                        </div>
                      </td>

                      <td>
                        <div className="points-pill">
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

                      {userRole === 'admin' && (
                        <td>
                          <div className="action-buttons-group">
                            <button 
                              className="btn btn-icon btn-secondary" 
                              onClick={() => handleVerifyClick(member)}
                              disabled={isLoading}
                              title="Auto-Verify via API"
                            >
                              <RefreshCw size={14} className={isLoading ? "spin" : ""} />
                            </button>

                            <button 
                              className={`btn btn-xs ${isSolved ? 'btn-outline' : 'btn-primary'}`}
                              onClick={() => onToggleManualSolved(member)}
                            >
                              {isSolved ? 'Undo' : 'Mark Solved'}
                            </button>

                            {!isSolved && !isFined && (
                              <button 
                                className="btn btn-xs btn-danger"
                                onClick={() => onApplyPenalty(member)}
                                title="Deduct ₹50 fine from member's security deposit"
                              >
                                Apply Fine
                              </button>
                            )}
                            {onToggleBlockMember && (
                              <button 
                                className={`btn btn-xs ${member.isBlocked ? 'btn-outline' : 'btn-danger'}`}
                                onClick={() => onToggleBlockMember(member)}
                                title={member.isBlocked ? "Unblock this user" : "Block this user from logging in"}
                                style={member.isBlocked ? { borderColor: '#10b981', color: '#10b981' } : {}}
                              >
                                {member.isBlocked ? 'Unblock' : 'Block'}
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      ) : activeTab === 'stakes' ? (
        <div className="table-responsive">
          <table className="custom-table modern-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>LeetCode Handle / Email</th>
                <th>Initial Stake</th>
                <th>Current Deposit Balance</th>
                <th>Total Penalties Deducted</th>
                <th>Streak Protection Status</th>
              </tr>
            </thead>
            <tbody>
              {sortedMembers.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '48px 24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-main)' }}>No stakes or deposits recorded</span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Add members to see their security deposit and penalty history.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedMembers.map((member) => {
                  const depositHealth = Math.round((member.depositBalance / member.initialDeposit) * 100);
                  const isSelf = currentUser && currentUser.id === member.id;
                  const displayEmail = member.gmail && !member.gmail.endsWith('@codestake.app') 
                    ? member.gmail 
                    : `@${member.leetcodeUsername}`;

                  return (
                    <tr 
                      key={member.id}
                      style={isSelf ? { background: '#f0fdf4', borderLeft: '4px solid #10b981' } : {}}
                    >
                      <td>
                        <div className="user-profile-cell">
                          <img src={member.avatar} alt={member.name} className="user-avatar" />
                          <span className="user-name" style={isSelf ? { fontWeight: '800', color: 'var(--text-main)' } : {}}>
                            {member.name} {isSelf && " (You)"}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="text-muted font-monospace">{displayEmail}</span>
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
                })
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="custom-table modern-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Handle / Email</th>
                <th>Collateral Amount</th>
                <th>12-Digit UTR Ref ID</th>
                <th>Submission Status</th>
                <th>Admin Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingPayments.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '48px 24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-main)' }}>No pending payment verifications</span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>All member collateral deposits are verified & approved!</span>
                    </div>
                  </td>
                </tr>
              ) : (
                pendingPayments.map((member) => (
                  <tr key={member.id}>
                    <td>
                      <div className="user-profile-cell">
                        <img src={member.avatar} alt={member.name} className="user-avatar" />
                        <span className="user-name" style={{ fontWeight: '700', color: 'var(--text-main)' }}>
                          {member.name}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>@{member.leetcodeUsername}</span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{member.gmail}</span>
                      </div>
                    </td>
                    <td>
                      <strong style={{ color: '#10b981', fontSize: '0.95rem' }}>₹{member.initialDeposit || 500}</strong>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <code style={{ background: 'var(--bg-card-subtle)', padding: '4px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', color: 'var(--accent-primary)', fontWeight: '700', fontSize: '0.88rem' }}>
                          {member.utrNumber || 'N/A'}
                        </code>
                        {member.utrNumber && (
                          <button 
                            className="btn btn-xs btn-outline"
                            onClick={() => {
                              navigator.clipboard.writeText(member.utrNumber);
                              alert(`Copied UTR: ${member.utrNumber}`);
                            }}
                            title="Copy UTR Number"
                            style={{ padding: '2px 6px', fontSize: '0.75rem' }}
                          >
                            Copy
                          </button>
                        )}
                      </div>
                    </td>
                    <td>
                      {member.depositStatus === 'APPROVED' ? (
                        <span className="status-badge status-solved">Approved ✅</span>
                      ) : member.depositStatus === 'REJECTED' ? (
                        <span className="status-badge status-fined">Rejected ❌</span>
                      ) : (
                        <span className="status-badge status-pending">Pending Review ⏳</span>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons-group">
                        <button 
                          className="btn btn-xs btn-primary"
                          onClick={() => onApprovePayment(member)}
                          style={{ background: '#10b981', borderColor: '#059669', color: '#ffffff' }}
                        >
                          Approve Payment
                        </button>
                        <button 
                          className="btn btn-xs btn-danger"
                          onClick={() => onRejectPayment(member)}
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
