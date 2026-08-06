import React from 'react';
import { Flame, Trophy, ShieldAlert, CheckCircle2, ExternalLink, Calendar } from 'lucide-react';

export default function UserDetailModal({ member, onClose }) {
  if (!member) return null;

  const historyKeys = Object.keys(member.history || {}).sort((a, b) => new Date(b) - new Date(a));

  return (
    <div className="modal-overlay">
      <div className="modal-content detail-modal">
        <div className="modal-header">
          <div className="user-profile-header">
            <img 
              src={member.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"} 
              alt={member.name} 
              className="user-avatar-large"
              style={{ borderColor: member.color || '#aa3bff' }}
            />
            <div>
              <h2>{member.name}</h2>
              <a 
                href={`https://leetcode.com/${member.leetcodeUsername}/`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="leetcode-handle-link"
              >
                @{member.leetcodeUsername} <ExternalLink size={12} />
              </a>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="user-stats-grid">
            <div className="user-stat-card">
              <Flame size={20} className="text-orange" />
              <div>
                <span className="stat-val">{member.currentStreak} Days</span>
                <span className="stat-lbl">Active Streak</span>
              </div>
            </div>

            <div className="user-stat-card">
              <Trophy size={20} className="text-accent" />
              <div>
                <span className="stat-val">{member.totalPoints} Pts</span>
                <span className="stat-lbl">Total Points</span>
              </div>
            </div>

            <div className="user-stat-card">
              <ShieldAlert size={20} className="text-pink" />
              <div>
                <span className="stat-val">₹{member.penaltiesPaid}</span>
                <span className="stat-lbl">Penalties Paid</span>
              </div>
            </div>
          </div>

          <h3 className="section-subtitle">
            <Calendar size={16} /> Submission & Fine Audit Log
          </h3>

          {historyKeys.length === 0 ? (
            <p className="empty-text">No activity history recorded yet.</p>
          ) : (
            <div className="history-list">
              {historyKeys.map(date => {
                const log = member.history[date];
                return (
                  <div key={date} className={`history-item ${log.solved ? 'item-solved' : 'item-fined'}`}>
                    <div className="history-date">
                      <span>{date}</span>
                    </div>

                    <div className="history-status">
                      {log.solved ? (
                        <div className="status-badge status-solved">
                          <CheckCircle2 size={14} /> Solved ({log.titleSlug || 'Daily Challenge'})
                        </div>
                      ) : log.penaltyApplied ? (
                        <div className="status-badge status-fined">
                          <ShieldAlert size={14} /> Fined ₹{log.penaltyAmount || 50} (Missed Target)
                        </div>
                      ) : (
                        <div className="status-badge status-pending">Pending</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Close Profile</button>
        </div>
      </div>
    </div>
  );
}
