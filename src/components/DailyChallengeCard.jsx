import React, { useState, useEffect } from 'react';
import { ExternalLink, CheckCircle, Clock, Sparkles, BookOpen } from 'lucide-react';

export default function DailyChallengeCard({ 
  dailyTask, 
  onOpenSheetBrowser,
  members,
  onVerifyAll,
  userRole
}) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      
      const diff = endOfDay - now;
      if (diff <= 0) {
        setTimeLeft('Deadline Passed! (Penalty Check Pending)');
        return;
      }
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeft(`${hours.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const solvedCount = members.filter(m => m.history[dailyTask.dateAssigned]?.solved).length;
  const totalCount = members.length;
  const completionPercentage = totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0;

  return (
    <div className="daily-challenge-card modern-challenge-card">
      <div className="card-banner">
        <div className="banner-badge">
          <Sparkles size={15} />
          <span>Today's Daily Target</span>
        </div>
        <div className="deadline-timer">
          <Clock size={14} />
          <span>Submission Deadline: <strong>{timeLeft}</strong></span>
        </div>
      </div>

      <div className="card-main">
        <div className="problem-meta">
          <div className="tags-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span className="platform-pill" style={{ background: dailyTask.platform === 'Codeforces' ? '#fee2e2' : '#fef3c7', color: dailyTask.platform === 'Codeforces' ? '#ef4444' : '#d97706', fontWeight: '700', padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
              {dailyTask.platform || 'LeetCode'}
            </span>
            <span className={`difficulty-badge badge-${dailyTask.difficulty?.toLowerCase()}`}>
              {dailyTask.difficulty}
            </span>
            <span className="category-pill">{dailyTask.category}</span>
            <span className="sheet-pill">{dailyTask.sheet}</span>
          </div>

          <h2 className="problem-title">{dailyTask.title}</h2>
          <p className="problem-slug">Problem ID/Slug: <code>{dailyTask.titleSlug}</code></p>
        </div>

        <div className="problem-actions">
          {userRole !== 'admin' && (
            <a 
              href={dailyTask.leetcodeUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn"
              style={{ 
                background: dailyTask.platform === 'Codeforces' ? '#ef4444' : '#ffa116', 
                color: dailyTask.platform === 'Codeforces' ? '#ffffff' : '#000000', 
                fontWeight: '700' 
              }}
            >
              <span>Solve on {dailyTask.platform || 'LeetCode'}</span>
              <ExternalLink size={16} />
            </a>
          )}

          {userRole !== 'admin' && dailyTask.solutionUrl && (
            <a 
              href={dailyTask.solutionUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn-outline"
            >
              <span>Solution Guide</span>
              <BookOpen size={16} />
            </a>
          )}

          {userRole === 'admin' && (
            <button className="btn btn-secondary" onClick={onOpenSheetBrowser}>
              Change Problem
            </button>
          )}
        </div>
      </div>

      <div className="card-footer">
        <div className="progress-section">
          <div className="progress-header">
            <span>Group Solved ({solvedCount}/{totalCount} Members)</span>
            <span className="percent-text">{completionPercentage}%</span>
          </div>
          <div className="progress-bar-bg">
            <div 
              className="progress-bar-fill" 
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
        </div>

        {userRole === 'admin' ? (
          <button className="btn btn-primary btn-sm" onClick={onVerifyAll}>
            <CheckCircle size={15} />
            <span>Auto-Verify All Members</span>
          </button>
        ) : userRole === 'member' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-card-subtle)', padding: '6px 14px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-subtle)' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981' }}></span>
            <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-main)' }}>
              Auto-Tracking Active (Live Sync)
            </span>
          </div>
        ) : (
          <button 
            className="btn btn-secondary btn-sm" 
            disabled 
            style={{ opacity: '0.6', cursor: 'not-allowed' }}
            title="Log in to verify your daily target submission"
          >
            <CheckCircle size={15} />
            <span>Login to Verify Submission</span>
          </button>
        )}
      </div>
    </div>
  );
}
