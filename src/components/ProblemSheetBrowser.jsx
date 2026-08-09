import React, { useState } from 'react';
import { BookOpen, PlusCircle } from 'lucide-react';

export default function ProblemSheetBrowser({ currentTask, onSelectTask, onClose }) {
  // Custom task form states
  const [customPlatform, setCustomPlatform] = useState('LeetCode');
  const [customTitle, setCustomTitle] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [customCategory, setCustomCategory] = useState('General');
  const [customDifficulty, setCustomDifficulty] = useState('Medium');

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customTitle.trim() || !customSlug.trim() || !customUrl.trim()) {
      alert("Please fill in all required fields.");
      return;
    }

    const newCustomTask = {
      id: `custom-${Date.now()}`,
      sheet: "Emergency Override",
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
            <h2>Emergency Override</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <p style={{ marginBottom: '16px', color: 'var(--text-muted)' }}>
            Use this to manually set today's task if the automated assignment fails.
          </p>
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
                  placeholder="e.g. Two Sum" 
                  value={customTitle} 
                  onChange={(e) => setCustomTitle(e.target.value)}
                  required
                  className="form-control"
                  style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
                />
              </div>

              <div className="form-group">
                <label style={{ fontWeight: '600', marginBottom: '6px', display: 'block' }}>Title Slug</label>
                <input 
                  type="text" 
                  placeholder="e.g. two-sum" 
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
                placeholder="e.g. https://leetcode.com/problems/two-sum" 
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
                placeholder="e.g. Arrays" 
                value={customCategory} 
                onChange={(e) => setCustomCategory(e.target.value)}
                className="form-control"
                style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '10px', alignSelf: 'flex-start' }}>
              <PlusCircle size={16} />
              <span>Assign Override Challenge</span>
            </button>
          </form>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}
