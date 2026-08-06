import React from 'react';
import { Coins, ArrowDownRight, Award, Info, CheckCircle } from 'lucide-react';

export default function PenaltyPoolCard({ members, groupPot, onClose }) {
  const totalDeductedPenalties = members.reduce((sum, m) => sum + (m.penaltiesPaid || 0), 0);
  const totalInitialDeposits = members.reduce((sum, m) => sum + (m.initialDeposit || 500), 0);
  const topPerformers = [...members].sort((a, b) => b.totalPoints - a.totalPoints).slice(0, 2);

  const estimatedRewardPerTopSolver = topPerformers.length > 0
    ? Math.round(totalDeductedPenalties / topPerformers.length)
    : 0;

  return (
    <div className="modal-overlay">
      <div className="modal-content penalty-modal">
        <div className="modal-header">
          <div className="title-with-icon">
            <Coins className="text-accent" size={24} />
            <h2>Group Stake & Penalty Pool</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="pot-stats-grid">
            <div className="pot-stat-card pot-stat-primary">
              <span className="stat-label">Accumulated Penalty Pot</span>
              <span className="stat-value">₹{groupPot.toLocaleString()}</span>
              <span className="stat-sub">Funds collected from missed daily targets</span>
            </div>

            <div className="pot-stat-card">
              <span className="stat-label">Total Initial Deposits</span>
              <span className="stat-value">₹{totalInitialDeposits.toLocaleString()}</span>
              <span className="stat-sub">Total collateral staked by members</span>
            </div>

            <div className="pot-stat-card">
              <span className="stat-label">Est. End-of-Month Payout</span>
              <span className="stat-value text-green">₹{estimatedRewardPerTopSolver.toLocaleString()}</span>
              <span className="stat-sub">Per Top Solver bonus reward</span>
            </div>
          </div>

          <div className="rules-box">
            <div className="rules-box-title">
              <Info size={18} />
              <span>How Bank Money Deduction Works (Stake System)</span>
            </div>
            <ul className="rules-list">
              <li>
                <CheckCircle size={14} className="text-green" />
                <strong>Initial Security Deposit:</strong> Each member deposits ₹500 at the start of the challenge month.
              </li>
              <li>
                <ArrowDownRight size={14} className="text-pink" />
                <strong>Daily Miss Penalty:</strong> Failing to submit an Accepted LeetCode solution by 11:59 PM automatically deducts <strong>₹50</strong> from your deposit balance.
              </li>
              <li>
                <Award size={14} className="text-accent" />
                <strong>End-of-Month Winner Bonus:</strong> At the end of the 30-day sprint, the full accumulated penalty pot is redistributed among the Top Leaderboard Solvers!
              </li>
            </ul>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
