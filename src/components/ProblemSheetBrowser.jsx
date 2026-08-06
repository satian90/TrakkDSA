import React, { useState } from 'react';
import { NEETCODE_150, STRIVER_AZ_SHEET } from '../data/dsaProblems';
import { Search, ExternalLink, Check, BookOpen } from 'lucide-react';

export default function ProblemSheetBrowser({ currentTask, onSelectTask, onClose }) {
  const [activeSheet, setActiveSheet] = useState('NeetCode 150');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');

  const problemsList = activeSheet === 'NeetCode 150' ? NEETCODE_150 : STRIVER_AZ_SHEET;

  const filteredProblems = problemsList.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDiff = selectedDifficulty === 'All' || p.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();
    return matchesSearch && matchesDiff;
  });

  return (
    <div className="modal-overlay">
      <div className="modal-content sheet-modal">
        <div className="modal-header">
          <div className="title-with-icon">
            <BookOpen className="text-accent" size={24} />
            <h2>DSA Problem Sheets Curriculum</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="sheet-selector-tabs">
            <button 
              className={`sheet-tab ${activeSheet === 'NeetCode 150' ? 'active' : ''}`}
              onClick={() => setActiveSheet('NeetCode 150')}
            >
              🚀 NeetCode 150
            </button>
            <button 
              className={`sheet-tab ${activeSheet === 'Striver A-Z' ? 'active' : ''}`}
              onClick={() => setActiveSheet('Striver A-Z')}
            >
              🔥 Striver's A-to-Z DSA Sheet
            </button>
          </div>

          <div className="filters-row">
            <div className="search-input-wrapper">
              <Search size={16} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search problem title or category..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="difficulty-filter">
              {['All', 'Easy', 'Medium', 'Hard'].map(diff => (
                <button 
                  key={diff}
                  className={`diff-filter-btn ${selectedDifficulty === diff ? 'active' : ''}`}
                  onClick={() => setSelectedDifficulty(diff)}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          <div className="problems-grid">
            {filteredProblems.map(p => {
              const isCurrent = currentTask.titleSlug === p.titleSlug;
              return (
                <div key={p.id} className={`problem-item-card ${isCurrent ? 'selected-task' : ''}`}>
                  <div className="item-header">
                    <span className={`difficulty-badge badge-${p.difficulty.toLowerCase()}`}>
                      {p.difficulty}
                    </span>
                    <span className="item-category">{p.category}</span>
                  </div>

                  <h3 className="item-title">{p.title}</h3>

                  <div className="item-footer">
                    <a 
                      href={p.leetcodeUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="item-link"
                    >
                      LeetCode <ExternalLink size={12} />
                    </a>

                    {isCurrent ? (
                      <span className="assigned-badge">
                        <Check size={14} /> Assigned Today
                      </span>
                    ) : (
                      <button 
                        className="btn btn-xs btn-accent" 
                        onClick={() => {
                          onSelectTask(p);
                          onClose();
                        }}
                      >
                        Set as Today's Task
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}
