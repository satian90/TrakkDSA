import React, { useState, useEffect } from 'react';
import { ExternalLink, CheckCircle, Clock, Sparkles, BookOpen, Award } from 'lucide-react';

export default function DailyChallengeCard({ 
  dailyTask, 
  onOpenSheetBrowser,
  members,
  onVerifyAll
}) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      
      const diff = endOfDay - now;
      if (diff <= 0) {
        setTimeLeft('Contest Day Ended (Penalty Check Pending)');
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
    <div className="daily-challenge-card codechef-arena-card">
      <div className="card-banner">
        <div className="banner-badge codechef-banner-badge">
          <Sparkles size={14} />
          <span>CodeChef Contest Arena — Daily Challenge</span>
        </div>
        <div className="deadline-timer codechef-timer">
          <Clock size={14} />
          <span>Submission Deadline: <strong>{timeLeft}</strong></span>
        </div>
      </div>

      <div className="card-main">
        <div className="problem-meta">
          <div className="tags-row">
            <span className="codechef-code-tag">
              Code: <strong>{dailyTask.codechefCode || dailyTask.titleSlug.toUpperCase()}</strong>
            </span>
            <span className="codechef-rating-tag">
              <Award size={12} /> Rating: {dailyTask.estimatedRating || 1200}
            </span>
            <span className={`difficulty-badge badge-${dailyTask.difficulty?.toLowerCase()}`}>
              {dailyTask.difficulty}
            </span>
            <span className="category-pill">{dailyTask.category}</span>
          </div>

          <h2 className="problem-title codechef-problem-title">{dailyTask.title}</h2>
          <p className="problem-slug">Problem Slug: <code>{dailyTask.titleSlug}</code> | Source: <strong>{dailyTask.sheet}</strong></p>
        </div>

        <div className="problem-actions">
          <a 
            href={dailyTask.leetcodeUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn btn-leetcode"
          >
            <span>Submit Solution on LeetCode</span>
            <ExternalLink size={16} />
          </a>

          {dailyTask.solutionUrl && (
            <a 
              href={dailyTask.solutionUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn-outline"
            >
              <span>Editorial / Solution</span>
              <BookOpen size={16} />
            </a>
          )}

          <button className="btn btn-codechef-secondary" onClick={onOpenSheetBrowser}>
            Change Problem
          </button>
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
              className="progress-bar-fill codechef-bar-fill" 
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
        </div>

        <button className="btn btn-codechef-gold btn-sm" onClick={onVerifyAll}>
          <CheckCircle size={15} />
          <span>Auto-Verify All Submissions</span>
        </button>
      </div>
    </div>
  );
}
