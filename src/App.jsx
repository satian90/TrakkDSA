import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import DailyChallengeCard from './components/DailyChallengeCard';
import Leaderboard from './components/Leaderboard';
import PenaltyPoolCard from './components/PenaltyPoolCard';
import ProblemSheetBrowser from './components/ProblemSheetBrowser';
import MemberManagementModal from './components/MemberManagementModal';
import UserDetailModal from './components/UserDetailModal';

import { INITIAL_MEMBERS, DEFAULT_DAILY_TASK } from './data/dsaProblems';
import { verifyDailySubmission } from './services/leetcodeService';
import { Sparkles, CheckCircle, ShieldAlert, AlertCircle } from 'lucide-react';
import './App.css';

function App() {
  // Local storage state initialization
  const [members, setMembers] = useState(() => {
    const saved = localStorage.getItem('codestake_members');
    return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
  });

  const [dailyTask, setDailyTask] = useState(() => {
    const saved = localStorage.getItem('codestake_daily_task');
    return saved ? JSON.parse(saved) : DEFAULT_DAILY_TASK;
  });

  const [currentDate, setCurrentDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Calculate group pot dynamically from total penalties paid
  const groupPot = members.reduce((sum, m) => sum + (m.penaltiesPaid || 0), 0);

  // Modals state
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isSheetBrowserOpen, setIsSheetBrowserOpen] = useState(false);
  const [isPenaltyModalOpen, setIsPenaltyModalOpen] = useState(false);
  const [selectedMemberDetail, setSelectedMemberDetail] = useState(null);

  // Notification Toast state
  const [toast, setToast] = useState(null);

  // Persist members to localStorage
  useEffect(() => {
    localStorage.setItem('codestake_members', JSON.stringify(members));
  }, [members]);

  // Persist daily task to localStorage
  useEffect(() => {
    localStorage.setItem('codestake_daily_task', JSON.stringify(dailyTask));
  }, [dailyTask]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Add new member
  const handleAddMember = (newMember) => {
    setMembers(prev => [...prev, newMember]);
    showToast(`Added ${newMember.name} (@${newMember.leetcodeUsername}) to the tracker!`);
  };

  // Select new daily task from sheets
  const handleSelectTask = (task) => {
    const updatedTask = {
      ...task,
      dateAssigned: currentDate,
      pointsValue: task.difficulty === 'Hard' ? 20 : task.difficulty === 'Medium' ? 15 : 10,
      penaltyAmount: 50
    };
    setDailyTask(updatedTask);
    showToast(`Updated today's task to '${task.title}'!`, 'info');
  };

  // Toggle manual solved status for a member on current date
  const handleToggleManualSolved = (member) => {
    setMembers(prev => prev.map(m => {
      if (m.id !== member.id) return m;

      const dayLog = m.history[currentDate] || {};
      const currentlySolved = !!dayLog.solved;

      let newStreak = m.currentStreak;
      let newPoints = m.totalPoints;
      let newSolvedCount = m.solvedCount;

      if (!currentlySolved) {
        // Mark as solved
        newStreak += 1;
        newPoints += (dailyTask.pointsValue || 10);
        newSolvedCount += 1;
        showToast(`🎉 ${m.name} completed '${dailyTask.title}'! +${dailyTask.pointsValue || 10} pts`, 'success');
      } else {
        // Undo solve
        newStreak = Math.max(0, newStreak - 1);
        newPoints = Math.max(0, newPoints - (dailyTask.pointsValue || 10));
        newSolvedCount = Math.max(0, newSolvedCount - 1);
        showToast(`Marked ${m.name} as pending.`, 'info');
      }

      return {
        ...m,
        currentStreak: newStreak,
        totalPoints: newPoints,
        solvedCount: newSolvedCount,
        history: {
          ...m.history,
          [currentDate]: {
            solved: !currentlySolved,
            titleSlug: dailyTask.titleSlug,
            verifiedAt: !currentlySolved ? new Date().toISOString() : null,
            penaltyApplied: false
          }
        }
      };
    }));
  };

  // Apply ₹50 Miss Penalty to a member who failed to solve target
  const handleApplyPenalty = (member) => {
    setMembers(prev => prev.map(m => {
      if (m.id !== member.id) return m;

      const fineAmount = dailyTask.penaltyAmount || 50;
      const newDeposit = Math.max(0, m.depositBalance - fineAmount);
      const newPenaltiesPaid = (m.penaltiesPaid || 0) + fineAmount;

      showToast(`🔻 Applied ₹${fineAmount} penalty fine to ${m.name} for missing daily task!`, 'danger');

      return {
        ...m,
        depositBalance: newDeposit,
        penaltiesPaid: newPenaltiesPaid,
        currentStreak: 0, // Streak resets on penalty
        history: {
          ...m.history,
          [currentDate]: {
            solved: false,
            penaltyApplied: true,
            penaltyAmount: fineAmount,
            appliedAt: new Date().toISOString()
          }
        }
      };
    }));
  };

  // Verify single member via LeetCode API
  const handleVerifyMember = async (member) => {
    showToast(`Checking LeetCode API for @${member.leetcodeUsername}...`, 'info');

    const result = await verifyDailySubmission(member.leetcodeUsername, dailyTask.titleSlug, currentDate);

    if (result.verified) {
      // If not already solved, update state
      if (!member.history[currentDate]?.solved) {
        handleToggleManualSolved(member);
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

  // Auto-verify all members in parallel
  const handleVerifyAllMembers = async () => {
    showToast(`Verifying all members against LeetCode GraphQL...`, 'info');
    let verifiedCount = 0;

    for (const member of members) {
      if (!member.history[currentDate]?.solved) {
        const result = await verifyDailySubmission(member.leetcodeUsername, dailyTask.titleSlug, currentDate);
        if (result.verified) {
          handleToggleManualSolved(member);
          verifiedCount++;
        }
      }
    }

    if (verifiedCount > 0) {
      showToast(`Verified ${verifiedCount} new member submissions!`, 'success');
    } else {
      showToast(`Completed verification check across all members.`, 'info');
    }
  };

  return (
    <div className="app-container">
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
        onOpenAddMember={() => setIsAddMemberOpen(true)}
        onOpenSheetBrowser={() => setIsSheetBrowserOpen(true)}
        onOpenPenaltyModal={() => setIsPenaltyModalOpen(true)}
        currentDate={currentDate}
        onDateChange={setCurrentDate}
      />

      <main className="main-content">
        {/* Daily Assigned Problem Card */}
        <DailyChallengeCard 
          dailyTask={dailyTask}
          onOpenSheetBrowser={() => setIsSheetBrowserOpen(true)}
          members={members}
          onVerifyAll={handleVerifyAllMembers}
        />

        {/* Group Leaderboard & Deposit Balances */}
        <Leaderboard 
          members={members}
          dailyTask={dailyTask}
          currentDate={currentDate}
          onVerifyMember={handleVerifyMember}
          onToggleManualSolved={handleToggleManualSolved}
          onApplyPenalty={handleApplyPenalty}
          onSelectMember={setSelectedMemberDetail}
        />
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>CodeStake DSA Tracker — Powered by LeetCode GraphQL & Striver / NeetCode Curricula</p>
      </footer>

      {/* Modals */}
      {isAddMemberOpen && (
        <MemberManagementModal 
          onAddMember={handleAddMember}
          onClose={() => setIsAddMemberOpen(false)}
        />
      )}

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
    </div>
  );
}

export default App;
