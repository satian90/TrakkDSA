import React, { useState } from 'react';
import { NEETCODE_150, STRIVER_AZ_SHEET } from '../data/dsaProblems';
import { Search, ExternalLink, Check, BookOpen, PlusCircle } from 'lucide-react';

export default function ProblemSheetBrowser({ currentTask, onSelectTask, onClose }) {
  const [activeSheet, setActiveSheet] = useState('NeetCode 150'); // 'NeetCode 150' | 'Striver A-Z' | 'Custom'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');

  // Custom task form states
  const [customPlatform, setCustomPlatform] = useState('LeetCode');
  const [customTitle, setCustomTitle] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [customCategory, setCustomCategory] = useState('General');
  const [customDifficulty, setCustomDifficulty] = useState('Medium');

  const problemsList = activeSheet === 'NeetCode 150' ? NEETCODE_150 : STRIVER_AZ_SHEET;

  const filteredProblems = problemsList.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDiff = selectedDifficulty === 'All' || p.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();
    return matchesSearch && matchesDiff;
  });

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customTitle.trim() || !customSlug.trim() || !customUrl.trim()) {
      alert("Please fill in all required fields.");
      return;
    }

    const newCustomTask = {
      id: `custom-${Date.now()}`,
      sheet: "Custom Challenge",
      category: customCategory.trim(),
      title: customTitle.trim(),
      titleSlug: customSlug.trim(),
      difficulty: customDifficulty,
      leetcodeUrl: customUrl.trim(),
      platform: customPlatform
    };

    onSelectTask(newCustomTask);
    onClose();
  };

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
            <button 
              className={`sheet-tab ${activeSheet === 'Custom' ? 'active' : ''}`}
              onClick={() => setActiveSheet('Custom')}
            >
              ✏️ Custom Challenge
            </button>
          </div>

          {activeSheet !== 'Custom' ? (
            <>
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
                              onSelectTask({ ...p, platform: 'LeetCode' });
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
            </>
          ) : (
            <form onSubmit={handleCustomSubmit} className="custom-problem-form" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '10px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label style={{ fontWeight: '600', marginBottom: '6px', display: 'block' }}>Platform</label>
                  <select 
                    value={customPlatform} 
                    onChange={(e) => setCustomPlatform(e.target.value)}
                    className="form-control"
                    style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
                  >
                    <option value="LeetCode">LeetCode</option>
                    <option value="Codeforces">Codeforces</option>
                  </select>
                </div>

                <div className="form-group">
                  <label style={{ fontWeight: '600', marginBottom: '6px', display: 'block' }}>Difficulty</label>
                  <select 
                    value={customDifficulty} 
                    onChange={(e) => setCustomDifficulty(e.target.value)}
                    className="form-control"
                    style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label style={{ fontWeight: '600', marginBottom: '6px', display: 'block' }}>Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Watermelon" 
                    value={customTitle} 
                    onChange={(e) => setCustomTitle(e.target.value)}
                    required
                    className="form-control"
                    style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontWeight: '600', marginBottom: '6px', display: 'block' }}>Problem ID / Title Slug</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 4A (CF) or watermelon (LC)" 
                    value={customSlug} 
                    onChange={(e) => setCustomSlug(e.target.value)}
                    required
                    className="form-control"
                    style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
                  />
                  <small style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Required for automated solution verification.</small>
                </div>
              </div>

              <div className="form-group">
                <label style={{ fontWeight: '600', marginBottom: '6px', display: 'block' }}>Problem URL</label>
                <input 
                  type="url" 
                  placeholder="e.g. https://codeforces.com/problemset/problem/4/A" 
                  value={customUrl} 
                  onChange={(e) => setCustomUrl(e.target.value)}
                  required
                  className="form-control"
                  style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
                />
              </div>

              <div className="form-group">
                <label style={{ fontWeight: '600', marginBottom: '6px', display: 'block' }}>Category / Topic</label>
                <input 
                  type="text" 
                  placeholder="e.g. Graphs, Dynamic Programming" 
                  value={customCategory} 
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="form-control"
                  style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '10px', alignSelf: 'flex-start' }}>
                <PlusCircle size={16} />
                <span>Assign Custom Challenge</span>
              </button>
            </form>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}
